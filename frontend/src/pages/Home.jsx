import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet } from "../api/client.js";
import ProductCard from "../components/ProductCard.jsx";

export default function Home() {
  const { cat } = useParams();
  const [data, setData] = useState({ items: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");

  useEffect(() => {
    setCategory(cat || "");
  }, [cat]);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);

    apiGet(`/api/products/?${params.toString()}`)
      .then((payload) => {
        const items = payload?.results || payload?.data || payload || [];
        setData({ items, count: items.length });
      })
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "40px 20px" }}>
      {category && (
        <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '30px', textTransform: 'uppercase' }}>
            {category === 'men' ? 'Hombre' : category === 'women' ? 'Mujer' : 'Accesorios'}
        </h2>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', marginTop: '50px', fontWeight: 'bold' }}>CARGANDO...</p>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
          gap: "30px" 
        }}>
          {data.items.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}