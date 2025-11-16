import { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [data, setData] = useState({ results: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [ordering, setOrdering] = useState("");
  const [error, setError] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (ordering) params.set("ordering", ordering);
    if (page) params.set("page", page);
    apiGet(`/api/products/?${params.toString()}`)
      .then((d) => setData(d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [category, q, ordering, page]);

  const totalPages = Math.max(1, Math.ceil((data.count || 0) / 12));

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h1>GymShop</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">Todas</option>
          <option value="men">Hombre</option>
          <option value="women">Mujer</option>
          <option value="accessories">Accesorios</option>
        </select>
        <select value={ordering} onChange={(e) => { setOrdering(e.target.value); setPage(1); }}>
          <option value="">Orden</option>
          <option value="price">Precio ↑</option>
          <option value="-price">Precio ↓</option>
          <option value="name">Nombre A-Z</option>
          <option value="-created_at">Nuevos</option>
        </select>
        <input placeholder="Buscar..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
      </div>

      {loading && <p>Cargando…</p>}
      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      {!loading && !error && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {data.results.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16 }}>
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹ Anterior</button>
            <span>Página {page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Siguiente ›</button>
          </div>
        </>
      )}
    </div>
  );
}