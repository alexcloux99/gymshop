import { useEffect, useState } from "react";
import { apiGet } from "../api/client";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [data, setData] = useState({ results: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const [ordering, setOrdering] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (q) params.set("q", q);
    if (ordering) params.set("ordering", ordering);
    apiGet(`/api/products/?${params.toString()}`)
      .then(setData)
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [category, q, ordering]);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h1>GymShop</h1>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Todas</option>
          <option value="men">Hombre</option>
          <option value="women">Mujer</option>
          <option value="accessories">Accesorios</option>
        </select>
        <select value={ordering} onChange={(e) => setOrdering(e.target.value)}>
          <option value="">Orden</option>
          <option value="price">Precio ↑</option>
          <option value="-price">Precio ↓</option>
          <option value="name">Nombre A-Z</option>
          <option value="-created_at">Nuevos</option>
        </select>
        <input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {loading ? <p>Cargando…</p> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
          {data.results.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
