import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { apiPost, apiPut, apiGet } from "../api/client.js";
import { useState, useEffect } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { useNavigate } from "react-router-dom";

const PROVINCIAS = ["Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "Cuenca", "Girona", "Granada", "Guadalajara", "Guipúzcoa", "Huelva", "Huesca", "Islas Baleares", "Jaén", "La Coruña", "La Rioja", "Las Palmas", "León", "Lleida", "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Orense", "Palencia", "Pontevedra", "Salamanca", "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza", "Ceuta", "Melilla"];

const InputCart = ({ placeholder, value, onChange, error, type = "text", width = "100%" }) => (
  <div style={{ width, marginBottom: "12px" }}>
    <input type={type} placeholder={placeholder} value={value || ""} onChange={onChange}
      style={{ width: "100%", padding: "10px", border: error ? "1.5px solid #d00" : "1px solid #ddd", fontSize: "13px", boxSizing: "border-box", outline: "none", borderRadius: "2px", textTransform: "capitalize" }}
    />
  </div>
);

export default function Cart() {
  const { items, remove, clear, total, inc, dec } = useCart();
  const { token, user, setUser } = useAuth();
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [finalOrderNum, setFinalOrderNum] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const navigate = useNavigate();

  const [shipData, setShipData] = useState({
    first_name: "", last_name: "", address_1: "", address_2: "",
    city: "", state: "", postal_code: "", phone: "", country: "España"
  });
  const shippingCost = total >= 50 ? 0 : 4.99;
  const finalTotal = total + shippingCost;

  useEffect(() => {
    if (user) {
      setShipData({
        first_name: user.first_name || "", last_name: user.last_name || "",
        address_1: user.address_1 || "", address_2: user.address_2 || "",
        city: user.city || "", state: user.state || "",
        postal_code: user.postal_code || "", phone: user.phone || "", country: "España"
      });
      if (!user.address_1) setIsAddingNew(true);
    }
  }, [user]);

  function validateCart() {
     if (!token) {
      navigate("/login", { state: { from: "/cart" } });
      return false;
    }

    for (const it of items) {
      if (it.requires_size && (!it.size || it.size === "N/A")) {
        setErr(`"${it.name.toUpperCase()}" REQUIERE QUE SELECCIONES UNA TALLA`);
        return false;
      }
    }
    if (!shipData.first_name || !shipData.address_1 || !shipData.city || !shipData.phone || !shipData.state) {
      setErr("COMPLETA LOS CAMPOS DE ENVÍO OBLIGATORIOS");
      return false;
    }
    return true;
  }

  const handleConfirmAddress = async () => {
    if (!shipData.address_1 || !shipData.city || !shipData.phone || !shipData.first_name || !shipData.state) {
      setErr("COMPLETA LOS CAMPOS OBLIGATORIOS");
      return;
    }
    setBusy(true);
    try {
      await apiPut("/api/auth/profile/update/", shipData, token);
      const newData = await apiGet("/api/auth/me/", token);
      setUser(newData);
      setErr("");
      setIsAddingNew(false);
    } catch (e) { setErr("ERROR AL GUARDAR PERFIL"); }
    finally { setBusy(false); }
  };

  async function handleContrareembolso() {
    if (!validateCart()) return;
    setErr(""); setBusy(true);
    try {
      const body = {
        items: items.map(it => ({ product_id: it.id, qty: it.qty, size: it.size || "N/A" })),
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

  async function handlePayPalApprove(data, actions) {
    try {
      setBusy(true);
      const details = await actions.order.capture();
      const body = {
        items: items.map(it => ({ product_id: it.id, qty: it.qty, size: it.size || "N/A" })),
        total: finalTotal.toFixed(2),
        ...shipData,
        payment_method: "paypal",
        paypal_id: details.id
      };
      const order = await apiPost("/api/orders/create/", body, token);
      setFinalOrderNum(order.id);
      setIsSuccess(true);
      clear();
    } catch (e) {
      setErr("Error al confirmar el pedido. Contacta con soporte.");
    } finally {
      setBusy(false);
    }
  }

  if (isSuccess) {
    return (
      <div style={{ textAlign: "center", padding: "100px 20px", fontFamily: "Helvetica" }}>
        <div style={{ fontSize: "80px", marginBottom: "20px" }}>✓</div>
        <h1 style={{ fontWeight: "900" }}>¡PEDIDO RECIBIDO!</h1>
        <p>Tu número de pedido es <strong>#{finalOrderNum}</strong>.</p>
        <button onClick={() => window.location.href = "/"} style={{ backgroundColor: "#000", color: "#fff", padding: "15px 40px", border: "none", fontWeight: "900", cursor: "pointer", marginTop: "20px" }}>
          VOLVER A LA TIENDA
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1100px", margin: "40px auto", padding: "0 20px", fontFamily: "Helvetica, Arial, sans-serif" }}>
      <h1 style={{ fontWeight: 900, textTransform: "uppercase", fontSize: "24px", marginBottom: "30px" }}>Tu Carrito</h1>

      {!items.length ? (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Tu bolsa está vacía.</p>
          <button onClick={() => window.location.href = "/"} style={{ backgroundColor: "#000", color: "#fff", padding: "12px 25px", border: "none", fontWeight: "bold", cursor: "pointer", marginTop: "20px" }}>
            VOLVER A LA TIENDA
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "50px" }}>
          <div>
            {items.map(it => (
              <div key={it.id + (it.size || "")} style={{ display: "flex", gap: "20px", padding: "20px 0", borderBottom: "1px solid #eee" }}>
                <img src={it.image} alt={it.name} style={{ width: "90px", height: "110px", objectFit: "cover", backgroundColor: "#f5f5f5" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "800", fontSize: "13px" }}>
                    <span>{it.name.toUpperCase()}</span>
                    <span>{it.price} €</span>
                  </div>
                  {it.size && it.size !== "N/A" && (
                    <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>Talla: {it.size}</div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: "15px", marginTop: "15px" }}>
                    <div style={{ border: "1px solid #ddd", display: "flex", alignItems: "center" }}>
                      <button onClick={() => dec(it.id, it.size)} style={{ padding: "4px 10px", border: "none", background: "none", cursor: "pointer" }}>-</button>
                      <span style={{ fontSize: "12px", fontWeight: "bold" }}>{it.qty}</span>
                      <button onClick={() => inc(it.id, it.size)} style={{ padding: "4px 10px", border: "none", background: "none", cursor: "pointer" }}>+</button>
                    </div>
                    <button onClick={() => remove(it.id, it.size)} style={{ background: "none", border: "none", textDecoration: "underline", fontSize: "11px", cursor: "pointer", color: "#666" }}>
                      Quitar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Resumen y pago */}
          <div style={{ alignSelf: "start" }}>
            <div style={{ backgroundColor: "#f9f9f9", padding: "25px", borderRadius: "2px" }}>
              <h2 style={{ fontSize: "15px", fontWeight: "900", marginBottom: "20px" }}>RESUMEN</h2>

              {/* Dirección de envio */}
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
                  <div style={{ fontSize: "13px", lineHeight: "1.5", color: "#333", textTransform: "capitalize" }}>
                    <strong>{shipData.first_name} {shipData.last_name}</strong><br />
                    {shipData.address_1} {shipData.address_2}<br />
                    {shipData.postal_code}, {shipData.city}<br />
                    {shipData.state}, España<br />
                    Tel: {shipData.phone}
                  </div>
                ) : (
                  <div style={{ marginTop: "10px" }}>
                    <div style={{ display: "flex", gap: "5px" }}>
                      <InputCart placeholder="Nombre" value={shipData.first_name} onChange={e => setShipData({ ...shipData, first_name: e.target.value })} width="50%" />
                      <InputCart placeholder="Apellidos" value={shipData.last_name} onChange={e => setShipData({ ...shipData, last_name: e.target.value })} width="50%" />
                    </div>
                    <InputCart placeholder="Dirección Línea 1" value={shipData.address_1} onChange={e => setShipData({ ...shipData, address_1: e.target.value })} />
                    <InputCart placeholder="Dirección Línea 2 (Opcional)" value={shipData.address_2} onChange={e => setShipData({ ...shipData, address_2: e.target.value })} />
                    <div style={{ display: "flex", gap: "5px" }}>
                      <InputCart placeholder="Ciudad" value={shipData.city} onChange={e => setShipData({ ...shipData, city: e.target.value })} width="65%" />
                      <InputCart placeholder="CP" type="tel" value={shipData.postal_code} onChange={e => setShipData({ ...shipData, postal_code: e.target.value.replace(/\D/g, "") })} width="35%" />
                    </div>
                    <select value={shipData.state || ""} onChange={e => setShipData({ ...shipData, state: e.target.value })}
                      style={{ width: "100%", padding: "10px", border: "1px solid #ddd", fontSize: "13px", outline: "none", backgroundColor: "#fff", marginBottom: "10px" }}>
                      <option value="">Provincia...</option>
                      {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    <InputCart placeholder="Teléfono" type="tel" value={shipData.phone} onChange={e => setShipData({ ...shipData, phone: e.target.value.replace(/\D/g, "") })} />
                    <button onClick={handleConfirmAddress} style={{ width: "100%", padding: "10px", backgroundColor: "#000", color: "#fff", border: "none", fontWeight: "900", cursor: "pointer", fontSize: "11px", textTransform: "uppercase" }}>
                      {busy ? "GUARDANDO..." : "Confirmar Dirección"}
                    </button>
                  </div>
                )}
              </div>

              <div style={{ borderTop: "1px solid #ddd", paddingTop: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "10px" }}>
                  <span>SUBTOTAL</span><span>{total.toFixed(2)} €</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "10px" }}>
                  <span>ENVÍO</span>
                  <span style={{ color: shippingCost === 0 ? "#2e7d32" : "#000", fontWeight: "bold" }}>
                    {shippingCost === 0 ? "GRATIS" : `${shippingCost.toFixed(2)} €`}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "900", fontSize: "18px", marginTop: "20px", marginBottom: "25px", borderTop: "2px solid #000", paddingTop: "15px" }}>
                  <span>TOTAL</span><span>{finalTotal.toFixed(2)} €</span>
                </div>

                {/* Error */}
                {err && (
                  <div style={{ color: "#d00", fontSize: "11px", fontWeight: "900", textAlign: "center", padding: "10px", backgroundColor: "#fff0f0", border: "1px solid #fcc", marginBottom: "15px" }}>
                    {err}
                  </div>
                )}

                {/* Botones de pago */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

                  <PayPalButtons
                    style={{ layout: "vertical" }}
                    disabled={busy || isAddingNew}
                    onClick={(data, actions) => {
                      if (!validateCart()) return actions.reject();
                      setErr("");
                      return actions.resolve();
                    }}
                    createOrder={(data, actions) =>
                      actions.order.create({
                        purchase_units: [{ amount: { value: finalTotal.toFixed(2) } }]
                      })
                    }
                    onApprove={handlePayPalApprove}
                    onError={() => setErr("Error en el pago con PayPal. Inténtalo de nuevo.")}
                    onCancel={() => setErr("Pago cancelado.")}
                  />

                  <button
                    onClick={handleContrareembolso}
                    disabled={busy || isAddingNew}
                    style={{ width: "100%", padding: "14px", backgroundColor: "#fff", color: "#000", border: isAddingNew ? "2px solid #ccc" : "2px solid #000", fontWeight: "900", cursor: busy || isAddingNew ? "not-allowed" : "pointer", textTransform: "uppercase", fontSize: "13px" }}
                  >
                    {busy ? "PROCESANDO..." : "CONTRAREEMBOLSO"}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}