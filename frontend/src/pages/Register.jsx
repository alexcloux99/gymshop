import { useState } from "react";
import { apiPost } from "../api/client";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Register() {
  const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [toast, setToast] = useState({ show: false, msg: "" });

  const showNotification = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {

      await apiPost("/api/auth/register/", formData);
    
      showNotification("¡CUENTA CREADA CON ÉXITO!");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      showNotification("EL EMAIL YA EXISTE O DATOS INVÁLIDOS");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "40px 0", position: "relative", fontFamily: "Helvetica, Arial, sans-serif" }}>
      
      {toast.show && (
        <div style={{
          position: "fixed", top: "100px", right: "20px",
          backgroundColor: "#000", color: "#fff", padding: "15px 30px",
          borderRadius: "4px", fontWeight: "900", zIndex: 9999, fontSize: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)", animation: "slideIn 0.3s ease-out"
        }}>
          {toast.msg}
        </div>
      )}

      <h2 style={{ fontWeight: "900", marginBottom: "10px", fontSize: "32px", letterSpacing: "-1px" }}>ÚNETE A AMC FIT</h2>
      <p style={{ color: "#666", marginBottom: "30px", fontSize: "14px" }}>Crea tu cuenta para guardar tus favoritos y comprar.</p>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "15px", padding: "0 20px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
            <input 
              placeholder="Nombre" 
              onChange={(e) => setFormData({...formData, first_name: e.target.value})} 
              required 
              style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px", width: "50%", outline: "none" }} 
            />
            <input 
              placeholder="Apellidos" 
              onChange={(e) => setFormData({...formData, last_name: e.target.value})} 
              required 
              style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px", width: "50%", outline: "none" }} 
            />
        </div>
        
        <input 
          type="email" 
          placeholder="Email*" 
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
          required 
          style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px", outline: "none" }} 
        />
        
        <div style={{ position: "relative" }}>
            <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Contraseña*" 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
                style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px", width: "100%", boxSizing: "border-box", outline: "none" }} 
            />
            <div onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#666" }}>
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </div>
        </div>

        <button type="submit" style={{ backgroundColor: "#000", color: "#fff", padding: "16px", border: "none", borderRadius: "30px", fontWeight: "900", textTransform: "uppercase", cursor: "pointer", marginTop: "10px", letterSpacing: "1px" }}>
          Crear cuenta
        </button>
      </form>
      
      <p style={{ marginTop: "20px", fontSize: "14px" }}>¿Ya tienes cuenta? <Link to="/login" style={{ color: "#000", fontWeight: "700", textDecoration: "none", borderBottom: "2px solid #000" }}>Inicia sesión</Link></p>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}