from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from django.utils.text import slugify

class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        required=True,
        max_length=80,
        validators=[UniqueValidator(queryset=User.objects.all(), message="Este email ya está registrado.")]
    )
    password = serializers.CharField(write_only=True, min_length=8, max_length=64)
    password2 = serializers.CharField(write_only=True, min_length=8, max_length=64)

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
        uname = base
        i = 1
        while User.objects.filter(username=uname).exists():
            i += 1
            uname = f"{base}{i}"
        return User.objects.create_user(username=uname, email=email, password=validated_data["password"])
