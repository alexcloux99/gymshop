from rest_framework import generics
from django.db.models import Q
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

        q = self.request.query_params.get("q")
        if q:
            qs = qs.filter(Q(name__icontains=q) | Q(description__icontains=q))

        ordering = self.request.query_params.get("ordering") 
        if ordering in {"name","-name","price","-price","created_at","-created_at"}:
            qs = qs.order_by(ordering)

        return qs

class ProductDetailAPIView(generics.RetrieveAPIView):
    serializer_class = ProductSerializer
    lookup_field = "slug"
    queryset = Product.objects.filter(active=True)

    def get_queryset(self):
        ctx = super().get_queryset()
        ctx["request"] = self.request 
        return ctx