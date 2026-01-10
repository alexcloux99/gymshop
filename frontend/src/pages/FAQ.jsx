export default function FAQ() {
  return (
    <div style={{ 
      maxWidth: "1200px", // Más ancho como Gymshark
      margin: "60px auto", 
      padding: "0 40px", // Más aire a los lados
      fontFamily: "Helvetica, Arial, sans-serif",
      textAlign: "left" // Aseguramos alineación a la izquierda
    }}>
      <h1 style={{ fontWeight: "900", fontSize: "32px", marginBottom: "50px", letterSpacing: "-1px" }}>PREGUNTAS FRECUENTES</h1>
      
      <div style={{ maxWidth: "800px" }}> {/* El texto de lectura sí conviene que no sea infinito */}
        <div style={{ marginBottom: "40px" }}>
          <h3 style={{ fontWeight: "800", fontSize: "18px", marginBottom: "15px" }}>¿CUÁNTO TARDA MI PEDIDO?</h3>
          <p style={{ color: "#444", fontSize: "15px", lineHeight: "1.6" }}>Los envíos en España peninsular tardan entre 24 y 48 horas laborables una vez confirmado el pedido.</p>
        </div>
        
        <div style={{ marginBottom: "40px" }}>
          <h3 style={{ fontWeight: "800", fontSize: "18px", marginBottom: "15px" }}>¿QUÉ MÉTODOS DE PAGO ACÉPTAIS?</h3>
          <p style={{ color: "#444", fontSize: "15px", lineHeight: "1.6" }}>Aceptamos PayPal para pagos inmediatos y Pago Contra-reembolso para mayor comodidad.</p>
        </div>
      </div>
    </div>
  );
}