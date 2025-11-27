from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer

class LoginWithEmailAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = (request.data.get("email") or "").strip().lower()
        password = request.data.get("password") or ""

        # buscamos por email; si no hay o la pass no coincide falla 
        try:
            u = User.objects.get(email=email)
        except User.DoesNotExist:
            raise AuthenticationFailed("Credenciales inválidas")

        if not u.check_password(password):
            raise AuthenticationFailed("Credenciales inválidas")

        refresh = RefreshToken.for_user(u)
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })

# Registrar usuario (igual que tenías)
class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request):
        u = request.user
        return Response({"id": u.id, "username": u.username, "email": u.email, "is_staff": u.is_staff})

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def post(self, request):
        from rest_framework_simplejwt.tokens import RefreshToken
        token = request.data.get("refresh")
        if token:
            try:
                RefreshToken(token).blacklist()
            except Exception:
                pass
        return Response({"status": "ok"})
