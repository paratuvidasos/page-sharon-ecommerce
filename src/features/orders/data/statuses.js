// Estados posibles de un pedido (enum real del backend, ver GET /orders), con la copia
// y el color de badge que se usan tanto en el filtro como en cada fila/detalle. Colores
// tomados de la paleta ya existente en index.css (nada de colores nuevos): dorado para
// "pendiente"/"pagado", tinta suave para "en preparación", botánico para "enviado"/
// "entregado", rojo de error para "cancelado"/"reembolsado".
export const ORDER_STATUSES = [
  { value: "PENDING", label: "Pendiente", color: "#9C7A3C", bg: "rgba(201,168,118,.18)" },
  { value: "PAID", label: "Pagado", color: "#9C7A3C", bg: "rgba(201,168,118,.18)" },
  { value: "IN_PREPARATION", label: "En preparación", color: "var(--ink-soft)", bg: "var(--cream-2)" },
  { value: "SHIPPED", label: "Enviado", color: "var(--botanic-deep)", bg: "var(--botanic-light)" },
  { value: "DELIVERED", label: "Entregado", color: "#fff", bg: "var(--botanic-deep)" },
  { value: "CANCELLED", label: "Cancelado", color: "#9C4A4A", bg: "rgba(156,74,74,.1)" },
  { value: "REFUNDED", label: "Reembolsado", color: "#9C4A4A", bg: "rgba(156,74,74,.1)" },
];

export function getStatus(value) {
  return ORDER_STATUSES.find((s) => s.value === value) || { value, label: value, color: "var(--ink-soft)", bg: "var(--cream-2)" };
}
