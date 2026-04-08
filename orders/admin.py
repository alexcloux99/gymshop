from django.contrib import admin
from django.apps import apps
from .models import Order, OrderItem

# Register your models here.
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("id","user","status","total","created_at")
    list_filter = ("status",)
    inlines = [OrderItemInline]

apps.get_app_config('orders').verbose_name = "Pedidos"