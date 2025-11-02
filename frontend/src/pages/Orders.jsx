import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiGet } from "../api/client";

export default function Orders() {
  const { token } = useAuth();
  const [data, setData] = useState({ results: [] });
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!token) { setErr("Inicia sesión."); return; }
    apiGet("/api/orders/mine/", token)
      .then(setData)
      .catch((e) => setErr("Error: " + e.message));
  }, [token]);

  if (err) return <p>{err}</p>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Mis pedidos</h2>
      {data.results.map(o => (
        <div key={o.id} style={{ border: "1px solid #eee", padding: 10, borderRadius: 8, marginBottom: 8 }}>
          <div><strong>#{o.id}</strong> • {o.status} • {o.total} €</div>
          <ul>
            {o.items.map((it, idx) => (
              <li key={idx}>{it.product_name} x{it.qty} — {it.price} €</li>
            ))}
          </ul>
        </div>
      ))}
      {!data.results.length && <p>No hay pedidos.</p>}
    </div>
  );
}
