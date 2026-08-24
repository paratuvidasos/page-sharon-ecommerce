// Utilidad centralizada de formato de moneda (ver CLAUDE.md > Internacionalización).
// Hoy solo existe pesos colombianos/es-CO — antes de esto, cada componente formateaba
// el precio a mano y de forma inconsistente (con o sin locale, con o sin símbolo).
// Cuando se sume multi-moneda real, esta es la única función a tocar.
const formatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatCurrency(amount) {
  return formatter.format(amount);
}
