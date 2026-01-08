from django.contrib.auth.models import User
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer
from .models import Profile 
from django.contrib.auth import authenticate

class LoginWithEmailAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        password = request.data.get("password") or ""

        try:
            #  Buscamos al usuario por email 
            user = User.objects.get(email__iexact=email)
            
            # Comprobamos si la contraseña es correcta
            if user.check_password(password):
                if not user.is_active:
                    return Response({"detail": "Usuario inactivo"}, status=401)
                
                # 3. Si todo está ok, generamos el token
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

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        u = request.user
        p, _ = Profile.objects.get_or_create(user=u)
        return Response({
            "id": u.id, "first_name": u.first_name, "last_name": u.last_name, "email": u.email,
            "phone": p.phone, "address_1": p.address_1, "address_2": p.address_2,
            "city": p.city, "state": p.state, "postal_code": p.postal_code, "country": p.country
        })

@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    u = request.user
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