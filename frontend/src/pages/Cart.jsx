import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiPost } from "../api/client.js";
import { useState } from "react";

export default function Cart() {
  const { items, remove, clear, total, inc, dec } = useCart();
  const { token } = useAuth();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [busy, setBusy] = useState(false);

  async function createOrder() {
    setMsg(""); setErr(""); setBusy(true);
    try {
      if (!token) throw new Error("Inicia sesión para continuar.");
      if (!items.length) throw new Error("El carrito está vacío.");

      const body = { items: items.map(it => ({ product_id: it.id, qty: it.qty })) };
      const order = await apiPost("/api/orders/checkout/", body, token); // ✅ ahora existe
      setOrderId(order.id);
      setMsg(`Pedido #${order.id} creado. Total: ${order.total} €`);
      return order.id;
    } catch (e) {
      setErr(`Error en checkout: ${e.message || e}`);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function payWithPaypalSim() {
    setMsg(""); setErr(""); setBusy(true);
    try {
      const id = orderId ?? (await createOrder());
      if (!id) return;

      await apiPost("/api/payments/paypal/simulate/", { order_id: id }, token);
      setMsg(`Pago simulado OK. Pedido #${id} pagado.`);
      clear();
      setOrderId(null);
    } catch (e) {
      setErr(`Error en pago simulado: ${e.message || e}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Carrito</h2>
      {!items.length && <p>Vacío. Añade algo primero.</p>}

      {items.map(it => (
        <div key={it.id} style={{ display: "flex", gap: 12, alignItems: "center", borderBottom: "1px solid #eee", padding: "8px 0" }}>
          <div style={{ flex: 1 }}>{it.name}</div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <button onClick={() => dec(it.id)} disabled={busy}>-</button>
            <div>x{it.qty}</div>
            <button onClick={() => inc(it.id)} disabled={busy}>+</button>
          </div>
          <div>{Number(it.price).toFixed(2)} €</div>
          <button onClick={() => remove(it.id)} disabled={busy}>Quitar</button>
        </div>
      ))}

      <div style={{ marginTop: 12 }}><strong>Total:</strong> {total.toFixed(2)} €</div>

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={createOrder} disabled={busy || !items.length}>Crear pedido</button>
        <button onClick={payWithPaypalSim} disabled={busy || !items.length}>Pagar con PayPal</button>
        <button onClick={clear} disabled={busy}>Vaciar</button>
      </div>

      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      {err && <p style={{ marginTop: 10, color: "crimson" }}>{err}</p>}
    </div>
  );
}
