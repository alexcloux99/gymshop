from django.contrib import admin
from .models import Product, Reviews, ProductVariant

class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 0

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "price", "active")
    list_filter = ("category", "active")
    search_fields = ("name",)
    prepopulated_fields = {"slug": ("name",)}
    inlines = [ProductVariantInline]

admin.site.register(Reviews)
admin.site.register(ProductVariant)