import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { formatCurrency } from "@shared/i18n/currency";
import { useAuth } from "@shared/auth/AuthContext";
import { listCustomers, suspendCustomer, reactivateCustomer } from "@shared/api-client";
import { Pagination } from "../Pagination";
import { CustomerOrdersModal } from "./CustomerOrdersModal";

const STATUS_STYLE_META = {
  ACTIVE: { bg: "var(--botanic-muted)", color: "#3A4A34" },
  INACTIVE: { bg: "var(--cream-2)", color: "var(--ink-soft)" },
  SUSPENDED: { bg: "rgba(193,99,63,.14)", color: "var(--terracotta-deep)" },
  DELETED: { bg: "var(--cream-2)", color: "var(--ink-soft)" },
};

const filterStyle = { padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 10, background: "#fff", fontSize: 12.5, fontFamily: "var(--sans)" };

export const AdminCustomers = () => {
  const { t } = useTranslation("admin");
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
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("customers.searchPlaceholder")} style={{ ...filterStyle, flex: "1 1 240px" }} />
        <select value={statusFilter} onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }} style={filterStyle}>
          <option value="">{t("customers.allStatuses")}</option>
          <option value="ACTIVE">{t("customers.status.ACTIVE")}</option>
          <option value="INACTIVE">{t("customers.status.INACTIVE")}</option>
          <option value="SUSPENDED">{t("customers.status.SUSPENDED")}</option>
        </select>
        <button type="submit" className="foc" style={{ border: 0, borderRadius: 999, padding: "9px 18px", background: "var(--ink)", color: "var(--cream)", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{t("customers.search")}</button>
      </form>

      <div style={{ background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", overflow: "hidden" }}>
        <div className="admin-table-head" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 100px 130px", padding: "12px 22px", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-soft)", borderBottom: "1px solid var(--line)" }}>
          <span>{t("customers.tableHead.customer")}</span><span>{t("customers.tableHead.contact")}</span><span>{t("customers.tableHead.orders")}</span><span>{t("customers.tableHead.totalSpent")}</span><span>{t("customers.tableHead.status")}</span><span></span>
        </div>

        {status === "loading" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>{t("customers.loading")}</div>}
        {status === "error" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--terracotta-deep)" }}>{t("customers.error")}</div>}
        {status === "ready" && customers.length === 0 && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>{t("customers.empty")}</div>}

        {customers.map((c) => {
          const stMeta = STATUS_STYLE_META[c.status] || STATUS_STYLE_META.ACTIVE;
          const stLabel = t(`customers.status.${c.status}`) || t("customers.status.ACTIVE");
          const st = { ...stMeta, label: stLabel };
          return (
            <div key={c.id} className="admin-row admin-list-row" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 100px 130px", padding: "14px 22px", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
              <button onClick={() => setOrdersOf(c)} className="foc" style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: 0, padding: 0, cursor: "pointer", textAlign: "left" }}>
                <span className="script" style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--botanic-muted)", color: "var(--botanic-deep)", display: "grid", placeItems: "center", fontSize: 15, flexShrink: 0 }}>
                  {c.firstName?.[0]?.toUpperCase() || "?"}
                </span>
                <span style={{ fontWeight: 600, fontSize: 13.5, textDecoration: "underline" }}>{c.firstName} {c.lastName}</span>
              </button>
              <span style={{ fontSize: 13, color: "var(--ink-soft)" }}><span className="cell-label">{t("customers.tableHead.contact")}</span>{c.email}</span>
              <span className="mono" style={{ fontSize: 12.5 }}><span className="cell-label">{t("customers.tableHead.orders")}</span>{c.orderCount}</span>
              <span className="display" style={{ fontSize: 15 }}><span className="cell-label">{t("customers.tableHead.totalSpent")}</span>{formatCurrency(c.totalSpent)}</span>
              <span style={{ padding: "5px 11px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, background: st.bg, color: st.color, justifySelf: "start" }}>{st.label}</span>
              <button onClick={() => toggleSuspend(c)} disabled={busyId === c.id} className="foc" style={{ background: "none", border: "1px solid var(--line)", borderRadius: 999, padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", justifySelf: "end" }}>
                {c.status === "SUSPENDED" ? t("customers.reactivate") : t("customers.suspend")}
              </button>
            </div>
          );
        })}
        <Pagination meta={meta} page={page} onPageChange={setPage} />
      </div>

      {ordersOf && <CustomerOrdersModal customer={ordersOf} onClose={() => setOrdersOf(null)} />}
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
