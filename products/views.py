from django.shortcuts import render
from rest_framework import generics
from .models import Product
from .serializers import ProductSerializer

# Create your views here.
class ProductListAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer

    def get_queryset(self):
        qs = Product.objects.filter(active=True)
        category = self.request.query_params.get("category")
        if category in {"men","women","accessories"}:
            qs = qs.filter(category=category)
        return qs

class ProductDetailAPIView(generics.RetrieveAPIView):
    serializer_class = ProductSerializer
    lookup_field = "slug"
    queryset = Product.objects.filter(active=True)