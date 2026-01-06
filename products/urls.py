from django.urls import path
from . import views

urlpatterns = [
    path("", views.get_products, name="product-list"),
    path("<slug:slug>/", views.get_product, name="product-detail"),
    path("review/<int:pk>/", views.create_review, name="product-review"),
]