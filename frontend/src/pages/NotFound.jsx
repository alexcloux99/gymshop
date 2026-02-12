import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "100px 20px", fontFamily: "Helvetica, Arial, sans-serif" }}>
      <h1 style={{ fontSize: "120px", fontWeight: "900", margin: 0, letterSpacing: "-5px" }}>404</h1>
      <p style={{ fontSize: "18px", fontWeight: "700", textTransform: "uppercase", marginBottom: "10px" }}>
        Página no encontrada
      </p>
      <p style={{ color: "#666", fontSize: "14px", marginBottom: "40px" }}>
        Este un error personalizado.
      </p>
      <Link to="/" style={{ backgroundColor: "#000", color: "#fff", padding: "15px 40px", fontWeight: "900", textDecoration: "none", fontSize: "13px", textTransform: "uppercase" }}>
        VOLVER A LA TIENDA
      </Link>
    </div>
  );
}