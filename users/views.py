from rest_framework import generics, permissions
from django.contrib.auth import get_user_model
from rest_framework.serializers import ModelSerializer, CharField
# Create your views here.
User = get_user_model()
class RegisterSerializer(ModelSerializer):
    password = CharField(write_only=True)
    class Meta:
        model = User
        fields = ["username", "email", "password"]
    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"],
        )

class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]