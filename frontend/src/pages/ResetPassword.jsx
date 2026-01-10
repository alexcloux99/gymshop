import { useState } from "react";
import { apiPost } from "../api/client";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });

  const showNotification = (msg, type = "success") => {
    setToast({ show: true, msg, type });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification("POR FAVOR, RELLENA TODOS LOS CAMPOS", "error");
      return;
    }

    setBusy(true);
    try {
      await apiPost("/api/auth/reset-password-confirm/", { email, password });
      
      showNotification("¡CONTRASEÑA ACTUALIZADA CON ÉXITO!");
      
      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (e) {
      showNotification("ERROR: EL EMAIL NO ES CORRECTO", "error");
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "0 20px", position: "relative" }}>
      {toast.show && (
        <div style={{
          position: "fixed", top: "100px", right: "20px",
          backgroundColor: toast.type === "success" ? "#000" : "#c53030",
          color: "#fff", padding: "15px 30px", borderRadius: "4px",
          fontWeight: "900", zIndex: 9999, fontSize: "13px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
          animation: "slideIn 0.3s ease-out"
        }}>
          {toast.msg.toUpperCase()}
        </div>
      )}

      <h2 style={{ fontWeight: "900", textTransform: "uppercase", fontSize: "28px", marginBottom: "10px", letterSpacing: "-1px" }}>Nueva Contraseña</h2>
      <p style={{ color: "#666", textAlign: "center", maxWidth: "400px", fontSize: "14px", marginBottom: "35px" }}>
        Introduce tu email para confirmar y la nueva contraseña que desees utilizar.
      </p>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "15px" }}>
        <input 
          type="email" 
          placeholder="Confirma tu email*" 
          required 
          value={email} 
          onChange={e => setEmail(e.target.value)}
          style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "16px", outline: "none" }}
        />
        <input 
          type="password" 
          placeholder="Nueva contraseña*" 
          required 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          style={{ padding: "16px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "16px", outline: "none" }}
        />
        
        <button disabled={busy} type="submit" style={{ 
          backgroundColor: "#000", color: "#fff", padding: "18px", border: "none", 
          borderRadius: "35px", fontWeight: "900", cursor: "pointer", 
          textTransform: "uppercase", fontSize: "14px", marginTop: "10px",
          transition: "0.3s", opacity: busy ? 0.7 : 1
        }}>
          {busy ? "Guardando..." : "Actualizar Contraseña"}
        </button>
      </form>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}