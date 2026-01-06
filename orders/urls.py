from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('mine/', views.my_orders, name='my-orders'),
    path('create/', views.create_order, name='create-order'),
    path('<int:pk>/', views.order_detail, name='order-detail'),
    path('<int:pk>/pay/', views.pay_order_paypal, name='pay-order'),
]