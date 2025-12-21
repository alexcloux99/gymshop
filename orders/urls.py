# orders/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('', views.my_orders),
    path('<int:pk>/', views.order_detail),
    path('create/', views.create_order),
    path('checkout/', views.CheckoutAPIView.as_view()),
    path('<int:pk>/mark-paid/', views.admin_mark_paid),
]