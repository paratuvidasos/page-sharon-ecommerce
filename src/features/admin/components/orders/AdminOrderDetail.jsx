import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@ui/Icon";
import { useAuth } from "@shared/auth/AuthContext";
import { getAdminOrder } from "@shared/api-client";
import { formatCurrency } from "@shared/i18n/currency";
import { formatDateTime } from "@shared/i18n/date";
import { getStatus } from "@features/orders/data/statuses";
import { ShipmentTrackingSection } from "@features/orders/components/ShipmentTrackingSection";

// Detalle de un pedido desde el panel admin: GET /admin/orders/:orderNumber, distinto
// del OrderDetailModal del cliente (features/orders) — trae changedByAdminLabel en la
// línea de tiempo, que el cliente no necesita ver.
export const AdminOrderDetail = ({ orderNumber, onClose }) => {
  const { t } = useTranslation(["admin", "orders"]);
  const { getAccessToken } = useAuth();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    getAdminOrder(orderNumber, getAccessToken())
      .then((res) => {
        if (cancelled) return;
        setOrder(res);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,24,21,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 520, maxHeight: "88vh", overflowY: "auto", background: "var(--cream)", borderRadius: 24, padding: 32, boxShadow: "var(--shadow-lg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{orderNumber}</div>
          <button type="button" onClick={onClose} className="foc" style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--cream-2)", border: 0, cursor: "pointer", display: "grid", placeItems: "center" }}>
            <Icon name="close" size={13} />
          </button>
        </div>

        {status === "loading" && <div style={{ padding: "30px 0", color: "var(--ink-soft)", fontSize: 13.5 }}>{t("orders.detail.loading")}</div>}
        {status === "error" && <div style={{ padding: "30px 0", color: "var(--terracotta-deep)", fontSize: 13.5 }}>{t("orders.detail.loadError")}</div>}

        {status === "ready" && order && (
          <>
            <span style={{ display: "inline-block", marginBottom: 20, fontSize: 10, fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase", color: getStatus(order.status).color, background: getStatus(order.status).bg, padding: "4px 10px", borderRadius: 999 }}>
              {t(`statusLabels.${getStatus(order.status).value}`, { ns: "orders" })}
            </span>

            <div className="eyebrow" style={{ fontSize: 10, marginBottom: 10 }}>{t("orders.detail.products")}</div>
            {order.items.map((item, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: "8px 0", borderBottom: "1px dashed rgba(27,24,21,.16)", fontSize: 13.5 }}>
                <span>{item.productName} <span style={{ color: "var(--ink-soft)" }}>× {item.quantity}</span></span>
                <span>{formatCurrency(item.lineTotal ?? item.unitPrice * item.quantity)}</span>
              </div>
            ))}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 16px", margin: "16px 0 20px", background: "var(--cream-2)", borderRadius: 14 }}>
              <span className="display" style={{ fontSize: 18 }}>{t("orders.detail.total")}</span>
              <span className="display" style={{ fontSize: 24 }}>{formatCurrency(order.total)}</span>
            </div>

            <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>{t("orders.detail.shippingAddress")}</div>
            <p style={{ fontSize: 13.5, lineHeight: 1.6, marginBottom: 20 }}>
              <strong>{order.shippingAddress?.recipientName}</strong><br />
              {order.shippingAddress?.streetLine1}{order.shippingAddress?.streetLine2 ? `, ${order.shippingAddress.streetLine2}` : ""}<br />
              {order.shippingAddress?.city}, {order.shippingAddress?.stateProvince} · {order.shippingAddress?.countryCode}
            </p>

            <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>{t("orders.detail.paymentAndShipping")}</div>
            <p style={{ fontSize: 13.5, marginBottom: 20 }}>
              {order.paymentMethodLabel || order.paymentMethod}
              {order.shipment?.trackingNumber && <> · {t("orders.detail.shipmentTracking", { trackingNumber: order.shipment.trackingNumber, carrierName: order.shipment.carrierName })}</>}
            </p>

            <ShipmentTrackingSection order={order} />

            {order.statusHistory?.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div className="eyebrow" style={{ fontSize: 10, marginBottom: 10 }}>{t("orders.detail.statusHistory")}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {order.statusHistory.map((entry, i) => {
                    const entryStatus = getStatus(entry.status);
                    return (
                      <div key={i} style={{ display: "flex", gap: 12, paddingBottom: i === order.statusHistory.length - 1 ? 0 : 12 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 999, background: entryStatus.dot, flexShrink: 0, marginTop: 5 }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>{t(`statusLabels.${entryStatus.value}`, { ns: "orders" })}</div>
                          <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                            {formatDateTime(entry.changedAt)}
                            {entry.changedByAdminLabel && <> · {entry.changedByAdminLabel}</>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
