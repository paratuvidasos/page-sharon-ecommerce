import { useEffect, useState } from "react";
import { formatCurrency } from "@shared/i18n/currency";
import { useAuth } from "@shared/auth/AuthContext";
import { listCustomers, suspendCustomer, reactivateCustomer } from "@shared/api-client";
import { Pagination } from "../Pagination";
import { CustomerOrdersModal } from "./CustomerOrdersModal";

const STATUS_STYLE = {
  ACTIVE: { bg: "var(--botanic-muted)", color: "#3A4A34", label: "Activo" },
  INACTIVE: { bg: "var(--cream-2)", color: "var(--ink-soft)", label: "Inactivo" },
  SUSPENDED: { bg: "rgba(193,99,63,.14)", color: "var(--terracotta-deep)", label: "Suspendido" },
  DELETED: { bg: "var(--cream-2)", color: "var(--ink-soft)", label: "Eliminado" },
};

const filterStyle = { padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 10, background: "#fff", fontSize: 12.5, fontFamily: "var(--sans)" };

export const AdminCustomers = () => {
  const { getAccessToken } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [status, setStatus] = useState("loading");
  const [busyId, setBusyId] = useState(null);
  const [ordersOf, setOrdersOf] = useState(null);

  const load = () => {
    setStatus("loading");
    listCustomers({ page, limit: 20, search: search || undefined, status: statusFilter || undefined }, getAccessToken())
      .then((res) => {
        setCustomers(res.items);
        setMeta(res.meta);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, [page, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const toggleSuspend = async (customer) => {
    setBusyId(customer.id);
    const action = customer.status === "SUSPENDED" ? reactivateCustomer : suspendCustomer;
    const nextStatus = customer.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    try {
      await action(customer.id, getAccessToken());
      setCustomers((cs) => cs.map((c) => (c.id === customer.id ? { ...c, status: nextStatus } : c)));
    } catch {
      // Se deja el estado como estaba; el admin puede reintentar.
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <form onSubmit={submitSearch} style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o correo…" style={{ ...filterStyle, flex: "1 1 240px" }} />
        <select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }} style={filterStyle}>
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activo</option>
          <option value="INACTIVE">Inactivo</option>
          <option value="SUSPENDED">Suspendido</option>
        </select>
        <button type="submit" className="foc" style={{ border: 0, borderRadius: 999, padding: "9px 18px", background: "var(--ink)", color: "var(--cream)", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Buscar</button>
      </form>

      <div style={{ background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 100px 130px", padding: "12px 22px", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-soft)", borderBottom: "1px solid var(--line)" }}>
          <span>Cliente</span><span>Contacto</span><span>Pedidos</span><span>Gasto total</span><span>Estado</span><span></span>
        </div>

        {status === "loading" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>Cargando clientes…</div>}
        {status === "error" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--terracotta-deep)" }}>No se pudieron cargar los clientes.</div>}
        {status === "ready" && customers.length === 0 && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>No hay clientes con estos filtros.</div>}

        {customers.map((c) => {
          const st = STATUS_STYLE[c.status] || STATUS_STYLE.ACTIVE;
          return (
            <div key={c.id} className="admin-row" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 100px 130px", padding: "14px 22px", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
              <button onClick={() => setOrdersOf(c)} className="foc" style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: 0, padding: 0, cursor: "pointer", textAlign: "left" }}>
                <span className="script" style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--botanic-muted)", color: "var(--botanic-deep)", display: "grid", placeItems: "center", fontSize: 15, flexShrink: 0 }}>
                  {c.firstName?.[0]?.toUpperCase() || "?"}
                </span>
                <span style={{ fontWeight: 600, fontSize: 13.5, textDecoration: "underline" }}>{c.firstName} {c.lastName}</span>
              </button>
              <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{c.email}</span>
              <span className="mono" style={{ fontSize: 12.5 }}>{c.orderCount}</span>
              <span className="display" style={{ fontSize: 15 }}>{formatCurrency(c.totalSpent)}</span>
              <span style={{ padding: "5px 11px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, background: st.bg, color: st.color, justifySelf: "start" }}>{st.label}</span>
              <button onClick={() => toggleSuspend(c)} disabled={busyId === c.id} className="foc" style={{ background: "none", border: "1px solid var(--line)", borderRadius: 999, padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", justifySelf: "end" }}>
                {c.status === "SUSPENDED" ? "Reactivar" : "Suspender"}
              </button>
            </div>
          );
        })}
        <Pagination meta={meta} page={page} onPageChange={setPage} />
      </div>

      {ordersOf && <CustomerOrdersModal customer={ordersOf} onClose={() => setOrdersOf(null)} />}
      <style>{`.admin-row:hover{background:#FAF7F0}`}</style>
    </div>
  );
};
