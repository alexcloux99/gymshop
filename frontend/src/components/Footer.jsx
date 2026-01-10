import { Link } from "react-router-dom";
import { 
  FaInstagram, 
  FaTiktok, 
  FaYoutube, 
  FaFacebook, 
  FaPaypal, 
  FaTruckFast 
} from "react-icons/fa6";

export default function Footer() {
  return (
    <footer style={{
      marginTop: "100px",
      borderTop: "1px solid #eee",
      backgroundColor: "#fff",
      padding: "80px 40px 40px 40px",
      fontFamily: "Helvetica, Arial, sans-serif"
    }}>
      <div style={{
        maxWidth: "1300px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "40px",
        paddingBottom: "40px",
        textAlign: "left"
      }}>
        
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: "900", marginBottom: "20px", letterSpacing: "1px" }}>AYUDA</h3>
          <ul style={{ listStyle: "none", padding: 0, fontSize: "13px", lineHeight: "2.5", color: "#666" }}>
            <li><Link to="/faq" style={{ textDecoration: "none", color: "inherit" }}>Preguntas frecuentes</Link></li>
            <li><Link to="/shipping" style={{ textDecoration: "none", color: "inherit" }}>Envíos y devoluciones</Link></li>
            <li><Link to="/size-guide" style={{ textDecoration: "none", color: "inherit" }}>Guía de tallas</Link></li>
          </ul>
        </div>

        <div>
          <h3 style={{ fontSize: "14px", fontWeight: "900", marginBottom: "20px", letterSpacing: "1px" }}>MI CUENTA</h3>
          <ul style={{ listStyle: "none", padding: 0, fontSize: "13px", lineHeight: "2.5", color: "#666" }}>
            <li><Link to="/orders" style={{ textDecoration: "none", color: "inherit" }}>Mis pedidos</Link></li>
            <li><Link to="/favorites" style={{ textDecoration: "none", color: "inherit" }}>Favoritos</Link></li>
          </ul>
        </div>

        <div>
          <h3 style={{ fontSize: "14px", fontWeight: "900", marginBottom: "20px", letterSpacing: "1px" }}>SOBRE GYMSHOP</h3>
          <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.6" }}>
            Tu tienda de confianza para ropa de alto rendimiento. Envíos garantizados en 24/48h.
          </p>
        </div>
      </div>

      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "30px 0",
        borderTop: "1px solid #f5f5f5",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "20px"
      }}>
        
        <div style={{ display: "flex", gap: "20px", alignItems: "center", color: "#888" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaPaypal size={24} color="#003087" />
            <span style={{ fontSize: "11px", fontWeight: "bold" }}>PAGO SEGURO</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FaTruckFast size={24} color="#000" />
            <span style={{ fontSize: "11px", fontWeight: "bold" }}>CONTRA-REEMBOLSO</span>
          </div>
        </div>

        {/* Redes sociales */}
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <a href="https://instagram.com" target="_blank" rel="noreferrer" style={{ color: "#000" }}><FaInstagram size={22} /></a>
          <a href="https://tiktok.com" target="_blank" rel="noreferrer" style={{ color: "#000" }}><FaTiktok size={20} /></a>
          <a href="https://facebook.com" target="_blank" rel="noreferrer" style={{ color: "#000" }}><FaFacebook size={22} /></a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer" style={{ color: "#000" }}><FaYoutube size={24} /></a>
        </div>
      </div>

      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "11px",
        color: "#aaa",
        fontWeight: "bold"
      }}>
        <span>© {new Date().getFullYear()} GYMSHOP.</span>
        <div style={{ display: "flex", gap: "25px" }}>
            <span>POLÍTICA DE PRIVACIDAD</span>
        </div>
      </div>
    </footer>
  );
}