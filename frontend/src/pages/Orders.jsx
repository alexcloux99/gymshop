import { useEffect, useState } from "react";
import { apiGet, apiPut } from "../api/client";
import { useAuth } from "../context/AuthContext";

const PROVINCIAS_ESPANA = ["Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "Cuenca", "Girona", "Granada", "Guadalajara", "Guipúzcoa", "Huelva", "Huesca", "Islas Baleares", "Jaén", "La Coruña", "La Rioja", "Las Palmas", "León", "Lleida", "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Orense", "Palencia", "Pontevedra", "Salamanca", "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza", "Ceuta", "Melilla"];

const InputField = ({ label, value, onChange, placeholder }) => (
  <div style={{ marginBottom: "15px" }}>
    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", marginBottom: "5px", color: "#000" }}>{label.toUpperCase()}</label>
    <input 
      placeholder={placeholder}
      value={value || ""} 
      onChange={onChange} 
      style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "2px", outline: "none", boxSizing: "border-box", fontSize: "14px" }} 
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: "15px" }}>
    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", marginBottom: "5px", color: "#000" }}>{label.toUpperCase()}</label>
    <select 
      value={value || ""} 
      onChange={onChange} 
      style={{ width: "100%", padding: "12px", border: "1px solid #ccc", borderRadius: "2px", outline: "none", boxSizing: "border-box", fontSize: "14px", backgroundColor: "#fff", cursor: "pointer" }}
    >
      <option value="">Selecciona...</option>
      {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

export default function Orders() {
  const { token, user, setUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: "" });
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (token) {
      apiGet("/api/orders/mine/", token).then(setOrders).finally(() => setLoading(false));
    }
  }, [token]);

  const startEditing = () => {
    setFormData({ ...user });
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await apiPut("/api/auth/profile/update/", formData, token);
      const newData = await apiGet("/api/auth/me/", token);
      setUser(newData);
      setIsEditing(false);
      setToast({ show: true, msg: "DIRECCIÓN GUARDADA" });
      setTimeout(() => setToast({ show: false, msg: "" }), 3000);
    } catch (e) { alert("Error al conectar con el servidor"); }
  };

  if (loading) return <p style={{ textAlign: "center", padding: "100px", fontWeight: "900", letterSpacing: "1px" }}>CARGANDO...</p>;

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", padding: "0 20px", fontFamily: 'Helvetica, Arial, sans-serif' }}>
      {toast.show && (
        <div style={{ position: "fixed", bottom: 20, right: 20, backgroundColor: "#000", color: "#fff", padding: "15px 30px", zIndex: 1000, fontWeight: "900", fontSize: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          {toast.msg}
        </div>
      )}
      
      <h1 style={{ fontWeight: 900, marginBottom: 40, letterSpacing: "-1px" }}>MI CUENTA</h1>

      <div style={{ display: "grid", gridTemplateColumns: isEditing ? "1fr" : "1fr 350px", gap: 50 }}>
        
        {!isEditing ? (
          <>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 900, borderBottom: "2px solid #000", paddingBottom: 10, marginBottom: 20 }}>HISTORIAL DE PEDIDOS</h2>
              {orders.length === 0 ? <p style={{color: '#666'}}>No hay pedidos registrados.</p> : orders.map(o => (
                <div key={o.id} style={{ border: "1px solid #eee", padding: "20px", marginBottom: "15px", position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 900, fontSize: "14px" }}>PEDIDO #{o.id} — {Number(o.total).toFixed(2)} €</div>
                      <div style={{ fontSize: 11, color: "#aaa", fontWeight: "700", marginTop: "4px" }}>{new Date(o.created_at).toLocaleDateString()}</div>
                    </div>
                    <button 
                      onClick={() => setSelectedOrder(selectedOrder === o.id ? null : o.id)} 
                      style={{ cursor: "pointer", background: "none", border: "1px solid #000", padding: "7px 15px", fontWeight: "900", fontSize: "10px", textTransform: "uppercase" }}
                    >
                      {selectedOrder === o.id ? "Ocultar" : "Ver Productos"}
                    </button>
                  </div>

                  {selectedOrder === o.id && (
                    <div style={{ marginTop: "20px", borderTop: "1px solid #f5f5f5", paddingTop: "20px", animation: "fadeIn 0.3s ease" }}>
                      {o.items?.map((item, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", backgroundColor: "#fafafa", padding: "12px 15px", borderRadius: "2px" }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontWeight: "800", fontSize: "12px", textTransform: "uppercase" }}>{item.product_name}</span>
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                {item.size && item.size !== 'N/A' && (
                                    <span style={{ fontSize: "10px", fontWeight: "900", backgroundColor: "#000", color: "#fff", padding: "2px 6px", borderRadius: "2px" }}>TALLA {item.size.toUpperCase()}</span>
                                )}
                                <span style={{ fontSize: "11px", color: "#666", fontWeight: "700" }}>CANTIDAD: {item.qty}</span>
                            </div>
                          </div>
                          <span style={{ fontWeight: "900", fontSize: "14px" }}>{Number(item.price).toFixed(2)} €</span>
                        </div>
                      ))}
                      <div style={{ textAlign: "right", marginTop: "15px", borderTop: "2px solid #000", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "10px", fontWeight: "900", color: "#aaa" }}>TOTAL DEL PEDIDO</span>
                        <span style={{ fontSize: "18px", fontWeight: "900" }}>{Number(o.total).toFixed(2)} €</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: "#f9f9f9", padding: 30, alignSelf: "start" }}>
              <h2 style={{ fontSize: 14, fontWeight: 900, marginBottom: 20 }}>DIRECCIÓN DE ENVÍO</h2>
              <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#333", margin: 0 }}>
                <strong>{(user?.first_name || "").toUpperCase()} {(user?.last_name || "").toUpperCase()}</strong><br />
                {user?.address_1}<br />
                {user?.address_2 && <>{user.address_2}<br /></>}
                {user?.postal_code} {user?.city}<br />
                {user?.state}, España<br />
                Tel: {user?.phone}
              </p>
              <button onClick={startEditing} style={{ marginTop: 25, width: "100%", padding: 15, backgroundColor: "#000", color: "#fff", border: "none", fontWeight: "900", cursor: "pointer", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Editar Detalles
              </button>
            </div>
          </>
        ) : (
          <div style={{ maxWidth: "600px", margin: "0 auto", width: "100%" }}>
            <h2 style={{ fontSize: 22, fontWeight: 900, marginBottom: 35, textAlign: 'center', letterSpacing: "-0.5px" }}>DETALLES DE ENVÍO</h2>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <InputField label="Nombre" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
              <InputField label="Apellidos" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
            </div>

            <InputField label="Dirección Línea 1" value={formData.address_1} onChange={e => setFormData({...formData, address_1: e.target.value})} placeholder="Calle y número" />
            <InputField label="Dirección Línea 2 (Opcional)" value={formData.address_2} onChange={e => setFormData({...formData, address_2: e.target.value})} placeholder="Bloque, puerta, oficina..." />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <InputField label="Ciudad" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              <SelectField label="Provincia" value={formData.state} options={PROVINCIAS_ESPANA} onChange={e => setFormData({...formData, state: e.target.value})} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
              <InputField label="Código Postal" value={formData.postal_code} onChange={e => setFormData({...formData, postal_code: e.target.value})} />
              <InputField label="Teléfono" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>

            <div style={{ marginTop: 40, display: "flex", gap: 20 }}>
              <button onClick={handleSave} style={{ flex: 1, padding: 18, backgroundColor: "#000", color: "#fff", border: "none", fontWeight: "900", cursor: "pointer", textTransform: "uppercase" }}>Guardar Cambios</button>
              <button onClick={() => setIsEditing(false)} style={{ flex: 1, padding: 18, backgroundColor: "#eee", color: "#000", border: "none", fontWeight: "900", cursor: "pointer", textTransform: "uppercase" }}>Cancelar</button>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}