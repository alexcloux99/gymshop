import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { absUrl } from "../api/client"; 

export default function ProductCard({ p }) {
  const { add } = useCart();
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
      <Link to={`/product/${p.slug || p.id}`}>
        {p.image ? (
          <img src={absUrl(p.image)} alt={p.name}
               style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 6 }} />
        ) : (
          <div style={{ height: 180, background: "#f3f3f3", borderRadius: 6 }} />
        )}
      </Link>
      <h3 style={{ margin: "8px 0" }}>
        <Link to={`/product/${p.slug || p.id}`} style={{ textDecoration: "none", color: "inherit" }}>
          {p.name}
        </Link>
      </h3>
      <div style={{ fontSize: 12, color: "#666" }}>{p.category || p.category_label}</div>
      <div style={{ margin: "8px 0", fontWeight: 600 }}>{Number(p.price).toFixed(2)} €</div>
      <button onClick={() => add(p, 1)} style={{ padding: "8px 12px", borderRadius: 6, cursor: "pointer" }}>
        Añadir al carrito
      </button>
    </div>
  );
}
