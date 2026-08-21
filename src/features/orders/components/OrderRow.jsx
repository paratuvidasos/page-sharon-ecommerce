import { formatCurrency } from "@shared/i18n/currency";
import { getStatus } from "../data/statuses";

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

// Una fila del historial: fecha, número de orden, estado y total (los cuatro datos
// que pide el AC), con un link a "Ver detalle" que el padre resuelve con onViewDetail.
export const OrderRow = ({ order, onViewDetail }) => {
  const status = getStatus(order.status);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "14px 0",
        borderBottom: "1px solid var(--line)",
        flexWrap: "wrap",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontWeight: 600, fontSize: 13.5 }}>{order.orderNumber}</span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".05em",
              textTransform: "uppercase",
              color: status.color,
              background: status.bg,
              padding: "3px 8px",
              borderRadius: 999,
            }}
          >
            {status.label}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>{formatDate(order.placedAt)}</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <span style={{ fontWeight: 500, fontSize: 14 }}>{formatCurrency(order.total)}</span>
        <button
          type="button"
          onClick={() => onViewDetail(order)}
          style={{
            background: "none",
            border: 0,
            padding: 0,
            fontSize: 12.5,
            color: "var(--ink)",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Ver detalle
        </button>
      </div>
    </div>
  );
};
