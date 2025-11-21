from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import generics, status, permissions
from django.db import transaction
from .models import Order, OrderItem
from products.models import Product
from .serializers import OrderSerializer
from django.shortcuts import get_object_or_404 
from rest_framework.serializers import ModelSerializer, CharField, EmailField, ValidationError
from django.contrib.auth import get_user_model
from rest_framework.validators import UniqueValidator
from django.core.validators import RegexValidator
# Create your views here.
# Añadimos endpoint para simular el pago del pedido y cambiar su estdado "pagado"


User = get_user_model()
# Validamos el email
email_regex = RegexValidator(
    regex=r"^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,24}$",
    message="Email inválido."
)

class RegisterSerializer(ModelSerializer):
    email = EmailField(
        required=True,
        max_length=80,
        allow_blank=False,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Este email ya está registrado.")]
    )
    password = CharField(write_only=True, min_length=8, max_length=12)

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "password"]

    def validate(self, attrs):
        # por si acaso, que no nos lleguen espacios raros
        for k in ["first_name", "last_name"]:
            if k in attrs and isinstance(attrs[k], str):
                attrs[k] = attrs[k].strip()
        return attrs

    def create(self, validated_data):
        email = validated_data["email"].strip().lower()
        return User.objects.create_user(
            username=email,           # <<-- username = email
            email=email,
            password=validated_data["password"],
        )

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class CheckoutAPIView(APIView):
    permission_classes = [IsAuthenticated]
    # usamos transacciones para evitar problemas de concurrencia y stock
    @transaction.atomic
    def post(self, request):
        items = request.data.get("items", [])
        if not items:
            return Response({"detail": "Carrito vacío"}, status=400)

        ids = [int(i["product_id"]) for i in items]
        prod_map = {p.id: p for p in Product.objects.select_for_update().filter(id__in=ids)}

        # Validaciones
        lines = []
        for it in items:
            pid = int(it["product_id"])
            qty = int(it.get("qty", 1))
            p = prod_map.get(pid)
            if not p:
                return Response({"detail": f"Producto {pid} no existe"}, status=400)
            if qty <= 0:
                return Response({"detail": f"Cantidad inválida para {p.name}"}, status=400)
            if p.stock < qty:
                return Response({"detail": f"No hay stock {p.name}"}, status=400)
            lines.append((p, qty))

        order = Order.objects.create(user=request.user, status="pending", total=0)
        total = 0
        for p, qty in lines:
            OrderItem.objects.create(order=order, product=p, qty=qty, price=p.price)
            p.stock -= qty
            p.save(update_fields=["stock"])
            total += p.price * qty

        order.total = total
        order.save(update_fields=["total"])
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

class MyOrdersAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by("-created_at")

class MarkPaidAPIView(APIView):
    # Solo quien tenga  permisos de admin/staff puede marcar como pagado el pedido
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        order = get_object_or_404(Order, pk=pk)
        if order.status == "paid":
            return Response({"detail": "El pedido ya está pagado."}, status=status.HTTP_400_BAD_REQUEST)

        order.status = "paid"
        order.save(update_fields=["status"])
        return Response({"status": "ok", "id": order.id, "new_status": order.status}, status=status.HTTP_200_OK)