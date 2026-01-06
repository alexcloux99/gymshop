from django.contrib import admin
from .models import Product, Reviews

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "size", "price", "stock", "active")
    list_filter = ("category", "size", "active")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}

admin.site.register(Reviews)