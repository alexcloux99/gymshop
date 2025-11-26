from django.contrib.auth.models import User
from rest_framework import generics, permissions
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .serializers import RegisterSerializer
from rest_framework.generics import RetrieveAPIView
from rest_framework.permissions import IsAuthenticated
from .serializers import UserPublicSerializer


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    # Cambiamos el campo de autenticacion a email 
    username_field = 'email'

    def validate(self, attrs):
        email = (attrs.get('email') or '').strip().lower()
        password = attrs.get('password') or ''

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            raise AuthenticationFailed('Email incorrecto.')

        if not user.check_password(password):
            raise AuthenticationFailed('Contraseña incorrecta.')
        
        refresh = self.get_token(user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

class MeView(RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserPublicSerializer

    def get_object(self):
        return self.request.user
