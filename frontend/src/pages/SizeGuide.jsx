export default function SizeGuide() {
  return (
    <div style={{ 
      maxWidth: "1200px", 
      margin: "60px auto", 
      padding: "0 40px", 
      fontFamily: "Helvetica, Arial, sans-serif",
      textAlign: "left" 
    }}>
      <h1 style={{ 
        fontWeight: "900", 
        fontSize: "32px", 
        marginBottom: "50px", 
        letterSpacing: "-1px" 
      }}>
        GUÍA DE TALLAS
      </h1>

      <div style={{ maxWidth: "900px" }}>
        <p style={{ color: "#666", fontSize: "15px", marginBottom: "30px", lineHeight: "1.6" }}>
          Nuestra ropa de gym está diseñada para un ajuste atlético. Si prefieres un ajuste más holgado, te recomendamos elegir una talla superior.
        </p>

        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", marginBottom: "50px" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #000" }}>
              <th style={{ padding: "20px 0", fontSize: "14px", fontWeight: "900", textTransform: "uppercase" }}>Talla</th>
              <th style={{ padding: "20px 0", fontSize: "14px", fontWeight: "900", textTransform: "uppercase" }}>Pecho (CM)</th>
              <th style={{ padding: "20px 0", fontSize: "14px", fontWeight: "900", textTransform: "uppercase" }}>Cintura (CM)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "20px 0", fontWeight: "700" }}>S</td>
              <td style={{ padding: "20px 0", color: "#444" }}>90 - 95</td>
              <td style={{ padding: "20px 0", color: "#444" }}>75 - 80</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "20px 0", fontWeight: "700" }}>M</td>
              <td style={{ padding: "20px 0", color: "#444" }}>96 - 101</td>
              <td style={{ padding: "20px 0", color: "#444" }}>81 - 86</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "20px 0", fontWeight: "700" }}>L</td>
              <td style={{ padding: "20px 0", color: "#444" }}>102 - 107</td>
              <td style={{ padding: "20px 0", color: "#444" }}>87 - 92</td>
            </tr>
            <tr style={{ borderBottom: "1px solid #eee" }}>
              <td style={{ padding: "20px 0", fontWeight: "700" }}>XL</td>
              <td style={{ padding: "20px 0", color: "#444" }}>108 - 113</td>
              <td style={{ padding: "20px 0", color: "#444" }}>93 - 98</td>
            </tr>
          </tbody>
        </table>

        {/* DETALLE EXTRA PRO */}
        <div style={{ backgroundColor: "#f9f9f9", padding: "30px", borderRadius: "4px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", marginBottom: "15px", textTransform: "uppercase" }}>¿Cómo medir?</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
            <div>
              <p style={{ fontWeight: "700", fontSize: "14px", marginBottom: "5px" }}>PECHO</p>
              <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.5" }}>Mide alrededor de la parte más ancha del pecho, manteniendo la cinta métrica horizontal.</p>
            </div>
            <div>
              <p style={{ fontWeight: "700", fontSize: "14px", marginBottom: "5px" }}>CINTURA</p>
              <p style={{ fontSize: "13px", color: "#666", lineHeight: "1.5" }}>Mide alrededor de la parte más estrecha de la cintura (normalmente la zona lumbar y donde el cuerpo se dobla de lado a lado).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}