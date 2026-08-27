import { useEffect, useState } from "react";
import { formatCurrency } from "@shared/i18n/currency";
import { useAuth } from "@shared/auth/AuthContext";
import { listAdminOrders } from "@shared/api-client";
import { ORDER_STATUSES, getStatus } from "@features/orders/data/statuses";
import { Pagination } from "../Pagination";
import { AdminOrderStatusModal } from "./AdminOrderStatusModal";
import { AdminOrderDetail } from "./AdminOrderDetail";

const formatDate = (iso) => new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

const filterStyle = { padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 10, background: "#fff", fontSize: 12.5, fontFamily: "var(--sans)" };

// GET /admin/orders real: listado paginado con filtros de estado/fecha. El cambio de
// estado abre AdminOrderStatusModal (pide guía/motivo cuando aplica) y una fila abre
// AdminOrderDetail (GET /admin/orders/:orderNumber).
export const AdminOrders = () => {
  const { getAccessToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ status: "", dateFrom: "", dateTo: "" });
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [statusModalOrder, setStatusModalOrder] = useState(null);
  const [detailOrderNumber, setDetailOrderNumber] = useState(null);

  const load = () => {
    setStatus("loading");
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
          <option value="">Todos los estados</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <input type="date" value={filters.dateFrom} onChange={(e) => updateFilter("dateFrom", e.target.value)} style={filterStyle} />
        <input type="date" value={filters.dateTo} onChange={(e) => updateFilter("dateTo", e.target.value)} style={filterStyle} />
      </div>

      <div style={{ background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr 130px 160px", padding: "12px 22px", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-soft)", borderBottom: "1px solid var(--line)" }}>
          <span>Pedido</span><span>Fecha</span><span>Total</span><span>Estado</span><span></span>
        </div>

        {status === "loading" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>Cargando pedidos…</div>}
        {status === "error" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--terracotta-deep)" }}>No se pudieron cargar los pedidos.</div>}
        {status === "ready" && orders.length === 0 && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>No hay pedidos con estos filtros.</div>}

        {orders.map((o) => {
          const st = getStatus(o.status);
          return (
            <div key={o.orderNumber} className="admin-row" style={{ display: "grid", gridTemplateColumns: "160px 1fr 1fr 130px 160px", padding: "14px 22px", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
              <button onClick={() => setDetailOrderNumber(o.orderNumber)} className="mono foc" style={{ fontSize: 11.5, background: "none", border: 0, padding: 0, textAlign: "left", color: "var(--ink)", textDecoration: "underline", cursor: "pointer" }}>
                {o.orderNumber}
              </button>
              <span style={{ color: "var(--ink-soft)", fontSize: 13 }}>{formatDate(o.placedAt)}</span>
              <span className="display" style={{ fontSize: 15 }}>{formatCurrency(o.total)}</span>
              <span style={{ padding: "5px 11px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, background: st.bg, color: st.color, justifySelf: "start" }}>{st.label}</span>
              <button onClick={() => setStatusModalOrder(o)} className="foc" style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "8px 14px", background: "transparent", fontSize: 12, fontWeight: 600, cursor: "pointer", justifySelf: "end" }}>
                Cambiar estado
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
          onUpdated={(updated) => setOrders((os) => os.map((o) => (o.orderNumber === updated.orderNumber ? { ...o, ...updated } : o)))}
        />
      )}
      {detailOrderNumber && (
        <AdminOrderDetail orderNumber={detailOrderNumber} onClose={() => setDetailOrderNumber(null)} />
      )}

      <style>{`.admin-row:hover{background:#FAF7F0}`}</style>
    </div>
  );
};
