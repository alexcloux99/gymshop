import { useState } from "react";
import { apiPost } from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate, useLocation } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await apiPost("/api/auth/token/", { email, password });
      // guardar access + refresh
      login(email, data.access, data.refresh);
      nav(loc.state?.from?.pathname || "/");
    } catch (_) {
      setError("Email o contraseña incorrectos.");
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto" }}>
      <h2>Entrar</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
        <input type="email" placeholder="Email" value={email} required maxLength={80} onChange={(e) => setEmail(e.target.value)} />
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type={show ? "text" : "password"}
            placeholder="Contraseña"
            value={password}
            minLength={8}
            maxLength={64}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="button" onClick={() => setShow(s => !s)}>{show ? "Ocultar" : "Ver"}</button>
        </div>
        {error && <div style={{ color: "crimson" }}>{error}</div>}
        <button>Entrar</button>
      </form>
    </div>
  );
}
