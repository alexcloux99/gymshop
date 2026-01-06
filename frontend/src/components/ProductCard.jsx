import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { absUrl } from "../api/client";
import { useWishlist } from "../context/WishlistContext.jsx";
import { FiHeart } from "react-icons/fi";

export default function ProductCard({ p }) {
  const { add } = useCart();
  const { toggleWishlist, isFavorite } = useWishlist();
  
  const fav = isFavorite(p.id);

  return (
    <div style={{ 
      position: "relative", 
      backgroundColor: "#fff", 
      transition: "transform 0.2s" 
    }}>
      
      {/* boton de favoritos */}
      <div 
        onClick={() => toggleWishlist(p)}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          zIndex: 10,
          cursor: "pointer",
          backgroundColor: "rgba(255,255,255,0.8)",
          borderRadius: "50%",
          padding: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
        }}
      >
        <FiHeart 
          size={20} 
          fill={fav ? "red" : "none"} 
          color={fav ? "red" : "#000"} 
        />
      </div>

      {/* IMAGEN DEL PRODUCTO */}
      <Link to={`/product/${p.slug || p.id}`} style={{ textDecoration: "none" }}>
        {p.image ? (
          <img 
            src={absUrl(p.image)} 
            alt={p.name}
            style={{ 
              width: "100%", 
              aspectRatio: "3/4",
              objectFit: "cover", 
              backgroundColor: "#f5f5f5" 
            }} 
          />
        ) : (
          <div style={{ aspectRatio: "3/4", background: "#f3f3f3" }} />
        )}
      </Link>

      <div style={{ padding: "12px 0" }}>
        <h3 style={{ 
          margin: "0 0 4px 0", 
          fontSize: "14px", 
          fontWeight: "700", 
          textTransform: "uppercase",
          letterSpacing: "0.5px"
        }}>
          <Link to={`/product/${p.slug || p.id}`} style={{ textDecoration: "none", color: "#000" }}>
            {p.name}
          </Link>
        </h3>
        
        <div style={{ 
          fontSize: "12px", 
          color: "#666", 
          marginBottom: "8px",
          fontWeight: "500" 
        }}>
            {p.category === 'men' ? 'Hombre' : p.category === 'women' ? 'Mujer' : 'Accesorios'}
            {p.size && p.size !== 'N/A' && ` | Talla ${p.size}`}
        </div>

        <div style={{ 
          margin: "8px 0", 
          fontWeight: "800", 
          fontSize: "16px" 
        }}>
            {Number(p.price).toFixed(2)} €
        </div>

        <button 
          onClick={() => add(p, 1)} 
          style={{ 
            width: "100%",
            padding: "10px", 
            backgroundColor: "#000", 
            color: "#fff",
            border: "none",
            fontWeight: "700",
            fontSize: "12px",
            textTransform: "uppercase",
            cursor: "pointer",
            marginTop: "5px",
            borderRadius: "2px"
          }}
        >
          Añadir al carrito
        </button>
      </div>
    </div>
  );
}