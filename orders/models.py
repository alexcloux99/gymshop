from django.db import models
from django.contrib.auth.models import User
from products.models import Product

# Create your models here.

class Order(models.Model):
    STATUS = [
        ("pending", "Pendiente"),
        ("paid", "Pagado"),
        ("cancelled", "Cancelado"),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    status = models.CharField(max_length=20, choices=STATUS, default="pending")
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Order #{self.id} - {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    qty = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)  # copia del precio del producto

    def line_total(self):
        return self.qty * self.price