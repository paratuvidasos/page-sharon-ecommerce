import { useTranslation } from "react-i18next";
import { formatDateTime } from "@shared/i18n/date";
import { getTrackingStatus } from "../data/statuses";

// Tracking en vivo de la transportadora (Track123/Inter Rapidísimo, `order.realTimeTracking`)
// — mismo campo y shape en GET /orders/:orderNumber (cliente, "Mis pedidos") y en
// GET /admin/orders/:orderNumber (panel admin), así que vive acá en vez de duplicarse
// en OrderDetailModal.jsx y AdminOrderDetail.jsx. `realTimeTracking` llega null cuando
// el pedido no se despachó o Track123 todavía no procesó el registro — estado normal,
// por eso el componente no renderiza nada en ese caso (no es un error a mostrar).
export const ShipmentTrackingSection = ({ order }) => {
  const { t } = useTranslation("orders");
  if (!order.shipment || !order.realTimeTracking) return null;

  const trackingStatus = getTrackingStatus(order.realTimeTracking.status);
  const events = [...(order.realTimeTracking.events || [])].sort(
    (a, b) => new Date(b.occurredAt) - new Date(a.occurredAt)
  );

  return (
    <div style={{ marginTop: 20 }}>
      <span className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 10 }}>{t("detail.realTimeTracking")}</span>
      <span
        style={{
          display: "inline-block",
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: ".05em",
          textTransform: "uppercase",
          color: trackingStatus.color,
          background: trackingStatus.bg,
          padding: "3px 8px",
          borderRadius: 999,
        }}
      >
        {t(`trackingStatusLabels.${trackingStatus.value}`)}
      </span>
      <p style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 8 }}>
        {order.realTimeTracking.lastSyncedAt
          ? t("detail.lastSyncedAt", { date: formatDateTime(order.realTimeTracking.lastSyncedAt) })
          : t("detail.notSyncedYet")}
      </p>
      {events.length > 0 && (
        <div style={{ marginTop: 12 }}>
          {events.map((event, i) => {
            const eventStatus = getTrackingStatus(event.status);
            return (
              <div key={i} style={{ display: "flex", gap: 12, paddingBottom: i === events.length - 1 ? 0 : 14 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ width: 9, height: 9, borderRadius: 999, background: eventStatus.dot, flexShrink: 0, marginTop: 3 }} />
                  {i !== events.length - 1 && <span style={{ width: 1, flex: 1, background: "var(--line)", marginTop: 4 }} />}
                </div>
                <div style={{ paddingBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>
                    {event.description || t(`trackingStatusLabels.${eventStatus.value}`, { defaultValue: event.status })}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                    {formatDateTime(event.occurredAt)}
                    {event.location && ` · ${event.location}`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
