import { useMemo, useState } from "react";
import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
import { Modal } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { ORDER_STATUSES } from "../data/statuses";
import { OrderRow } from "./OrderRow";
import { OrderDetailModal } from "./OrderDetailModal";

const filterInputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid var(--line)",
  borderRadius: 10,
  background: "#fff",
  fontSize: 13,
  fontFamily: "var(--sans)",
  outline: 0,
};

const INITIAL_FILTERS = { status: "all", from: "", to: "" };

// Pantalla de historial de pedidos: filtros (rango de fechas + estado) y el listado.
// Hermana top-level en App.jsx (se abre directo desde "Historial de pedidos" en
// AccountMenu, no anidada dentro de ProfileModal). El detalle de cada pedido vive en
// OrderDetailModal, anidado a su vez dentro de este.
export const OrderHistoryModal = ({ open, onClose, orders }) => {
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const hasActiveFilters = filters.status !== "all" || filters.from || filters.to;

  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        if (filters.status !== "all" && order.status !== filters.status) return false;
        const orderDate = order.placedAt.slice(0, 10);
        if (filters.from && orderDate < filters.from) return false;
        if (filters.to && orderDate > filters.to) return false;
        return true;
      })
      .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  }, [orders, filters]);

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        zIndex={Z.orderHistory}
        width="min(720px, 92vw)"
        labelledBy="order-history-title"
        panelStyle={{
          maxHeight: "88vh",
          background: "var(--cream)",
          borderRadius: 24,
          boxShadow: "0 32px 80px rgba(27,24,21,.3)",
          border: ".5px solid var(--line)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "22px 26px",
            borderBottom: "1px solid var(--line)",
            flexShrink: 0,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--botanic-deep)" }} />
              <span className="eyebrow" style={{ fontSize: 10, letterSpacing: ".14em" }}>Tu cuenta</span>
            </div>
            <div id="order-history-title" className="display" style={{ fontSize: 24 }}>
              Historial de pedidos
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 8, maxWidth: 380 }}>
              Consulta el estado, contenido y monto de tus pedidos anteriores.
            </p>
          </div>
          <IconButton icon="close" size={38} iconSize={20} onClick={onClose} aria-label="Cerrar" />
        </div>

        <div style={{ padding: "20px 26px", borderBottom: "1px dashed rgba(27,24,21,.16)", flexShrink: 0 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 14 }} className="order-filters-grid">
            <label style={{ display: "block" }}>
              <span style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 700, display: "block", marginBottom: 6 }}>Desde</span>
              <input
                type="date"
                value={filters.from}
                max={filters.to || undefined}
                onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                style={filterInputStyle}
              />
            </label>
            <label style={{ display: "block" }}>
              <span style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 700, display: "block", marginBottom: 6 }}>Hasta</span>
              <input
                type="date"
                value={filters.to}
                min={filters.from || undefined}
                onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                style={filterInputStyle}
              />
            </label>
            <label style={{ display: "block" }}>
              <span style={{ fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 700, display: "block", marginBottom: 6 }}>Estado</span>
              <select
                value={filters.status}
                onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                style={filterInputStyle}
              >
                <option value="all">Todos</option>
                {ORDER_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </label>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => setFilters(INITIAL_FILTERS)}
              style={{ marginTop: 10, background: "none", border: 0, padding: 0, fontSize: 12.5, color: "var(--ink-soft)", textDecoration: "underline", cursor: "pointer" }}
            >
              Limpiar filtros
            </button>
          )}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "8px 26px 20px" }}>
          {orders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 8px", color: "var(--ink-soft)" }}>
              <Icon name="cart" size={26} />
              <p style={{ fontSize: 13, marginTop: 10 }}>Todavía no tienes pedidos.</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 8px", color: "var(--ink-soft)" }}>
              <p style={{ fontSize: 13 }}>No encontramos pedidos con estos filtros.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderRow key={order.id} order={order} onViewDetail={setSelectedOrder} />
            ))
          )}
        </div>
      </Modal>

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </>
  );
};
