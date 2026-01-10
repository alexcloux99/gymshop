import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError("Credenciales incorrectas o cuenta inexistente.");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", backgroundColor: "#fff" }}>
      
      
      <h2 style={{ fontWeight: "900", letterSpacing: "-1.5px", marginBottom: "10px", fontSize: "32px", fontFamily: "Helvetica, Arial, sans-serif" }}>Inicia sesión en tu cuenta</h2>
      
      <p style={{ color: "#666", textAlign: "center", maxWidth: "350px", fontSize: "14px", marginBottom: "35px" }}>
        Compra tus estilos, guarda tus favoritos y entrena con nosotros.
      </p>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "420px", display: "flex", flexDirection: "column", gap: "18px", padding: "0 25px" }}>
        
        <input
          type="email"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "16px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "16px", outline: "none" }}
        />
        
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: "16px", border: "1px solid #ccc", borderRadius: "4px", fontSize: "16px", width: "100%", boxSizing: "border-box", outline: "none" }}
          />
          <div 
            onClick={() => setShowPassword(!showPassword)}
            style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: "#666" }}
          >
            {showPassword ? <FiEyeOff size={22} /> : <FiEye size={22} />}
          </div>
        </div>

        {error && <p style={{ color: "#d32f2f", fontSize: "13px", textAlign: "center", fontWeight: "600" }}>{error}</p>}

        <Link to="/forgot" style={{ color: "#000", fontSize: "13px", fontWeight: "700", textAlign: "center", textDecoration: "underline" }}>
          ¿Has olvidado tu contraseña?
        </Link>

        <button type="submit" style={{
          backgroundColor: "#000", color: "#fff", padding: "18px", border: "none", 
          borderRadius: "40px", fontWeight: "900", fontSize: "16px", cursor: "pointer",
          textTransform: "uppercase", marginTop: "10px", letterSpacing: "1px"
        }}>
          INICIAR SESIÓN
        </button>
      </form>

      <p style={{ marginTop: "40px", fontSize: "14px", color: "#666" }}>
        ¿No tienes una cuenta? <Link to="/register" style={{ color: "#000", fontWeight: "900", textDecoration: "none", borderBottom: "2px solid #000" }}>REGÍSTRATE</Link>
      </p>
    </div>
  );
}