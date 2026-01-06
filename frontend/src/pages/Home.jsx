import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { apiGet } from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Home() {
  const { cat } = useParams();
  const location = useLocation();
  const [data, setData] = useState({ items: [], count: 0 });
  const [loading, setLoading] = useState(true);


  const query = new URLSearchParams(location.search).get("q");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (cat) params.set("category", cat);
    if (query) params.set("q", query);

    apiGet(`/api/products/?${params.toString()}`)
      .then((payload) => {
        const items = payload?.results || payload?.data || payload || [];
        setData({ items, count: items.length });
      })
      .finally(() => setLoading(false));
  }, [cat, query]); 

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 20px" }}>
      <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '30px', textTransform: 'uppercase' }}>
          {query ? `Resultados para: ${query}` : (cat ? (cat === 'men' ? 'Hombre' : cat === 'women' ? 'Mujer' : 'Accesorios') : 'Novedades')}
      </h2>

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '50px', fontWeight: 'bold' }}>CARGANDO...</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "30px" }}>
          {data.items.length > 0 ? (
            data.items.map((p) => <ProductCard key={p.id} p={p} />)
          ) : (
            <p style={{ gridColumn: "1/-1", textAlign: "center", color: "#666" }}>No se han encontrado productos.</p>
          )}
        </div>
      )}
    </div>
  );
}