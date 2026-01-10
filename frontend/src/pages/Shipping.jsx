export default function Shipping() {
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
        ENVÍOS Y DEVOLUCIONES
      </h1>

      <div style={{ maxWidth: "800px" }}>
        {/* SECCIÓN DE ENVÍOS */}
        <div style={{ marginBottom: "50px" }}>
          <h2 style={{ fontWeight: "800", fontSize: "18px", marginBottom: "20px", textTransform: "uppercase" }}>
            Información de Envío
          </h2>
          <p style={{ color: "#444", fontSize: "15px", lineHeight: "1.8", marginBottom: "15px" }}>
            En <strong>GYMSHOP</strong> nos esforzamos por que recibas tu equipamiento lo antes posible para que no pares de entrenar.
          </p>
          <ul style={{ color: "#444", fontSize: "15px", lineHeight: "2", paddingLeft: "20px" }}>
            <li><strong>Destinos:</strong> Realizamos envíos a toda España (Península e Islas).</li>
            <li><strong>Plazos:</strong> Entrega estimada en 24/48 horas laborables.</li>
            <li><strong>Gastos de envío:</strong> Tarifa plana de 4.99€.</li>
            <li><strong>Envío gratuito:</strong> ¡GRATIS en todos los pedidos superiores a 50€!</li>
          </ul>
        </div>

        {/* SECCIÓN DE DEVOLUCIONES */}
        <div style={{ marginBottom: "50px" }}>
          <h2 style={{ fontWeight: "800", fontSize: "18px", marginBottom: "20px", textTransform: "uppercase" }}>
            Devoluciones Fáciles
          </h2>
          <p style={{ color: "#444", fontSize: "15px", lineHeight: "1.8" }}>
            ¿La talla no es la correcta o no estás 100% satisfecho con tu compra? No te preocupes. Tienes un plazo de <strong>30 días naturales</strong> desde que recibes tu ropa para solicitar una devolución.
          </p>
          <p style={{ color: "#444", fontSize: "15px", lineHeight: "1.8", marginTop: "15px" }}>
            Para que la devolución sea aceptada, las prendas deben estar en su estado original, con las etiquetas puestas y sin signos de haber sido usadas en el entrenamiento.
          </p>
        </div>
      </div>
    </div>
  );
}