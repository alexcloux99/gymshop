from django.db.models import Q, Avg
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Product, Reviews
from .serializers import ProductSerializer, ReviewSerializer
from backend.pagination import CustomPagination


@api_view(["GET"])
def get_products(request):
    qs = Product.objects.all()

    # filtrar por categoría solo si es válida
    cat = (request.query_params.get("category") or "").strip()
    VALID = {"men", "women", "accessories"}   # ajusta a tus categorías reales
    if cat in VALID:
        qs = qs.filter(category=cat)

    # búsqueda
    q = (request.query_params.get("q") or "").strip()
    if q:
        qs = qs.filter(Q(name__icontains=q) | Q(description__icontains=q))

    # orden
    ordering = (request.query_params.get("ordering") or "").strip()
    order_map = {
        "price": "price",
        "-price": "-price",
        "name": "name",
        "-name": "-name",
        # el modelo no tiene created, así que lo mapeamos a id
        "created": "id",
        "-created": "-id",
    }
    if ordering in order_map:
        qs = qs.order_by(order_map[ordering])

    # paginación
    paginator = CustomPagination()
    page = paginator.paginate_queryset(qs, request)
    ser = ProductSerializer(page, many=True, context={"request": request})
    return paginator.get_paginated_response(ser.data)


@api_view(["GET"])
def get_product(request, slug):
    p = get_object_or_404(Product, slug=slug)
    ser = ProductSerializer(p, context={"request": request})
    return Response(ser.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_review(request, pk):
    # con SQLite el select_for_update se ignora; ok para local
    product = get_object_or_404(Product, pk=pk)

    ser = ReviewSerializer(data=request.data)
    if not ser.is_valid():
        return Response(ser.errors, status=status.HTTP_400_BAD_REQUEST)

    Reviews.objects.create(
        product=product,
        user=request.user,
        rating=ser.validated_data["rating"],
        description=ser.validated_data.get("description", "")
    )

    # Si quieres devolver rating y contador actualizados, calcúlalos pero NO los guardes en Product
    agg = Reviews.objects.filter(product=product).aggregate(avg=Avg("rating"))
    resp = {
        "ok": True,
        "rating": agg["avg"] or 0,
        "num_reviews": Reviews.objects.filter(product=product).count(),
    }
    return Response(resp, status=status.HTTP_201_CREATED)
