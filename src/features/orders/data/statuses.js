// Estados posibles de un pedido (enum real del backend, ver GET /orders — PAYMENT_FAILED
// confirmado en CheckoutResultPage.jsx), con el color de badge que se usa tanto en el
// filtro como en cada fila/detalle. Colores tomados de la paleta ya existente en
// index.css: dorado para "pendiente" (esperando pago/gestión), botánico para
// "pagado"/"enviado"/"entregado" (progreso positivo), tinta suave para "en
// preparación", terracotta para "pago fallido", rojo de error para "cancelado"/
// "reembolsado". PENDING y PAID antes compartían el mismo dorado (y PAYMENT_FAILED no
// tenía entrada, cayendo al fallback genérico) — por eso en el historial todos los
// pedidos se veían con el mismo tono sin importar su estado real.
//
// La copia legible (label) ya no vive acá: es texto de UI y se traduce vía i18n en el
// namespace "orders" (clave `statusLabels.${value}`, ver src/shared/i18n/locales/*/orders.json).
// Los componentes que necesiten mostrar el estado deben resolver el label ellos mismos
// con `t(\`statusLabels.${status.value}\`)`.
export const ORDER_STATUSES = [
  { value: "PENDING", color: "#9C7A3C", bg: "rgba(201,168,118,.18)" },
  { value: "PAID", color: "#3A4A34", bg: "var(--botanic-muted)" },
  { value: "PAYMENT_FAILED", color: "var(--terracotta-deep)", bg: "rgba(193,99,63,.14)" },
  { value: "IN_PREPARATION", color: "var(--ink-soft)", bg: "var(--cream-2)" },
  { value: "SHIPPED", color: "var(--botanic-deep)", bg: "var(--botanic-light)" },
  { value: "DELIVERED", color: "#fff", bg: "var(--botanic-deep)" },
  { value: "CANCELLED", color: "#9C4A4A", bg: "rgba(156,74,74,.1)" },
  { value: "REFUNDED", color: "#9C4A4A", bg: "rgba(156,74,74,.1)" },
];

export function getStatus(value) {
  return ORDER_STATUSES.find((s) => s.value === value) || { value, color: "var(--ink-soft)", bg: "var(--cream-2)" };
}
