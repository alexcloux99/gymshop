import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { apiGet } from "../api/client";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { slug } = useParams();
  const { add } = useCart();
  const [p, setP] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    setErr(""); setP(null);
    apiGet(`/api/products/${slug}/`)
      .then((data) => alive && setP(data))
      .catch((e) => alive && setErr(e.message));
    return () => { alive = false; };
  }, [slug]);

  if (err) return <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>Error: {err}</div>;
  if (!p) return <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>Cargando…</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <Link to="/">← Volver</Link>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 12 }}>
        <div>
          {p.image_url ? (
            <img src={p.image_url} alt={p.name} style={{ width: "100%", borderRadius: 8 }} />
          ) : (
            <div style={{ height: 360, background: "#f3f3f3", borderRadius: 8 }} />
          )}
        </div>
        <div>
          <h2>{p.name}</h2>
          <div style={{ color: "#666", marginBottom: 8 }}>{p.category_label}</div>
          <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
            {Number(p.price).toFixed(2)} €
          </div>
          <p style={{ whiteSpace: "pre-wrap" }}>{p.description || "Sin descripción."}</p>
          <div style={{ marginTop: 16 }}>
            <button onClick={() => add(p, 1)} style={{ padding: "10px 14px", borderRadius: 6, cursor: "pointer" }}>
              Añadir al carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
