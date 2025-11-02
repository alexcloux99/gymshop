import { useState } from "react";
import { apiPost } from "../api/client";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("alex");
  const [password, setPassword] = useState("Secret123!");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await apiPost("/api/auth/token/", { username, password });
      login(username, data.access);
      nav("/");
    } catch (err) {
      setError("Credenciales inválidas");
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto" }}>
      <h2>Entrar</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" />
        {error && <div style={{ color: "crimson" }}>{error}</div>}
        <button>Entrar</button>
      </form>
    </div>
  );
}
