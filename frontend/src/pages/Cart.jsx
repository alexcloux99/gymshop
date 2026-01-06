import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiPost } from "../api/client.js";
import { useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";

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
      
      const order = await apiPost("/api/orders/create/", body, token); 
      
      setOrderId(order.id);
      return order;
    } catch (e) {
      setErr(`Error: ${e.message || e}`);
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function onPayPalSuccess(details, data, id) {
    try {
      setBusy(true);
      await apiPost(`/api/orders/${id}/pay/`, { id: details.id }, token);
      
      setMsg("¡Pago de GymShop completado con éxito! Gracias por tu compra.");
      clear(); 
      setOrderId(null);
    } catch (e) {
      setErr("El pago se hizo pero hubo un error al actualizar el pedido.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16, color: "#fff", backgroundColor: "#121212", minHeight: "80vh" }}>
      <h2>Tu Carrito de Gym</h2>
      {!items.length && <p>Tu mochila está vacía. Añade algo de ropa.</p>}

      {items.map(it => (
        <div key={it.id} style={{ display: "flex", gap: 12, alignItems: "center", borderBottom: "1px solid #333", padding: "12px 0" }}>
          <div style={{ flex: 1 }}>{it.name} <span style={{fontSize: '0.8em', color: '#888'}}>({it.size})</span></div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <button onClick={() => dec(it.id)} disabled={busy} style={{padding: "2px 8px"}}>-</button>
            <div>{it.qty}</div>
            <button onClick={() => inc(it.id)} disabled={busy} style={{padding: "2px 8px"}}>+</button>
          </div>
          <div style={{minWidth: 80, textAlign: 'right'}}>{(it.price * it.qty).toFixed(2)} €</div>
          <button onClick={() => remove(it.id)} disabled={busy} style={{background: "none", border: "1px solid crimson", color: "crimson", cursor: "pointer"}}>Quitar</button>
        </div>
      ))}

      {items.length > 0 && (
        <div style={{ marginTop: 20, padding: 16, border: "1px solid #333", borderRadius: 8 }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 16 }}><strong>Total:</strong> {total.toFixed(2)} €</div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            
            {!orderId ? (
               <button 
                onClick={createOrder} 
                disabled={busy}
                style={{ padding: 12, backgroundColor: "#ccff00", color: "#000", fontWeight: "bold", border: "none", borderRadius: 4, cursor: "pointer" }}
               >
                 CONFIRMAR DATOS Y PAGAR
               </button>
            ) : (
              <div style={{ marginTop: 10 }}>
                <p style={{ color: "#ccff00", marginBottom: 10 }}>✓ Pedido #{orderId} listo para pago:</p>
                <PayPalButtons 
                  style={{ layout: "vertical" }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [{ amount: { value: total.toFixed(2) } }]
                    });
                  }}
                  onApprove={(data, actions) => {
                    return actions.order.capture().then((details) => onPayPalSuccess(details, data, orderId));
                  }}
                />
                <button onClick={() => setOrderId(null)} style={{background: "none", border: "none", color: "#888", cursor: "pointer", marginTop: 10}}>Cancelar y volver</button>
              </div>
            )}

            <button onClick={clear} disabled={busy} style={{ background: "none", color: "#888", border: "none", cursor: "pointer", textDecoration: "underline" }}>Vaciar carrito</button>
          </div>
        </div>
      )}

      {msg && <div style={{ marginTop: 20, padding: 15, backgroundColor: "#1e3a1e", color: "#ccff00", borderRadius: 4 }}>{msg}</div>}
      {err && <div style={{ marginTop: 20, padding: 15, backgroundColor: "#3a1e1e", color: "crimson", borderRadius: 4 }}>{err}</div>}
    </div>
  );
}