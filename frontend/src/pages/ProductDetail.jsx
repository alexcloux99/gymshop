import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiGet, apiPost, absUrl } from "../api/client";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { FiStar, FiShoppingBag } from "react-icons/fi";

export default function ProductDetail() {
  const { slug } = useParams();
  const { add } = useCart();
  const { token } = useAuth();
  
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [review, setReview] = useState({ rating: 5, description: "" });

  useEffect(() => {
    setLoading(true);
    setError(false);
  
    apiGet(`/api/products/${slug}/`)
      .then((data) => {
        if (data) setP(data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p style={{textAlign: 'center', padding: '100px', fontWeight: 'bold'}}>ENTRENANDO... (Cargando producto)</p>;
  if (error || !p) return <p style={{textAlign: 'center', padding: '100px'}}>No se ha encontrado el artículo.</p>;

  const sizes = ["S", "M", "L", "XL"];

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px" }}>
      
      {/* IMAGEN */}
      <div>
        <img src={absUrl(p.image)} alt={p.name} style={{ width: "100%", backgroundColor: "#f5f5f5" }} />
      </div>

      {/* INFO */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ fontSize: "12px", fontWeight: "700", color: "#666", textTransform: "uppercase" }}>
            {p.category === 'men' ? 'Hombre' : p.category === 'women' ? 'Mujer' : 'Accesorios'}
        </div>
        <h1 style={{ fontSize: "36px", fontWeight: "900", margin: 0, textTransform: "uppercase" }}>{p.name}</h1>
        <div style={{ fontSize: "24px", fontWeight: "700" }}>{p.price} €</div>

        {/* TALLAS */}
        {p.category !== "accessories" && (
          <div style={{ marginTop: "20px" }}>
            <div style={{ fontWeight: "700", marginBottom: "10px", fontSize: "14px" }}>SELECCIONAR TALLA</div>
            <div style={{ display: "flex", gap: "10px" }}>
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  style={{
                    width: "60px", height: "45px", 
                    border: selectedSize === size ? "2px solid #000" : "1px solid #ddd",
                    backgroundColor: selectedSize === size ? "#000" : "#fff",
                    color: selectedSize === size ? "#fff" : "#000",
                    fontWeight: "700", cursor: "pointer", transition: "0.2s"
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BOTÓN CARRITO */}
        <button 
          onClick={() => add(p, 1)}
          style={{
            marginTop: "30px", padding: "18px", backgroundColor: "#000", color: "#fff",
            border: "none", fontWeight: "800", fontSize: "16px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "10px"
          }}
        >
          <FiShoppingBag /> AÑADIR AL CARRITO
        </button>

        {/* DESCRIPCIÓN */}
        <div style={{ borderTop: "1px solid #eee", marginTop: "30px", paddingTop: "20px" }}>
          <div style={{ fontWeight: "700", marginBottom: "10px" }}>DESCRIPCIÓN</div>
          <p style={{ color: "#444", lineHeight: "1.6", fontSize: "15px" }}>{p.description}</p>
        </div>

        {/* RESEÑAS */}
        <div style={{ marginTop: "40px" }}>
          <div style={{ fontWeight: "900", fontSize: "18px", marginBottom: "20px", borderBottom: "2px solid #000", display: "inline-block" }}>RESEÑAS</div>
          
          {p.reviews?.length === 0 ? <p style={{color: '#888'}}>Sé el primero en opinar.</p> : (
            p.reviews?.map((r, i) => (
              <div key={i} style={{ marginBottom: "20px", paddingBottom: "15px", borderBottom: "1px solid #f0f0f0" }}>
                <div style={{ display: "flex", gap: "2px", color: "#000", marginBottom: "5px" }}>
                  {[...Array(5)].map((_, idx) => (
                    <FiStar key={idx} fill={idx < r.rating ? "#000" : "none"} size={12} />
                  ))}
                </div>
                <div style={{ fontWeight: "700", fontSize: "14px" }}>{r.username}</div>
                <p style={{ margin: "5px 0 0 0", color: "#555", fontSize: "14px" }}>{r.description}</p>
              </div>
            ))
          )}

          {token && (
            <div style={{ marginTop: "30px", backgroundColor: "#f9f9f9", padding: "20px" }}>
              <div style={{ fontWeight: "700", marginBottom: "10px" }}>DEJA TU OPINIÓN</div>
              <textarea 
                placeholder="¿Qué tal el producto?"
                style={{ width: "100%", padding: "10px", border: "1px solid #ddd", minHeight: "80px", marginBottom: "10px" }}
                onChange={(e) => setReview({...review, description: e.target.value})}
              ></textarea>
              <button style={{ backgroundColor: "#000", color: "#fff", border: "none", padding: "10px 20px", fontWeight: "700", cursor: "pointer" }}>
                ENVIAR RESEÑA
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}