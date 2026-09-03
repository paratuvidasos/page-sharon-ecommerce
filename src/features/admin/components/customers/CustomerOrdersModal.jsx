import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@ui/Icon";
import { useAuth } from "@shared/auth/AuthContext";
import { listAdminOrders } from "@shared/api-client";
import { formatCurrency } from "@shared/i18n/currency";
import { formatDate } from "@shared/i18n/date";
import { getStatus } from "@features/orders/data/statuses";

// "Ver pedidos de un cliente" reusa GET /admin/orders con el filtro userId agregado
// (mismo endpoint que AdminOrders.jsx) en vez de un endpoint propio de clientes.
export const CustomerOrdersModal = ({ customer, onClose }) => {
  const { t } = useTranslation("admin");
  const { getAccessToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    listAdminOrders({ userId: customer.id, limit: 50 }, getAccessToken())
      .then((res) => {
        if (!cancelled) {
          setOrders(res.items);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer.id]);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,24,21,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 560, maxHeight: "80vh", overflowY: "auto", background: "var(--cream)", borderRadius: 24, padding: 32, boxShadow: "var(--shadow-lg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div className="display" style={{ fontSize: 22 }}>{t("customers.ordersModal.title", { name: `${customer.firstName} ${customer.lastName}` })}</div>
            <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{customer.email}</div>
          </div>
          <button type="button" onClick={onClose} className="foc" style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--cream-2)", border: 0, cursor: "pointer", display: "grid", placeItems: "center" }}>
            <Icon name="close" size={13} />
          </button>
        </div>

        {status === "loading" && <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{t("customers.ordersModal.loading")}</div>}
        {status === "error" && <div style={{ fontSize: 13, color: "var(--terracotta-deep)" }}>{t("customers.ordersModal.error")}</div>}
        {status === "ready" && orders.length === 0 && <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{t("customers.ordersModal.empty")}</div>}

        {orders.map((o) => {
          const st = getStatus(o.status);
          return (
            <div key={o.orderNumber} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px dashed rgba(27,24,21,.16)" }}>
              <div>
                <span className="mono" style={{ fontSize: 12 }}>{o.orderNumber}</span>
                <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{formatDate(o.placedAt)}</div>
              </div>
              <span style={{ padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 700, background: st.bg, color: st.color }}>{st.label}</span>
              <span className="display" style={{ fontSize: 15 }}>{formatCurrency(o.total)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
