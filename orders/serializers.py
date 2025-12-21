from decimal import Decimal
from rest_framework import serializers
from .models import Order, OrderItem
from products.models import Product

# ---------- OUTPUT ----------
class OrderItemOutputSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source="product.name")
    image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "qty", "price", "image"]

    def get_image(self, obj):
        img = getattr(obj.product, "image", None)
        if not img:
            return None
        req = self.context.get("request")
        url = img.url
        return req.build_absolute_uri(url) if req else url


class OrderSerializer(serializers.ModelSerializer):
    # No dependemos del related_name; lo armamos nosotros
    items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ["id", "status", "subtotal", "shipping", "total", "paid_at", "created_at", "items"]

    def get_items(self, obj):
        qs = OrderItem.objects.filter(order=obj)
        return OrderItemOutputSerializer(qs, many=True, context=self.context).data


# ---------- INPUT (checkout) ----------
class OrderItemInputSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    qty = serializers.IntegerField(min_value=1)


class CheckoutSerializer(serializers.Serializer):
    items = OrderItemInputSerializer(many=True)

    def validate(self, data):
        ids = [it["product_id"] for it in data["items"]]
        prods = {p.id: p for p in Product.objects.filter(id__in=ids, active=True)}

        for it in data["items"]:
            p = prods.get(it["product_id"])
            if not p:
                raise serializers.ValidationError(f"Producto {it['product_id']} no existe")
            if p.stock < it["qty"]:
                raise serializers.ValidationError(f"Stock insuficiente para {p.name}")

        # guardo para create()
        self._prods = prods
        return data

    def create(self, validated_data):
        user = self.context["request"].user
        order = Order.objects.create(user=user, status="pending", total=Decimal("0"))
        total = Decimal("0")

        for it in validated_data["items"]:
            p = self._prods[it["product_id"]]
            qty = it["qty"]
            OrderItem.objects.create(order=order, product=p, qty=qty, price=p.price)
            total += p.price * qty
            p.stock -= qty
            p.save(update_fields=["stock"])

        order.total = total
        order.save(update_fields=["total"])
        return order
