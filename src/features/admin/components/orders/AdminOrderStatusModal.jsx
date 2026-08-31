import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@shared/auth/AuthContext";
import { setOrderStatus } from "@shared/api-client";
import { ORDER_STATUSES } from "@features/orders/data/statuses";
import { AdminFormSheet } from "../AdminFormSheet";

// El backend ahora acepta IN_PREPARATION|SHIPPED|DELIVERED|CANCELLED|REFUNDED en
// PATCH /admin/orders/:orderNumber/status — SHIPPED exige datos de guía, CANCELLED/
// REFUNDED exigen un motivo. Un <select> suelto ya no alcanza para juntar esos campos,
// de ahí el modal aparte (antes vivía inline en la fila, ver AdminOrders.jsx).
const NEXT_STATUSES = ORDER_STATUSES.filter((s) => ["IN_PREPARATION", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"].includes(s.value));

const fieldStyle = {
  width: "100%", boxSizing: "border-box", padding: "12px 14px",
  border: "1px solid var(--line)", borderRadius: 12, background: "#fff",
  fontSize: 14, fontFamily: "var(--sans)",
};
const labelStyle = { fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 700, display: "block", marginBottom: 6 };

export const AdminOrderStatusModal = ({ order, onClose, onUpdated }) => {
  const { t } = useTranslation("admin");
  const { getAccessToken } = useAuth();
  const currentIsTransitionable = NEXT_STATUSES.some((s) => s.value === order.status);
  const [nextStatus, setNextStatus] = useState(currentIsTransitionable ? order.status : NEXT_STATUSES[0].value);
  const [carrierCode, setCarrierCode] = useState("");
  const [carrierName, setCarrierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const needsCarrier = nextStatus === "SHIPPED";
  const needsReason = nextStatus === "CANCELLED" || nextStatus === "REFUNDED";

  const submit = async (e) => {
    e.preventDefault();
    if (needsCarrier && (!carrierCode.trim() || !carrierName.trim() || !trackingNumber.trim())) {
      setError(t("orders.statusModal.errors.carrierRequired"));
      return;
    }
    if (needsReason && !reason.trim()) {
      setError(t("orders.statusModal.errors.reasonRequired"));
      return;
    }
    setSubmitting(true);
    setError(null);
    const payload = { status: nextStatus };
    if (needsCarrier) {
      payload.carrierCode = carrierCode.trim();
      payload.carrierName = carrierName.trim();
      payload.trackingNumber = trackingNumber.trim();
    }
    if (needsReason) payload.reason = reason.trim();
    try {
      const updated = await setOrderStatus(order.orderNumber, payload, getAccessToken());
      onUpdated(updated);
      onClose();
    } catch (err) {
      setError(err?.message || t("orders.statusModal.errors.updateFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminFormSheet onClose={onClose} eyebrow={t("orders.statusModal.eyebrow")} title={t("orders.statusModal.title")} maxWidth={440}>
      <form onSubmit={submit}>
        <div className="mono" style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 20 }}>{order.orderNumber}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>{t("orders.statusModal.newStatus")}</label>
            <select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)} style={fieldStyle}>
              {NEXT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {needsCarrier && (
            <>
              <div>
                <label style={labelStyle}>{t("orders.statusModal.carrierCode")}</label>
                <input value={carrierCode} onChange={(e) => setCarrierCode(e.target.value)} placeholder={t("orders.statusModal.carrierCodePlaceholder")} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t("orders.statusModal.carrierName")}</label>
                <input value={carrierName} onChange={(e) => setCarrierName(e.target.value)} placeholder={t("orders.statusModal.carrierNamePlaceholder")} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t("orders.statusModal.trackingNumber")}</label>
                <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} style={fieldStyle} />
              </div>
            </>
          )}

          {needsReason && (
            <div>
              <label style={labelStyle}>{t("orders.statusModal.reason")}</label>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} style={{ ...fieldStyle, resize: "vertical", fontFamily: "var(--sans)" }} />
            </div>
          )}
        </div>

        {error && <div style={{ fontSize: 12.5, color: "var(--terracotta-deep)", marginTop: 14 }}>{error}</div>}

        <div className="admin-sheet-actions" style={{ display: "flex", gap: 10, marginTop: 22 }}>
          <button type="submit" disabled={submitting} className="foc" style={{ flex: 1, border: 0, borderRadius: 999, padding: 14, background: "var(--ink)", color: "var(--cream)", fontSize: 13.5, fontWeight: 700, cursor: submitting ? "wait" : "pointer" }}>
            {submitting ? t("orders.statusModal.saving") : t("orders.statusModal.save")}
          </button>
          <button type="button" onClick={onClose} className="foc" style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "14px 20px", background: "transparent", color: "var(--ink)", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>{t("orders.statusModal.cancel")}</button>
        </div>
      </form>
    </AdminFormSheet>
  );
};
