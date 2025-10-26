from django.urls import path, include

urlpatterns = [
    path("products/", include("products.urls")),
    path("orders/", include("orders.urls")),   
    path("auth/", include("users.urls")),
]
