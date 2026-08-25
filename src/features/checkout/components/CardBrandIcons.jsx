// Insignias simplificadas de marcas de tarjeta (no los logos oficiales completos)
// para el paso de pago, en el mismo espíritu minimal que shared/ui/Icon.jsx. Solo
// aparecen junto a las opciones de tarjeta — Bold es quien procesa el pago real.
const badgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  height: 20,
  padding: "0 6px",
  borderRadius: 4,
  fontSize: 9,
  fontWeight: 700,
  letterSpacing: ".02em",
  fontFamily: "var(--sans)",
  lineHeight: 1,
};

export const CardBrandIcons = () => (
  <span style={{ display: "inline-flex", gap: 4 }}>
    <span style={{ ...badgeStyle, background: "#1A1F71", color: "#fff" }}>VISA</span>
    <span style={{ ...badgeStyle, background: "#EB001B", color: "#fff" }}>MC</span>
    <span style={{ ...badgeStyle, background: "#016FD0", color: "#fff" }}>AMEX</span>
    <span style={{ ...badgeStyle, background: "var(--ink)", color: "#fff" }}>DINERS</span>
  </span>
);
