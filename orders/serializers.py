from rest_framework import serializers
from .models import Order, OrderItem
from products.serializers import ProductSerializer
from decimal import Decimal

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'qty', 'price', 'size'] 

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = '__all__'

class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    qty = serializers.IntegerField(min_value=1)
    size = serializers.CharField(required=False, allow_blank=True) 

class CheckoutSerializer(serializers.Serializer):
    items = OrderItemInputSerializer(many=True)
    address = serializers.CharField(required=False)
    city = serializers.CharField(required=False)
    postal_code = serializers.CharField(required=False)

    def validate(self, data):
        from products.models import Product
        ids = [it["product_id"] for it in data["items"]]
        prods = {p.id: p for p in Product.objects.filter(id__in=ids, active=True)}

        for it in data["items"]:
            p = prods.get(it["product_id"])
            if not p:
                raise serializers.ValidationError(f"Producto {it['product_id']} no existe")
            if p.stock < it["qty"]:
                raise serializers.ValidationError(f"Stock insuficiente para {p.name}")

        self._prods = prods
        return data

    def create(self, validated_data):
        from products.models import Product 
        user = self.context["request"].user
        order = Order.objects.create(
            user=user, 
            status="pending", 
            address=validated_data.get('address'),
            city=validated_data.get('city'),
            postal_code=validated_data.get('postal_code'),
            total=Decimal("0")
        )
        total = Decimal("0")
        for it in validated_data["items"]:
            p = self._prods[it["product_id"]]
            qty = it["qty"]
            OrderItem.objects.create(
                order=order, 
                product=p, 
                qty=qty, 
                price=p.price,
                size=it.get('size', 'N/A') 
            )
            total += p.price * qty
            p.stock -= qty
            p.save()
            
        order.total = total
        order.save()
        return order