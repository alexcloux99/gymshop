from django.shortcuts import render
from rest_framework import generics, permissions
from .serializers import CheckoutSerializer, OrderSerializer
from .models import Order

# Create your views here.

class CheckoutAPIView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CheckoutSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        out = OrderSerializer(order)
        from rest_framework.response import Response
        return Response(out.data, status=201)

class MyOrdersAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by("-created_at")