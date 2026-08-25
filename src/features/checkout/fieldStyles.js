export const selectStyle = {
  width: "100%",
  padding: "14px 18px",
  border: ".5px solid var(--line)",
  borderRadius: 999,
  background: "#fff",
  fontSize: 14,
  fontFamily: "var(--sans)",
  outline: 0,
};

export function inputStyle(hasError) {
  return {
    width: "100%",
    padding: "14px 18px",
    border: `.5px solid ${hasError ? "#9C4A4A" : "var(--line)"}`,
    borderRadius: 999,
    background: "#fff",
    fontSize: 14,
    fontFamily: "var(--sans)",
    outline: 0,
    boxSizing: "border-box",
  };
}

export const fieldLabelStyle = { fontSize: 10, display: "block", marginBottom: 6 };
export const fieldErrorStyle = { fontSize: 11, color: "#9C4A4A" };
export const fieldHintStyle = { fontSize: 11, color: "var(--ink-soft)" };

// Contenedor tipo "card" para listas de opciones seleccionables (envío, pago,
// dirección) — filas separadas por un divisor interno en vez de cada una con su
// propio borde/radio, para que la lista se lea como una sola superficie.
export const optionCardStyle = {
  border: ".5px solid var(--line)",
  borderRadius: 16,
  overflow: "hidden",
  background: "#fff",
};

export function optionRowStyle(selected, isLast) {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "14px 18px",
    borderBottom: isLast ? "none" : "1px solid var(--line)",
    background: selected ? "var(--botanic-muted)" : "transparent",
    cursor: "pointer",
  };
}
