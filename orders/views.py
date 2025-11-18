from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from django.db import transaction
from .models import Order, OrderItem
from products.models import Product
from .serializers import OrderSerializer
# Create your views here.
# Añadimos endpoint para simular el pago del pedido y cambiar su estdado "pagado"

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
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
        except Order.DoesNotExist:
            return Response({"detail": "No encontrado"}, status=404)
        order.status = "paid"
        order.save()
        return Response(OrderSerializer(order).data)