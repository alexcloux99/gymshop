from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from .serializers import RegisterSerializer

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = "email"  # aceptamos email en la petición

    def validate(self, attrs):
        email = attrs.get("email", "").lower()
        try:
            user = User.objects.get(email=email)
            attrs["username"] = user.username
        except User.DoesNotExist:
            pass
        return super().validate(attrs)

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer
