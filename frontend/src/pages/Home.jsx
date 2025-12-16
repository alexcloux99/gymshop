import { useEffect, useState } from "react";
import { apiGet } from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";

function useDebouncedValue(value, ms) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

export default function Home() {
  const [data, setData] = useState({ items: [], count: 0, next: null, previous: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [category, setCategory] = useState("");
  const [ordering, setOrdering] = useState("");
  const [page, setPage] = useState(1);
  const [rawQ, setRawQ] = useState("");
  const q = useDebouncedValue(rawQ, 300);

  useEffect(() => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q)        params.set("q", q);
    if (ordering) params.set("ordering", ordering);
    if (page)     params.set("page", String(page));

    apiGet(`/api/products/?${params.toString()}`)
      .then((payload) => {
        const items = Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.results)
          ? payload.results
          : Array.isArray(payload)
          ? payload
          : [];

        const meta = payload?.meta ?? {
          next: payload?.next ?? null,
          previous: payload?.previous ?? null,
          count: payload?.count ?? items.length,
        };

        setData({ items, count: meta.count ?? 0, next: meta.next ?? null, previous: meta.previous ?? null });
      })
      .catch((e) => {
        setError(e.message || "Error");
        setData({ items: [], count: 0, next: null, previous: null });
      })
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

        <input
          placeholder="Buscar..."
          value={rawQ}
          onChange={(e) => { setRawQ(e.target.value); setPage(1); }}
        />
      </div>

      {loading && <p>Cargando…</p>}
      {error && <p style={{ color: "crimson" }}>Error: {error}</p>}

      {!loading && !error && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {data.items.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 16 }}>
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹ Anterior</button>
            <span>Página {page} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>Siguiente ›</button>
          </div>
        </>
      )}
    </div>
  );
}
