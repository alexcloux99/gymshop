import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiPost } from "../api/client.js";
import { useState, useEffect } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";

const InputS = (p) => (
  <input 
    {...p} 
    style={{ 
      width: "100%", padding: "10px", border: "1px solid #ddd", 
      marginBottom: "10px", fontSize: "13px", boxSizing: "border-box", 
      outline: "none" 
    }} 
  />
);

export default function Cart() {
  const { items, remove, clear, total, inc, dec } = useCart();
  const { token, user } = useAuth();
  const [err, setErr] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [finalOrderNum, setFinalOrderNum] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [shipData, setShipData] = useState({
    first_name: "", last_name: "", address_1: "", address_2: "",
    city: "", state: "", postal_code: "", phone: "", country: "España"
  });
  // Calculamos gastos de envío
  const shippingCost = total >= 50 ? 0 : 4.99;
  const finalTotal = total + shippingCost;


  useEffect(() => {
    if (user) {
      setShipData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        address_1: user.address_1 || "",
        address_2: user.address_2 || "",
        city: user.city || "",
        state: user.state || "",
        postal_code: user.postal_code || "",
        phone: user.phone || "",
        country: "España"
      });
      if (!user.address_1) setIsAddingNew(true);
    }
  }, [user]);

  const handleConfirmAddress = () => {
    if (!shipData.address_1 || !shipData.city || !shipData.phone || !shipData.first_name || !shipData.postal_code) {
      setErr("POR FAVOR, COMPLETA LOS CAMPOS OBLIGATORIOS");
      return;
    }
    if (shipData.postal_code.length < 5) {
      setErr("EL CÓDIGO POSTAL DEBE TENER 5 DÍGITOS");
      return;
    }
    if (shipData.phone.length < 9) {
      setErr("EL TELÉFONO DEBE TENER AL MENOS 9 DÍGITOS");
      return;
    }
    setErr("");
    setIsAddingNew(false); 
  };

  async function createOrder() {
    setErr(""); setBusy(true);
    try {
      if (!token) throw new Error("Inicia sesión para comprar.");
      if (!items.length) throw new Error("El carrito está vacío.");
      
      const body = { 
        items: items.map(it => ({ product_id: it.id, qty: it.qty, size: it.size })), 
        total: finalTotal.toFixed(2),
        ...shipData 
      };
      const order = await apiPost("/api/orders/create/", body, token); 
      setOrderId(order.id);
      return order;
    } catch (e) { setErr(e.message); return null; }
    finally { setBusy(false); }
  }

  async function onPayPalSuccess(details, data, id) {
    try {
      setBusy(true);
      await apiPost(`/api/orders/${id}/pay/`, { id: details.id }, token);
      setFinalOrderNum(id);
      setIsSuccess(true); 
      clear(); 
    } catch (e) { setErr("Error al confirmar pago."); }
    finally { setBusy(false); }
  }

  async function handleContrareembolso() {
    setErr(""); setBusy(true);
    try {
      const body = { 
        items: items.map(it => ({ product_id: it.id, qty: it.qty, size: it.size })), 
        total: finalTotal.toFixed(2),
        ...shipData, 
        payment_method: "contrareembolso" 
      };
      const order = await apiPost("/api/orders/create/", body, token); 
      setFinalOrderNum(order.id);
      setIsSuccess(true);
      clear(); 
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  if (isSuccess) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
        <div style={{ fontSize: '80px', color: '#000', marginBottom: '20px' }}>✓</div>
        <h1 style={{ fontWeight: '900', fontSize: '32px', marginBottom: '10px' }}>¡PEDIDO RECIBIDO!</h1>
        <p style={{ color: '#666', fontSize: '16px', marginBottom: '40px', lineHeight: '1.6' }}>
          Tu número de pedido es <strong>#{finalOrderNum}</strong>.<br />
        </p>
        <button onClick={() => window.location.href = '/'} style={{ backgroundColor: '#000', color: '#fff', padding: '15px 40px', border: 'none', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase', borderRadius: '2px' }}>
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 20px", fontFamily: "Helvetica, Arial, sans-serif" }}>
      <h1 style={{ fontWeight: 900, textTransform: "uppercase", fontSize: "24px", marginBottom: "30px" }}>Tu Carrito</h1>
      
      {!items.length ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
            <p style={{ color: "#666", marginBottom: "20px" }}>Tu bolsa está vacía.</p>
            <button onClick={() => window.location.href='/'} style={{ backgroundColor: "#000", color: "#fff", padding: "12px 25px", border: "none", fontWeight: "bold", cursor: "pointer" }}>VOLVER A LA TIENDA</button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "50px" }}>
          
          <div>
            {items.map(it => (
              <div key={it.id + (it.size || "")} style={{ display: "flex", gap: "20px", padding: "20px 0", borderBottom: "1px solid #eee" }}>
                <img src={it.image} alt={it.name} style={{ width: "90px", height: "110px", objectFit: "cover", backgroundColor: "#f5f5f5" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "800", fontSize: "13px" }}>
                    <span>{it.name.toUpperCase()}</span>
                    <span>{it.price} €</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>Talla: {it.size || "N/A"}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px", marginTop: "15px" }}>
                    <div style={{ border: "1px solid #ddd", display: "flex", alignItems: "center" }}>
                      <button onClick={() => dec(it.id)} style={{ padding: "4px 10px", border: "none", background: "none", cursor: "pointer" }}>-</button>
                      <span style={{ fontSize: "12px", fontWeight: "bold" }}>{it.qty}</span>
                      <button onClick={() => inc(it.id)} style={{ padding: "4px 10px", border: "none", background: "none", cursor: "pointer" }}>+</button>
                    </div>
                    <button onClick={() => remove(it.id)} style={{ background: "none", border: "none", textDecoration: "underline", fontSize: "11px", cursor: "pointer", color: "#666" }}>Quitar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ alignSelf: "start" }}>
            <div style={{ backgroundColor: "#f9f9f9", padding: "25px", borderRadius: "2px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "900", marginBottom: "20px" }}>RESUMEN</h2>
              
              <div style={{ marginBottom: "20px", border: "1px solid #eee", padding: "15px", backgroundColor: "#fff" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "900" }}>ENTREGA EN:</span>
                    {!isAddingNew && (
                      <button onClick={() => setIsAddingNew(true)} style={{ background: "none", border: "none", textDecoration: "underline", fontSize: "11px", cursor: "pointer", fontWeight: "bold" }}>
                        CAMBIAR
                      </button>
                    )}
                </div>

                {!isAddingNew ? (
                  <div style={{ fontSize: "13px", lineHeight: "1.5", color: "#333" }}>
                    <strong>{shipData.first_name} {shipData.last_name}</strong><br />
                    {shipData.address_1} {shipData.address_2}<br />
                    {shipData.postal_code}, {shipData.city}<br />
                    {shipData.state}, España<br />
                    Tel: {shipData.phone}
                  </div>
                ) : (
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ display: "flex", gap: "5px" }}>
                        <InputS placeholder="Nombre" value={shipData.first_name} onChange={e => setShipData({...shipData, first_name: e.target.value})} />
                        <InputS placeholder="Apellidos" value={shipData.last_name} onChange={e => setShipData({...shipData, last_name: e.target.value})} />
                    </div>
                    <InputS placeholder="Dirección (Calle y número)" value={shipData.address_1} onChange={e => setShipData({...shipData, address_1: e.target.value})} />
                    <InputS placeholder="Piso, puerta, bloque (Opcional)" value={shipData.address_2} onChange={e => setShipData({...shipData, address_2: e.target.value})} />
                    <div style={{ display: "flex", gap: "5px" }}>
                        <InputS placeholder="Ciudad" value={shipData.city} onChange={e => setShipData({...shipData, city: e.target.value})} />
                        <input 
                          placeholder="C.P." 
                          type="tel"
                          inputMode="numeric"
                          value={shipData.postal_code} 
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, ""); 
                            if (val.length <= 5) setShipData({...shipData, postal_code: val});
                          }}
                          style={{ width: "35%", padding: "10px", border: "1px solid #ddd", marginBottom: "10px", fontSize: "13px", boxSizing: "border-box", outline: "none" }}
                        />
                    </div>
                    <InputS placeholder="Provincia" value={shipData.state} onChange={e => setShipData({...shipData, state: e.target.value})} />
                    <InputS 
                      placeholder="Teléfono" 
                      type="tel"
                      inputMode="tel"
                      value={shipData.phone} 
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 9) setShipData({...shipData, phone: val});
                      }}
                    />
                    
                    <button 
                      onClick={handleConfirmAddress}
                      style={{ width: "100%", padding: "10px", backgroundColor: "#000", color: "#fff", border: "none", fontWeight: "900", cursor: "pointer", fontSize: "11px", textTransform: "uppercase", marginTop: "5px" }}
                    >
                      Confirmar Dirección
                    </button>
                  </div>
                )}
              </div>

              <div style={{ borderTop: "1px solid #ddd", paddingTop: "15px", marginTop: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "10px" }}>
                  <span>SUBTOTAL</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "10px" }}>
                  <span>ENVÍO</span>
                  <span style={{ color: shippingCost === 0 ? "#2e7d32" : "#000", fontWeight: "bold" }}>
                    {shippingCost === 0 ? "GRATIS" : `${shippingCost.toFixed(2)} €`}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "900", fontSize: "18px", marginTop: "20px", marginBottom: "25px", borderTop: "2px solid #000", paddingTop: "15px" }}>
                  <span>TOTAL</span>
                  <span>{finalTotal.toFixed(2)} €</span>
                </div>

                {!orderId ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <button 
                      onClick={createOrder} 
                      disabled={busy || isAddingNew}
                      style={{ width: "100%", padding: "15px", backgroundColor: isAddingNew ? "#ccc" : "#000", color: "#fff", border: "none", fontWeight: "900", cursor: isAddingNew ? "not-allowed" : "pointer", textTransform: "uppercase", fontSize: "13px" }}
                    >
                      {isAddingNew ? "CONFIRMA LA DIRECCIÓN" : "Confirmar y pagar con PayPal"}
                    </button>
                    <button 
                      onClick={handleContrareembolso} 
                      disabled={busy || isAddingNew}
                      style={{ width: "100%", padding: "14px", backgroundColor: "#fff", color: "#000", border: isAddingNew ? "2px solid #ccc" : "2px solid #000", fontWeight: "900", cursor: isAddingNew ? "not-allowed" : "pointer", textTransform: "uppercase", fontSize: "13px" }}
                    >
                      Pago Contrareembolso
                    </button>
                  </div>
                ) : (
                  <div>
                    <PayPalButtons 
                      style={{ layout: "vertical", shape: "rect" }}
                      createOrder={(data, actions) => actions.order.create({ purchase_units: [{ amount: { value: finalTotal.toFixed(2) } }] })}
                      onApprove={(data, actions) => actions.order.capture().then(details => onPayPalSuccess(details, data, orderId))}
                    />
                    <button onClick={() => setOrderId(null)} style={{ background: "none", border: "none", color: "#888", width: "100%", marginTop: "10px", fontSize: "11px", cursor: "pointer", textDecoration: "underline" }}>Cambiar método de pago</button>
                  </div>
                )}
              </div>
            </div>
            {err && <div style={{ marginTop: "20px", color: "#d32f2f", fontWeight: "bold", textAlign: "center", fontSize: "12px" }}>{err}</div>}
          </div>
        </div>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );
}