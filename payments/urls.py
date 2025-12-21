from django.urls import path
from .views import simulate_paypal

urlpatterns = [
    path("paypal/simulate/", simulate_paypal),  # POST { order_id }
]
