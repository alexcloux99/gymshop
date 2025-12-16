import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet, apiPost } from "../api/client";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ProductDetail() {
  const { slug } = useParams();
  const { add } = useCart();
  const { token, user } = useAuth();

  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // UI local
  const [size, setSize] = useState("");
  const [rating, setRating] = useState(5);
  const [desc, setDesc] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setErr("");
    apiGet(`/api/products/get/${slug}/`)
      .then(data => { if (!ignore) setP(data); })
      .catch(e => { if (!ignore) setErr(e.message || "Error"); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [slug]);

  async function submitReview() {
    setMsg("");
    if (!token) { setMsg("Inicia sesión para opinar."); return; }
    try {
      await apiPost(`/api/products/review/${p.id}/`, { rating, description: desc }, token);
      setMsg("Gracias por tu reseña.");
      setDesc("");
      const fresh = await apiGet(`/api/products/get/${slug}/`);
      setP(fresh);
    } catch (e) {
      setMsg("No se pudo guardar la reseña: " + (e.message || "error"));
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Cargando…</div>;
  if (err) return <div style={{ padding: 16, color: "crimson" }}>Error: {err}</div>;
  if (!p) return null;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16, display: "grid", gap: 24, gridTemplateColumns: "1.2fr 1fr" }}>
      <div>
        {p.image ? (
          <img src={p.image} alt={p.name} style={{ width: "100%", maxWidth: 680, borderRadius: 10 }} />
        ) : (
          <div style={{ height: 420, background: "#f3f3f3", borderRadius: 10 }} />
        )}
      </div>

      <div>
        <h1 style={{ marginTop: 0 }}>{p.name}</h1>
        <div style={{ color: "#666", marginBottom: 8 }}>{p.category}</div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{Number(p.price).toFixed(2)} €</div>

        {/* Selector de talla */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontWeight: 600 }}>Talla: </label>
          <select value={size} onChange={(e) => setSize(e.target.value)} style={{ marginLeft: 8 }}>
            <option value="">Selecciona…</option>
            <option value="S">S</option>
            <option value="M">M</option>
            <option value="L">L</option>
            <option value="XL">XL</option>
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>Stock: {p.stock}</div>
        <button
          disabled={!size}
          onClick={() => add({ ...p, selected_size: size }, 1)}
          style={{ padding: "10px 14px", borderRadius: 8, cursor: size ? "pointer" : "not-allowed" }}
        >
          Añadir al carrito
        </button>

        <hr style={{ margin: "20px 0" }} />

        <h3>Descripción</h3>
        <p>{p.description || "Sin descripción"}</p>

        <h3 style={{ marginTop: 20 }}>Reseñas</h3>
        {Array.isArray(p.reviews) && p.reviews.length ? (
          <ul style={{ paddingLeft: 18 }}>
            {p.reviews.map((r) => (
              <li key={r.id || r.created} style={{ marginBottom: 8 }}>
                <strong>{r.username || r.user}</strong> • {r.rating}/5
                <div>{r.description}</div>
              </li>
            ))}
          </ul>
        ) : <p>No hay reseñas todavía.</p>}

        {user && (
          <div style={{ marginTop: 16, display: "grid", gap: 8, maxWidth: 420 }}>
            <h4>Escribe tu reseña</h4>
            <label>
              Puntuación:
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))} style={{ marginLeft: 8 }}>
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
            <textarea
              placeholder="¿Qué tal el producto?"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={3}
            />
            <button onClick={submitReview}>Enviar reseña</button>
            {msg && <div style={{ color: msg.startsWith("No se pudo") ? "crimson" : "green" }}>{msg}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
