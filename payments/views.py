from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from orders.models import Order

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def simulate_paypal(request):
    order_id = request.data.get("order_id")
    if not order_id:
        return Response({"detail": "order_id requerido"}, status=400)

    try:
        order = Order.objects.get(pk=order_id, user=request.user)
    except Order.DoesNotExist:
        return Response({"detail": "Pedido no encontrado"}, status=404)

    if order.status == "paid":
        return Response({"detail": "El pedido ya está pagado"}, status=400)

    order.status = "paid"
    order.paid_at = timezone.now()
    order.save(update_fields=["status", "paid_at"])
    return Response({"ok": True, "id": order.id})
