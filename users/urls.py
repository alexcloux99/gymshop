from django.urls import path
from . import views
from .views import (
    RegisterView, 
    LoginWithEmailAPIView, 
    MeView, 
    LogoutView, 
    update_profile,
    forgot_password,      
    reset_password_confirm
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Registro y Login
    path("auth/register/", RegisterView.as_view(), name="register"),
    path("auth/token/", LoginWithEmailAPIView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    
    # Perfil y Usuario
    path("auth/me/", MeView.as_view(), name="me"),
    path("auth/profile/update/", update_profile, name="update-profile"),
    
    # Recuperación de contraseña
    path("auth/forgot-password/", forgot_password, name="forgot-password"),
    path("auth/reset-password-confirm/", reset_password_confirm, name="reset-confirm"),
    
    path("auth/logout/", LogoutView.as_view(), name="logout"),
]