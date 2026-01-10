import { useState } from "react";
import { apiPost } from "../api/client";
import { Link } from "react-router-dom";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(""); setErr(""); setBusy(true);
    try {
      await apiPost("/api/auth/forgot-password/", { email });
      setMsg("TE HEMOS ENVIADO UN EMAIL CON LAS INSTRUCCIONES.");
    } catch (e) {
      setErr("NO SE HA ENCONTRADO NINGUNA CUENTA CON ESE EMAIL.");
    } finally { setBusy(false); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", padding: "0 20px" }}>
      <h2 style={{ fontWeight: "900", textTransform: "uppercase", marginBottom: "10px" }}>¿Has olvidado tu contraseña?</h2>
      <p style={{ color: "#666", textAlign: "center", maxWidth: "400px", fontSize: "14px", marginBottom: "30px" }}>
        Introduce tu email abajo y te enviaremos instrucciones para restablecerla.
      </p>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: "400px", display: "flex", flexDirection: "column", gap: "15px" }}>
        <input 
          type="email" 
          placeholder="Email address*" 
          required 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: "15px", border: "1px solid #ddd", borderRadius: "4px", fontSize: "16px" }}
        />

        {msg && <p style={{ color: "#2e7d32", fontSize: "13px", fontWeight: "bold", textAlign: "center" }}>{msg}</p>}
        {err && <p style={{ color: "#d32f2f", fontSize: "13px", fontWeight: "bold", textAlign: "center" }}>{err}</p>}

        <button disabled={busy} type="submit" style={{ backgroundColor: "#000", color: "#fff", padding: "16px", border: "none", borderRadius: "30px", fontWeight: "900", cursor: "pointer", textTransform: "uppercase" }}>
          {busy ? "Enviando..." : "Enviar Instrucciones"}
        </button>
      </form>

      <Link to="/login" style={{ marginTop: "30px", color: "#000", fontWeight: "700", fontSize: "14px" }}>VOLVER AL LOGIN</Link>
    </div>
  );
}