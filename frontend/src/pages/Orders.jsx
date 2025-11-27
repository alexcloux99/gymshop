import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiGet, apiPost } from "../api/client";

const statusLabel = s =>
  ({ pending: "Pendiente", paid: "Pagado", delivered: "Entregado" }[s] || s);

export default function Orders() {
  const { token, user } = useAuth();
  const [data, setData] = useState({ results: [], next: null, previous: null, count: 0 });
  const [err, setErr] = useState("");
  const [page, setPage] = useState(1);
  const isAdmin = !!user?.is_staff;

  useEffect(() => {
    if (!token) { setErr("Inicia sesión."); return; }
    setErr("");
    apiGet(`/api/orders/mine/?page=${page}`, token)
      .then((d) => setData(d))
      .catch((e) => setErr("Error: " + (e.message || "desconocido")));
  }, [token, page]);

  async function markPaid(id) {
    try {
      await apiPost(`/api/orders/${id}/mark-paid/`, {}, token);
      // refresca la página actual
      const d = await apiGet(`/api/orders/mine/?page=${page}`, token);
      setData(d);
    } catch (e) {
      alert("No se pudo marcar como pagado: " + (e.message || "error"));
    }
  }

  if (err) return <p>{err}</p>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h2>Mis pedidos</h2>

      {data.results.map(o => (
        <div key={o.id} style={{ border: "1px solid #eee", padding: 10, borderRadius: 8, marginBottom: 8 }}>
          <div><strong>#{o.id}</strong> • {statusLabel(o.status)} • {o.total} €</div>
          <ul>
            {o.items?.map((it, idx) => (
              <li key={idx}>{it.product_name || it.product} x{it.qty} — {it.price} €</li>
            ))}
          </ul>

          {isAdmin && o.status !== "paid" && (
            <button onClick={() => markPaid(o.id)}>Marcar como pagado</button>
          )}
        </div>
      ))}

      {!data.results.length && <p>No hay pedidos.</p>}

      {(data.previous || data.next) && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16 }}>
          <button disabled={!data.previous} onClick={() => setPage(p => Math.max(1, p - 1))}>‹ Anterior</button>
          <span>Página {page} {data.count ? `• ${data.count} pedidos` : ""}</span>
          <button disabled={!data.next} onClick={() => setPage(p => p + 1)}>Siguiente ›</button>
        </div>
      )}
    </div>
  );
}
