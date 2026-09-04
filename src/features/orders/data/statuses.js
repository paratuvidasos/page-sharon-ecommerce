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
// `dot` es aparte de `color` por el mismo motivo que en `TRACKING_STATUSES` más abajo:
// DELIVERED usa blanco como color de texto sobre su fondo verde oscuro, que sería un
// punto invisible en un timeline sobre fondo crema.
export const ORDER_STATUSES = [
  { value: "PENDING", color: "#9C7A3C", bg: "rgba(201,168,118,.18)", dot: "#9C7A3C" },
  { value: "PAID", color: "#3A4A34", bg: "var(--botanic-muted)", dot: "#3A4A34" },
  { value: "PAYMENT_FAILED", color: "var(--terracotta-deep)", bg: "rgba(193,99,63,.14)", dot: "var(--terracotta-deep)" },
  { value: "IN_PREPARATION", color: "var(--ink-soft)", bg: "var(--cream-2)", dot: "var(--ink-soft)" },
  { value: "SHIPPED", color: "var(--botanic-deep)", bg: "var(--botanic-light)", dot: "var(--botanic-deep)" },
  { value: "DELIVERED", color: "#fff", bg: "var(--botanic-deep)", dot: "var(--botanic-deep)" },
  { value: "CANCELLED", color: "#9C4A4A", bg: "rgba(156,74,74,.1)", dot: "#9C4A4A" },
  { value: "REFUNDED", color: "#9C4A4A", bg: "rgba(156,74,74,.1)", dot: "#9C4A4A" },
];

export function getStatus(value) {
  return (
    ORDER_STATUSES.find((s) => s.value === value) || {
      value,
      color: "var(--ink-soft)",
      bg: "var(--cream-2)",
      dot: "var(--ink-soft)",
    }
  );
}

// Estados del tracking en vivo de la transportadora (`order.realTimeTracking.status`,
// vía Track123/Inter Rapidísimo — ver GET /orders/:orderNumber). Es un enum distinto al
// de `ORDER_STATUSES` (no hay overlap real de valores salvo el nombre "PENDING"/
// "DELIVERED", con significado propio acá: estado del envío en la transportadora, no
// del pedido), así que vive en su propio mapa. Mismo patrón: sin `label` acá, se
// traduce vía `t(\`trackingStatusLabels.${value}\`)`.
// `dot` es aparte de `color`: `color` es el texto sobre el fondo `bg` del badge (por
// eso DELIVERED usa blanco, para leerse sobre su fondo verde oscuro), pero ese mismo
// blanco sería invisible como punto sólido del timeline sobre el fondo crema — `dot`
// da un color de punto que siempre se ve, cayendo a `color` cuando ambos coinciden.
export const TRACKING_STATUSES = [
  { value: "PENDING", color: "#9C7A3C", bg: "rgba(201,168,118,.18)", dot: "#9C7A3C" },
  { value: "IN_TRANSIT", color: "var(--botanic-deep)", bg: "var(--botanic-light)", dot: "var(--botanic-deep)" },
  { value: "OUT_FOR_DELIVERY", color: "var(--botanic-deep)", bg: "var(--botanic-light)", dot: "var(--botanic-deep)" },
  { value: "DELIVERED", color: "#fff", bg: "var(--botanic-deep)", dot: "var(--botanic-deep)" },
  { value: "EXCEPTION", color: "var(--terracotta-deep)", bg: "rgba(193,99,63,.14)", dot: "var(--terracotta-deep)" },
  { value: "UNKNOWN", color: "var(--ink-soft)", bg: "var(--cream-2)", dot: "var(--ink-soft)" },
];

export function getTrackingStatus(value) {
  return (
    TRACKING_STATUSES.find((s) => s.value === value) || {
      value,
      color: "var(--ink-soft)",
      bg: "var(--cream-2)",
      dot: "var(--ink-soft)",
    }
  );
}
