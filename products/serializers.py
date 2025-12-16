from django.db.models import Avg
from django.db.utils import OperationalError, ProgrammingError
from rest_framework import serializers
from .models import Product, Reviews

class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source="user.email")

    class Meta:
        model = Reviews
        fields = ["id", "rating", "description", "created", "username"]

class ProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    created = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    num_reviews = serializers.SerializerMethodField()
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = [
            "id", "slug", "name", "image", "category", "description",
            "price", "stock", "created", "rating", "num_reviews", "reviews",
        ]

    def get_image(self, obj):
        img = getattr(obj, "image", None)
        if not img:
            return None
        request = self.context.get("request")
        url = img.url
        return request.build_absolute_uri(url) if request else url

    def get_created(self, obj):
        # Tu modelo tiene created_at
        return getattr(obj, "created_at", None)

    def get_rating(self, obj):
        try:
            agg = Reviews.objects.filter(product=obj).aggregate(avg=Avg("rating"))
            return float(agg["avg"] or 0)
        except (OperationalError, ProgrammingError):
            return 0.0

    def get_num_reviews(self, obj):
        try:
            return Reviews.objects.filter(product=obj).count()
        except (OperationalError, ProgrammingError):
            return 0
