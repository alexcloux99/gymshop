from django.urls import path
from .views import CheckoutAPIView, MyOrdersAPIView

urlpatterns = [
    path("checkout/", CheckoutAPIView.as_view(), name="checkout"),
    path("mine/", MyOrdersAPIView.as_view(), name="my-orders"),
]
