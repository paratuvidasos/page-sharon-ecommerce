import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@shared/i18n/currency";
import { formatDate } from "@shared/i18n/date";
import { useAuth } from "@shared/auth/AuthContext";
import { listAdminOrders } from "@shared/api-client";
import { ORDER_STATUSES, getStatus } from "@features/orders/data/statuses";
import { Pagination } from "../Pagination";
import { AdminOrderStatusModal } from "./AdminOrderStatusModal";
import { AdminOrderDetail } from "./AdminOrderDetail";

const filterStyle = { padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 10, background: "#fff", fontSize: 12.5, fontFamily: "var(--sans)" };

// GET /admin/orders real: listado paginado con filtros de estado/fecha. El cambio de
// estado abre AdminOrderStatusModal (pide guía/motivo cuando aplica) y una fila abre
// AdminOrderDetail (GET /admin/orders/:orderNumber).
export const AdminOrders = () => {
  const { t } = useTranslation(["admin", "orders"]);
  const { getAccessToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: "", dateFrom: "", dateTo: "" });
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [statusModalOrder, setStatusModalOrder] = useState(null);
  const [detailOrderNumber, setDetailOrderNumber] = useState(null);

  const load = ({ silent } = {}) => {
    if (!silent) setStatus("loading");
    listAdminOrders({ page, limit: 20, ...filters }, getAccessToken())
      .then((res) => {
        setOrders(res.items);
        setMeta(res.meta);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, [page, filters.status, filters.dateFrom, filters.dateTo]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <select value={filters.status} onChange={(e) => updateFilter("status", e.target.value)} style={filterStyle}>
          <option value="">{t("orders.filters.allStatuses")}</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{t(`statusLabels.${s.value}`, { ns: "orders" })}</option>
          ))}
        </select>
        <input type="date" value={filters.dateFrom} onChange={(e) => updateFilter("dateFrom", e.target.value)} style={filterStyle} />
        <input type="date" value={filters.dateTo} onChange={(e) => updateFilter("dateTo", e.target.value)} style={filterStyle} />
      </div>

      <div style={{ background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", overflow: "hidden" }}>
        <div className="admin-table-head" style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr 130px 160px", padding: "12px 22px", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-soft)", borderBottom: "1px solid var(--line)" }}>
          <span>{t("orders.columns.order")}</span><span>{t("orders.columns.date")}</span><span>{t("orders.columns.total")}</span><span>{t("orders.columns.status")}</span><span></span>
        </div>

        {status === "loading" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>{t("orders.loading")}</div>}
        {status === "error" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--terracotta-deep)" }}>{t("orders.loadError")}</div>}
        {status === "ready" && orders.length === 0 && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>{t("orders.empty")}</div>}

        {orders.map((o) => {
          const st = getStatus(o.status);
          return (
            <div key={o.orderNumber} className="admin-row admin-list-row" style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr 130px 160px", padding: "14px 22px", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
              <div>
                <button onClick={() => setDetailOrderNumber(o.orderNumber)} className="mono foc" style={{ fontSize: 11.5, background: "none", border: 0, padding: 0, textAlign: "left", color: "var(--ink)", textDecoration: "underline", cursor: "pointer" }}>
                  {o.orderNumber}
                </button>
                {o.shipment?.trackingNumber && (
                  <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 3 }}>
                    {t("row.guide", { trackingNumber: o.shipment.trackingNumber, ns: "orders" })}
                    {o.shipment.carrierName && <> ({o.shipment.carrierName})</>}
                  </div>
                )}
              </div>
              <span style={{ color: "var(--ink-soft)", fontSize: 13 }}><span className="cell-label">{t("orders.columns.date")}</span>{formatDate(o.placedAt)}</span>
              <span className="display" style={{ fontSize: 15 }}><span className="cell-label">{t("orders.columns.total")}</span>{formatCurrency(o.total)}</span>
              <span style={{ padding: "5px 11px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, background: st.bg, color: st.color, justifySelf: "start" }}>{t(`statusLabels.${st.value}`, { ns: "orders" })}</span>
              <button onClick={() => setStatusModalOrder(o)} className="foc" style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "8px 14px", background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", justifySelf: "end" }}>
                {t("orders.changeStatus")}
              </button>
            </div>
          );
        })}

        <Pagination meta={meta} page={page} onPageChange={setPage} />
      </div>

      {statusModalOrder && (
        <AdminOrderStatusModal
          order={statusModalOrder}
          onClose={() => setStatusModalOrder(null)}
          onUpdated={() => load({ silent: true })}
        />
      )}
      {detailOrderNumber && (
        <AdminOrderDetail orderNumber={detailOrderNumber} onClose={() => setDetailOrderNumber(null)} />
      )}

      <style>{`
        .admin-row:hover{background:#FAF7F0}
        .cell-label{display:none}
        @media (max-width: 720px){
          .admin-table-head{display:none}
          .admin-list-row{grid-template-columns:1fr !important; gap:6px; align-items:flex-start !important}
          .admin-list-row .cell-label{display:block; font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-soft); margin-bottom:2px}
          .admin-list-row > *{justify-self:start !important}
        }
      `}</style>
    </div>
  );
};
