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
  
  // Estados para las reseñas
  const [review, setReview] = useState({ rating: 0, description: "" });
  const [sendingReview, setSendingReview] = useState(false);
  const [visibleReviews, setVisibleReviews] = useState(2); 

  const [toast, setToast] = useState({ show: false, msg: "" });

  const loadProduct = () => {
    setLoading(true);
    apiGet(`/api/products/${slug}/`)
      .then((data) => {
        if (data) setP(data);
        else setError(true);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProduct();
  }, [slug]);

  const showNotification = (msg) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: "" }), 3000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (review.rating === 0) {
      showNotification("POR FAVOR, ELIGE UNA PUNTUACIÓN");
      return;
    }
    if (!review.description.trim()) {
      showNotification("ESCRIBE UN COMENTARIO");
      return;
    }

    setSendingReview(true);
    try {
      await apiPost(`/api/products/review/${p.id}/`, review, token);
      setReview({ rating: 0, description: "" });
      const updatedProduct = await apiGet(`/api/products/${slug}/`);
      setP(updatedProduct);
      showNotification("¡GRACIAS POR TU OPINIÓN!");
    } catch (err) {
      showNotification("ERROR AL ENVIAR");
    } finally {
      setSendingReview(false);
    }
  };

  if (loading) return <p style={{textAlign: 'center', padding: '100px', fontWeight: 'bold'}}>... (Cargando producto)</p>;
  if (error || !p) return <p style={{textAlign: 'center', padding: '100px'}}>No se ha encontrado el artículo.</p>;
  const sizes = ["S", "M", "L", "XL"];
  const selectedVariant = p.variants?.find(v => v.size === selectedSize);
  const currentStock = selectedVariant ? selectedVariant.stock : 0;
  
  const showSizeSelector = p.category === 'men' || p.category === 'women' || (p.category === 'accessories' && p.variants?.length > 0 && p.variants[0].size !== 'N/A');

  return (
    <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "60px", fontFamily: "Helvetica, Arial, sans-serif", position: "relative" }}>
      
      {toast.show && (
        <div style={{
          position: "fixed", top: "100px", right: "20px",
          backgroundColor: "#000", color: "#fff", padding: "15px 30px",
          borderRadius: "4px", fontWeight: "900", zIndex: 9999, fontSize: "12px",
          boxShadow: "0 4px 15px rgba(0,0,0,0.2)", animation: "slideIn 0.3s ease-out"
        }}>{toast.msg}</div>
      )}

      <div>
        <img src={absUrl(p.image)} alt={p.name} style={{ width: "100%", backgroundColor: "#f5f5f5" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ fontSize: "12px", fontWeight: "700", color: "#666", textTransform: "uppercase" }}>
            {p.category === 'men' ? 'Hombre' : p.category === 'women' ? 'Mujer' : 'Accesorios'}
        </div>
        <h1 style={{ fontSize: "36px", fontWeight: "900", margin: 0, textTransform: "uppercase" }}>{p.name}</h1>
        <div style={{ fontSize: "24px", fontWeight: "700" }}>{p.price} €</div>
        {selectedSize && (currentStock === 0 || currentStock < 10) && (  // Mostrar mensaje de ultimas unidades a partir de 10 unidades en stock
          <div style={{ marginTop: "10px", animation: "fadeIn 0.3s ease" }}>
            {currentStock === 0 ? (
              <span style={{ color: "#d32f2f", fontWeight: "800", fontSize: "11px", textTransform: "uppercase" }}>
                ● Agotado: Talla {selectedSize} no disponible
              </span>
            ) : (
              <span style={{ color: "#000", backgroundColor: "#ccff00", padding: "4px 10px", fontWeight: "900", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                ¡Últimas unidades disponibles!
              </span>
            )}
          </div>
        )}

        {/* SELECCIONAR TALLA */}
        {showSizeSelector && (
          <div style={{ marginTop: "15px" }}>
            <div style={{ fontWeight: "700", marginBottom: "12px", fontSize: "13px", letterSpacing: "0.5px" }}>
              SELECCIONAR TALLA
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              {sizes.map(size => {
                const variant = p.variants?.find(v => v.size === size);
                const hasStock = variant ? variant.stock > 0 : false;

                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      width: "65px", height: "48px", 
                      border: selectedSize === size ? "2px solid #000" : "1px solid #ddd",
                      backgroundColor: selectedSize === size ? "#000" : "#fff",
                      color: selectedSize === size ? "#fff" : (!hasStock ? "#ccc" : "#000"),
                      fontWeight: "900", cursor: "pointer", transition: "0.2s",
                      position: 'relative', overflow: 'hidden'
                    }}
                  >
                    {size}
                    {!hasStock && (
                      <div style={{ 
                        position: 'absolute', top: '50%', left: 0, width: '100%', 
                        height: '1px', backgroundColor: '#ccc', transform: 'rotate(-45deg)' 
                      }}></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button 
          onClick={() => {
              if (showSizeSelector && !selectedSize) {
                showNotification("ELIGE UNA TALLA");
                return;
              }
              if (selectedSize && currentStock === 0) {
                showNotification("TALLA AGOTADA");
                return;
              }
              add({ ...p, size: selectedSize || "N/A" }, 1);
              showNotification("AÑADIDO AL CARRITO");
            }}
          disabled={showSizeSelector && selectedSize && currentStock === 0}
          style={{
            marginTop: "10px", padding: "20px", 
            backgroundColor: (selectedSize && currentStock === 0) ? "#666" : "#000", 
            color: "#fff", border: "none", fontWeight: "900", fontSize: "15px", 
            cursor: (selectedSize && currentStock === 0) ? "not-allowed" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "12px",
            textTransform: "uppercase"
          }}
        >
          {(selectedSize && currentStock === 0) ? "TALLA AGOTADA" : <><FiShoppingBag size={18} /> AÑADIR AL CARRITO</>}
        </button>

        <div style={{ borderTop: "1px solid #eee", marginTop: "30px", paddingTop: "20px" }}>
          <div style={{ fontWeight: "900", marginBottom: "12px", fontSize: "14px", textTransform: "uppercase" }}>Descripción</div>
          <p style={{ color: "#444", lineHeight: "1.7", fontSize: "15px" }}>{p.description}</p>
        </div>

        <div style={{ marginTop: "40px" }}>
          <h2 style={{ fontWeight: "900", fontSize: "20px", marginBottom: "25px", borderBottom: "2px solid #000", display: "inline-block", textTransform: "uppercase" }}>RESEÑAS</h2>
          
          {p.reviews?.length === 0 ? <p style={{color: '#888', fontSize: '14px'}}>Aún no hay reseñas.</p> : (
            <>
              {p.reviews.slice(0, visibleReviews).map((r, i) => (
                <div key={i} style={{ marginBottom: "20px", padding: "20px", backgroundColor: "#fafafa", borderRadius: "4px", border: "1px solid #f0f0f0" }}>
                  <div style={{ display: "flex", gap: "3px", marginBottom: "10px" }}>
                    {[...Array(5)].map((_, idx) => (
                      <FiStar key={idx} fill={idx < r.rating ? "#000" : "none"} size={13} color={idx < r.rating ? "#000" : "#ccc"} />
                    ))}
                  </div>
                  <div style={{ fontWeight: "800", fontSize: "14px", marginBottom: "5px", textTransform: "capitalize" }}>
                      {r.username.split('@')[0]}
                  </div>
                  <p style={{ margin: 0, color: "#444", fontSize: "14px", fontStyle: "italic" }}>"{r.description}"</p>
                </div>
              ))}

              {/* Creamos un boton para ver mas reseñas a partir de 2  */}
              {p.reviews.length > visibleReviews && (
                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button 
                        onClick={() => setVisibleReviews(prev => prev + 4)} 
                        style={{
                            backgroundColor: '#fff', color: '#000', border: '2px solid #000',
                            padding: '12px 30px', borderRadius: '30px', fontWeight: '900',
                            fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase'
                        }}
                    >
                        Cargar más reseñas
                    </button>
                </div>
              )}
            </>
          )}

          {token && (
            <div style={{ marginTop: "30px", backgroundColor: "#f9f9f9", padding: "25px", borderRadius: "4px" }}>
              <div style={{ fontWeight: "900", marginBottom: "15px", fontSize: "14px", textTransform: "uppercase" }}>Deja tu opinión</div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "15px" }}>
                {[1, 2, 3, 4, 5].map((num) => (
                  <FiStar key={num} size={24} style={{ cursor: "pointer" }} onClick={() => setReview({...review, rating: num})}
                    fill={num <= review.rating ? "#000" : "none"} color={num <= review.rating ? "#000" : "#ccc"} />
                ))}
              </div>
              <textarea placeholder=" ¿Qué te ha parecido el producto?..." value={review.description} 
                style={{ width: "100%", padding: "12px", border: "1px solid #ddd", minHeight: "100px", marginBottom: "15px", fontFamily: "inherit", outline: "none" }}
                onChange={(e) => setReview({...review, description: e.target.value})}
              ></textarea>
              <button onClick={handleReviewSubmit} disabled={sendingReview}
                style={{ backgroundColor: "#000", color: "#fff", border: "none", padding: "15px 30px", fontWeight: "900", cursor: "pointer", textTransform: "uppercase", fontSize: "12px" }}
              >
                {sendingReview ? "ENVIANDO..." : "Enviar Reseña"}
              </button>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
    </div>
  );
}