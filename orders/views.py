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
from django.core.mail import send_mail
from rest_framework_simplejwt.tokens import RefreshToken

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
            username=email, 
            email=email,
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", "")
        )

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
# --- LOGIN DE USUARIOS ---
class LoginWithEmailAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        password = request.data.get("password") or ""
        try:
            user = User.objects.get(email__iexact=email)
            if user.check_password(password):
                if not user.is_active:
                    return Response({"detail": "Usuario inactivo"}, status=401)
                refresh = RefreshToken.for_user(user)
                return Response({
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "first_name": user.first_name,
                        "last_name": user.last_name
                    }
                })
            else:
                return Response({"detail": "Contraseña incorrecta"}, status=401)
        except User.DoesNotExist:
            return Response({"detail": "El email no está registrado"}, status=401)
# --- GESTIÓN DE PEDIDOS ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@transaction.atomic
def create_order(request):
    from products.models import ProductVariant
    items = request.data.get('items') or []
    if not items:
        return Response({'detail': 'Carrito vacío'}, status=400)
    payment_method = request.data.get('payment_method', 'paypal')

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
        payment_method=payment_method
    )
    
    subtotal = Decimal('0.00') 

    for it in items:
        pid = it.get('product_id') or it.get('product')   
        qty = int(it.get('qty', 1))
        talla_elegida = it.get('size', 'N/A') 

        try:
            variant = ProductVariant.objects.select_for_update().get(product_id=pid, size=talla_elegida)
            if variant.stock < qty:
                return Response({'detail': f'Sin stock suficiente para la talla {talla_elegida} de este artículo'}, status=400)
            
            variant.stock -= qty
            variant.save()

            OrderItem.objects.create(
                order=order, 
                product=variant.product, 
                qty=qty, 
                price=variant.product.price,
                size=talla_elegida 
            )
            subtotal += variant.product.price * qty
        except ProductVariant.DoesNotExist:
            return Response({'detail': f'La talla {talla_elegida} no existe para este producto'}, status=400)

    shipping_cost = Decimal('0.00') if subtotal >= 50 else Decimal('4.99')
    order.total = subtotal + shipping_cost
    order.save(update_fields=['total'])
    if payment_method == "contrareembolso":
        print("\n" + "="*50)
        print(f"📦 NUEVO PEDIDO CONTRA-REEMBOLSO")
        print(f"ID: #{order.id}")
        print(f"CLIENTE: {request.user.email}")
        print(f"TOTAL: {order.total} €")
        print(f"DIRECCIÓN: {order.address_1}, {order.city}")
        print("="*50 + "\n")
        try:
            subject = f'Confirmación de pedido AMC FIT #{order.id} (Contra-reembolso)'
            message = f'Hola {order.user.first_name or "cliente"},\n\n' \
                      f'Hemos recibido tu pedido por Contra-reembolso correctamente.\n' \
                      f'Número de pedido: #{order.id}\n' \
                      f'Pagarás un total de {order.total} € al recibir el paquete en tu domicilio.\n\n' \
                      f'¡Gracias por confiar en AMC FIT!'
            send_mail(subject, message, 'soporte@amcfit.com', [order.user.email])
        except Exception as e:
            print(f"Error enviando email contra-reembolso: {e}")
    
    return Response(OrderSerializer(order).data, status=201)
# --- VISTA DE PEDIDOS DEL USUARIO ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):
    """ Lista de pedidos del usuario"""
    qs = Order.objects.filter(user=request.user).order_by('-created_at')
    ser = OrderSerializer(qs, many=True)
    return Response(ser.data)
# --- DETALLE DE PEDIDO DEL USUARIO ---
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def order_detail(request, pk):
    """ Detalle de los pedidos del usuario"""
    o = get_object_or_404(Order, pk=pk, user=request.user)
    return Response(OrderSerializer(o).data)
# --- CONFIRMAR PAGO PAYPAL ---
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def pay_order_paypal(request, pk):
    order = get_object_or_404(Order, pk=pk, user=request.user)
    if order.status == "paid":
        return Response({"detail": "El pedido ya está pagado."}, status=400)

    order.status = "paid"
    order.paid_at = timezone.now()
    order.save()
    print("\n" + "*"*50)
    print(f"💰 PAGO CONFIRMADO POR PAYPAL")
    print(f"ORDEN: #{order.id}")
    print(f"CLIENTE: {order.user.email}")
    print(f"IMPORTE: {order.total} €")
    print("*"*50 + "\n")

    try:
        subject = f'Confirmación de pago AMC FIT #{order.id}'
        message = f'Hola {order.user.first_name or "cliente"},\n\n' \
                  f'¡Gracias por tu compra en AMC FIT!\n' \
                  f'Hemos recibido tu pago correctamente para el pedido #{order.id}.\n' \
                  f'Total: {order.total} €\n\n' \
                  f'En breve recibirás un número de seguimiento. ¡Gracias :)!'
        send_mail(subject, message, 'soporte@amcfit.com', [order.user.email])
    except Exception as e:
        print(f"Error enviando email PayPal: {e}")

    return Response({"status": "ok", "message": "Pago confirmado y email enviado"})

# --- Recuperar contraseña ---
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def forgot_password(request):
    email = request.data.get('email', '').strip().lower()
    try:
        user = User.objects.get(email__iexact=email)
        subject = 'Recuperar contraseña - AMC FIT'
        message = f'Hola {user.first_name or user.username},\n\n' \
                  f'Has solicitado restablecer tu contraseña en AMC FIT.\n' \
                  f'Haz clic en el siguiente enlace para elegir una nueva password:\n' \
                  f'http://localhost:5173/reset-password/simulacion-token-123\n\n' \
                  f'Si no has sido tú, ignora este mensaje.'
        send_mail(subject, message, 'soporte@amcfit.com', [email])
        return Response({"status": "ok"})
    except User.DoesNotExist:
        return Response({"detail": "Email no encontrado"}, status=404)
# --- Confirmar nueva contraseña ---
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def reset_password_confirm(request):
    email = request.data.get('email', '').strip().lower()
    new_password = request.data.get('password')
    try:
        user = User.objects.get(email__iexact=email)
        user.set_password(new_password)
        user.save()
        return Response({"status": "ok"})
    except User.DoesNotExist:
        return Response({"detail": "Error al procesar"}, status=400)
# --- VISTA PERFIL USUARIO ---
class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        u = request.user
        from .models import Profile
        p, _ = Profile.objects.get_or_create(user=u)
        return Response({
            "id": u.id, "first_name": u.first_name, "last_name": u.last_name, "email": u.email,
            "phone": p.phone, "address_1": p.address_1, "address_2": p.address_2,
            "city": p.city, "state": p.state, "postal_code": p.postal_code, "country": p.country
        })
# --- ACTUALIZAR USUARIO ---
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    u = request.user
    from .models import Profile
    p, _ = Profile.objects.get_or_create(user=u)
    d = request.data
    p.phone = d.get('phone', p.phone)
    p.address_1 = d.get('address_1', p.address_1)
    p.address_2 = d.get('address_2', p.address_2)
    p.city = d.get('city', p.city)
    p.state = d.get('state', p.state)
    p.postal_code = d.get('postal_code', p.postal_code)
    p.country = d.get('country', p.country)
    p.save()
    return Response({"status": "ok"})

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        return Response({"status": "ok"})
@api_view(['POST'])
@permission_classes([IsAdminUser])
def admin_mark_paid(request, pk):
    o = get_object_or_404(Order, pk=pk)
    o.status = 'paid'
    o.paid_at = timezone.now()
    o.save()
    return Response({'ok': True})