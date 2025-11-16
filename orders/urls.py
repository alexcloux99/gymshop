from django.urls import path
from .views import CheckoutAPIView, MyOrdersAPIView, MarkPaidAPIView

urlpatterns = [
    path("checkout/", CheckoutAPIView.as_view(), name="checkout"),
    path("mine/", MyOrdersAPIView.as_view(), name="my-orders"),
    path("<int:pk>/paid/", MarkPaidAPIView.as_view(), name="order-paid"),
]
