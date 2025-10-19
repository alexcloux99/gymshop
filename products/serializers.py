from rest_framework import serializers
from .models import Product

class ProductSerializer(serializers.ModelSerializer):
    category_label = serializers.CharField(source="get_category_display", read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            "id","name","slug","description","price","stock","category","category_label",
            "image_url","active","created_at",
        ]

    def get_image_url(self, obj):
        request = self.context.get("request")
        if obj.image and hasattr(obj.image, "url"):
            url = obj.image.url
            return request.build_absolute_uri(url) if request else url
        return None
