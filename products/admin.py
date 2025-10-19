from django.contrib import admin
from .models import Product
# Register your models here.

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name","category","price","stock","active","created_at")
    list_filter = ("category","active")
    search_fields = ("name","slug","description")
    prepopulated_fields = {"slug": ("name",)}