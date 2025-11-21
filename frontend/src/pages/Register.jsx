import { useState } from "react";
import { apiPost } from "../api/client";
import { useNavigate } from "react-router-dom";

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,24}$/;

export default function Register() {
  const [email, setEmail] = useState("");
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const emailOk = EMAIL_RE.test(email) && email.length <= 80;
  const pwOk = p1.length >= 8 && p1.length <= 64; 
  const match = p1 === p2;
  const canSubmit = emailOk && pwOk && match;

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    if (!canSubmit) return;
    try {
      // AQUÍ estaba tu fallo: faltaba password2
      await apiPost("/api/auth/register/", { email, password: p1, password2: p2 });
      nav("/login");
    } catch (e) {
      setErr("No se pudo registrar: " + (e.message || "error"));
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto" }}>
      <h2>Crear cuenta</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 8 }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          maxLength={80}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type={show1 ? "text" : "password"}
            placeholder="Contraseña (8 a 64)"
            value={p1}
            minLength={8}
            maxLength={64}
            required
            onChange={(e) => setP1(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="button" onClick={() => setShow1((s) => !s)}>{show1 ? "Ocultar" : "Ver"}</button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type={show2 ? "text" : "password"}
            placeholder="Repite la contraseña"
            value={p2}
            minLength={8}
            maxLength={64}
            required
            onChange={(e) => setP2(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="button" onClick={() => setShow2((s) => !s)}>{show2 ? "Ocultar" : "Ver"}</button>
        </div>

        {!emailOk && email.length > 0 && <small style={{ color: "crimson" }}>Email no válido.</small>}
        {!pwOk && p1.length > 0 && <small style={{ color: "crimson" }}>La contraseña debe tener entre 8 y 64 caracteres.</small>}
        {!match && p2.length > 0 && <small style={{ color: "crimson" }}>Las contraseñas no coinciden.</small>}
        {err && <div style={{ color: "crimson" }}>{err}</div>}

        <button disabled={!canSubmit}>Crear cuenta</button>
      </form>
    </div>
  );
}
