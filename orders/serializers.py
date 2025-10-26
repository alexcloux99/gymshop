from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product
from decimal import Decimal

class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    qty = serializers.IntegerField(min_value=1)

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)
    class Meta:
        model = OrderItem
        fields = ["product", "product_name", "qty", "price"]

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    class Meta:
        model = Order
        fields = ["id","status","total","created_at","items"]

class CheckoutSerializer(serializers.Serializer):
    items = OrderItemInputSerializer(many=True)

    def validate(self, data):
        # valida existencia y stock
        for it in data["items"]:
            try:
                product = Product.objects.get(pk=it["product_id"], active=True)
            except Product.DoesNotExist:
                raise serializers.ValidationError(f"Producto {it['product_id']} no existe")
            if product.stock < it["qty"]:
                raise serializers.ValidationError(f"Stock insuficiente para {product.name}")
        return data

    def create(self, validated_data):
        user = self.context["request"].user
        order = Order.objects.create(user=user, status="pending", total=0)
        total = Decimal("0.00")
        for it in validated_data["items"]:
            product = Product.objects.get(pk=it["product_id"])
            qty = it["qty"]
            price = product.price
            OrderItem.objects.create(order=order, product=product, qty=qty, price=price)
            total += price * qty
            product.stock -= qty
            product.save(update_fields=["stock"])
        order.total = total
        order.save(update_fields=["total"])
        return order
