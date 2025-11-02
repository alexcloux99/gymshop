import { useCart } from "../context/CartContext";

export default function ProductCard({ p }) {
  const { add } = useCart();
  return (
    <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 12 }}>
      {p.image_url ? (
        <img src={p.image_url} alt={p.name} style={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 6 }} />
      ) : (
        <div style={{ height: 180, background: "#f3f3f3", borderRadius: 6 }} />
      )}
      <h3 style={{ margin: "8px 0" }}>{p.name}</h3>
      <div style={{ fontSize: 12, color: "#666" }}>{p.category_label}</div>
      <div style={{ margin: "8px 0", fontWeight: 600 }}>{p.price.toFixed ? p.price.toFixed(2) : p.price} €</div>
      <button onClick={() => add(p, 1)} style={{ padding: "8px 12px", borderRadius: 6, cursor: "pointer" }}>
        Añadir al carrito
      </button>
    </div>
  );
}
