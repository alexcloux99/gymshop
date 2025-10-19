from django.shortcuts import render
from rest_framework import generics, permissions
from .serializers import RegisterSerializer

# Create your views here.
class RegisterAPIView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer