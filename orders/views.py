from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status

from .models import Order, OrderItem
from products.models import Product
from .serializers import OrderSerializer
# Create your views here.
# Añadimos endpoint para simular el pago del pedido y cambiar su estdado "pagado"

class CheckoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        items = request.data.get("items", [])
        if not items:
            return Response({"detail": "Carrito vacío"}, status=400)

        order = Order.objects.create(user=request.user, status="pending", total=0)
        total = 0
        for it in items:
            try:
                p = Product.objects.get(pk=it["product_id"])
            except Product.DoesNotExist:
                return Response({"detail": f"Producto {it['product_id']} no existe"}, status=400)
            qty = int(it.get("qty", 1))
            OrderItem.objects.create(order=order, product=p, qty=qty, price=p.price)
            total += p.price * qty

        order.total = total
        order.save()
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