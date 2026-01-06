import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/ProductCard";

export default function Favorites() {
  const { wishlist } = useWishlist();

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ fontWeight: "900", textTransform: "uppercase", textAlign: "center", marginBottom: "40px" }}>Mis Favoritos</h1>
      
      {wishlist.length === 0 ? (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <p style={{ color: "#666" }}>No tienes ningún artículo guardado.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "30px" }}>
          {wishlist.map(p => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}