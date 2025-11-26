from rest_framework.validators import UniqueValidator
from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from django.utils.text import slugify

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True, max_length=80,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Email ya registrado")]
    )
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "password", "password2"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password2"]:
            raise serializers.ValidationError({"password2": "Las contraseñas no coinciden."})
        validate_password(attrs["password"])
        return attrs

    def create(self, validated_data):
        email = validated_data["email"].strip().lower()
        base = slugify(email.split("@")[0]) or "user"
        username = base
        i = 1
        while User.objects.filter(username=username).exists():
            i += 1
            username = f"{base}{i}"
        return User.objects.create_user(
            username=username,
            email=email,
            password=validated_data["password"]
        )

class UserPublicSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email"]