import { useState } from "react";
import { apiPost } from "../api/client";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Register() {
  const [formData, setFormData] = useState({ first_name: "", last_name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      // Usamos la URL que configuramos en el backend
      await apiPost("/api/orders/register/", formData);
      alert("¡Cuenta creada! Ahora inicia sesión.");
      navigate("/login");
    } catch (err) {
      setError("Error: El email ya existe o los datos son inválidos.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", padding: "40px 0" }}>
      <h2 style={{ fontWeight: "900", marginBottom: "10px" }}>ÚNETE A GYMSHOP</h2>
      <p style={{ color: "#666", marginBottom: "30px", fontSize: "14px" }}>Crea tu cuenta para guardar tus favoritos y comprar.</p>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "15px", padding: "0 20px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
            <input placeholder="Nombre" onChange={(e) => setFormData({...formData, first_name: e.target.value})} required style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px", width: "50%" }} />
            <input placeholder="Apellidos" onChange={(e) => setFormData({...formData, last_name: e.target.value})} required style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px", width: "50%" }} />
        </div>
        
        <input type="email" placeholder="Email*" onChange={(e) => setFormData({...formData, email: e.target.value})} required style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px" }} />
        
        <div style={{ position: "relative" }}>
            <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Contraseña*" 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required 
                style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px", width: "100%", boxSizing: "border-box" }} 
            />
            <div onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#666" }}>
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </div>
        </div>

        {error && <p style={{ color: "crimson", textAlign: "center", fontSize: "13px" }}>{error}</p>}

        <button type="submit" style={{ backgroundColor: "#000", color: "#fff", padding: "16px", border: "none", borderRadius: "30px", fontWeight: "900", textTransform: "uppercase", cursor: "pointer", marginTop: "10px" }}>
          Crear cuenta
        </button>
      </form>
      
      <p style={{ marginTop: "20px", fontSize: "14px" }}>¿Ya tienes cuenta? <Link to="/login" style={{ color: "#000", fontWeight: "700" }}>Inicia sesión</Link></p>
    </div>
  );
}