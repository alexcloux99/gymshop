import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiPost } from "../api/client.js";
import { useState } from "react";

export default function Cart() {
  const { items, remove, clear, total, inc, dec } = useCart();
  const { token } = useAuth();
  const [msg, setMsg] = useState("");

  const checkout = async () => {
    setMsg("");
    if (!token) return setMsg("Inicia sesión para continuar con el pedido.");
    if (!items.length) return setMsg("El carrito está vacío.");
    const body = { items: items.map(it => ({ product_id: it.id, qty: it.qty })) };
    try {
      const order = await apiPost("/api/orders/checkout/", body, token);
      setMsg(`Pedido #${order.id} creado. Total: ${order.total} €`);
      clear();
    } catch (e) {
      setMsg("Error en checkout: " + e.message);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Carrito</h2>
      {!items.length && <p>Vacío. Añade algo primero.</p>}
      {items.map(it => (
        <div key={it.id} style={{ display: "flex", gap: 12, alignItems: "center", borderBottom: "1px solid #eee", padding: "8px 0" }}>
          <div style={{ flex: 1 }}>{it.name} ({it.category_label})</div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <button onClick={() => dec(it.id)}>-</button>
            <div>x{it.qty}</div>
            <button onClick={() => inc(it.id)}>+</button>
          </div>
          <div>{Number(it.price).toFixed(2)} €</div>
          <button onClick={() => remove(it.id)}>Quitar</button>
        </div>
      ))}
      <div style={{ marginTop: 12 }}>
        <strong>Total:</strong> {total.toFixed(2)} €
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button onClick={checkout}>Pagar</button>
        <button onClick={clear}>Vaciar</button>
      </div>
      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  );
}
