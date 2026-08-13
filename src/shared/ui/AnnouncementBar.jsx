export const AnnouncementBar = ({ show }) => {
  if (!show) return null;
  return (
    <div style={{
      background: "var(--ink)", color: "var(--cream)",
      fontSize: 12, letterSpacing: ".08em", padding: "10px 16px",
      textAlign: "center", fontWeight: 400
    }}>
      <span style={{ color: "var(--gold-soft)" }}>✦</span>{" "}
      Envío gratis en pedidos · Devoluciones en 30 días ·{" "}
      <a href="#" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>Únete al club Sharon</a>
    </div>
  );
};
