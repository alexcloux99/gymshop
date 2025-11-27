from django.urls import path
from .views import LoginWithEmailAPIView, MeView, LogoutView, RegisterView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/token/", LoginWithEmailAPIView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
]
