from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework import generics, status, permissions
from django.db import transaction
from .models import Order, OrderItem
from products.models import Product
from .serializers import OrderSerializer
from django.shortcuts import get_object_or_404 
from rest_framework.serializers import ModelSerializer, CharField, EmailField
from django.contrib.auth import get_user_model
from rest_framework.validators import UniqueValidator
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from decimal import Decimal

User = get_user_model()

# --- REGISTRO DE USUARIOS ---
class RegisterSerializer(ModelSerializer):
    email = EmailField(
        required=True,
        max_length=80,
        allow_blank=False,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Este email ya está registrado.")]
    )
    password = CharField(write_only=True, min_length=8, max_length=128)

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "password"]

    def create(self, validated_data):
        email = validated_data["email"].strip().lower()
        return User.objects.create_user(
            username=email, # Usamos el email como username para el login
            email=email,
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", "")
        )

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def create_order(request):
    """ Crea un pedido y descuenta stock """
    items = request.data.get('items') or []
    if not items:
        return Response({'detail': 'Carrito vacío'}, status=400)

    order = Order.objects.create(
        user=request.user, 
        status="pending",
        first_name=request.data.get('first_name'),
        last_name=request.data.get('last_name'),
        address_1=request.data.get('address_1'),
        address_2=request.data.get('address_2'),
        city=request.data.get('city'),
        state=request.data.get('state'),
        postal_code=request.data.get('postal_code'),
        phone=request.data.get('phone'),
        payment_method=request.data.get('payment_method', 'paypal')
    )
    
    total_acumulado = Decimal('0.00')

    for it in items:
        pid = it.get('product_id') or it.get('product')   
        qty = int(it.get('qty', 1))
        talla_elegida = it.get('size', 'N/A') 

        # Buscamos el producto y bloqueamos la fila para el stock
        p = Product.objects.select_for_update().get(pk=pid)
        
        if p.stock < qty:
            return Response({'detail': f'Sin stock suficiente para {p.name}'}, status=400)
        
        p.stock -= qty
        p.save(update_fields=['stock'])

        OrderItem.objects.create(
            order=order, 
            product=p, 
            qty=qty, 
            price=p.price,
            size=talla_elegida 
        )
        total_acumulado += p.price * qty

    order.total = total_acumulado
    order.save(update_fields=['total'])
    
    return Response(OrderSerializer(order).data, status=201)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):
    """ Lista de pedidos del usuario"""
    qs = Order.objects.filter(user=request.user).order_by('-created_at')
    ser = OrderSerializer(qs, many=True)
    return Response(ser.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, pk):
    """ Detalle de los pedidos del usuario"""
    o = get_object_or_404(Order, pk=pk, user=request.user)
    return Response(OrderSerializer(o).data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay_order_paypal(request, pk):
    order = get_object_or_404(Order, pk=pk, user=request.user)
    
    if order.status == "paid":
        return Response({"detail": "El pedido ya está pagado."}, status=400)

    order.status = "paid"
    order.paid_at = timezone.now()
    
    payment_id = request.data.get('id') 
    if payment_id:
        pass

    order.save()
    return Response({"status": "ok", "message": "Pago confirmado en GymShop"})

@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_mark_paid(request, pk):
    """ Permite a un admin marcar como pagado manualmente """
    o = get_object_or_404(Order, pk=pk)
    o.status = 'paid'
    o.paid_at = timezone.now()
    o.save()
    return Response({'ok': True})