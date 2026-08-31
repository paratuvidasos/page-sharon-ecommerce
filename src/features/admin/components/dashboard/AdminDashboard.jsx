import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@ui/Icon";
import { formatCurrency } from "@shared/i18n/currency";
import { useAuth } from "@shared/auth/AuthContext";
import { getSalesReport, downloadSalesReportCsv } from "@shared/api-client";

const toISODate = (d) => d.toISOString().slice(0, 10);
const DEFAULT_TO = toISODate(new Date());
const DEFAULT_FROM = toISODate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

const inputStyle = { padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 10, background: "#fff", fontSize: 12.5, fontFamily: "var(--sans)" };

// GET /admin/reports/sales reemplaza lo que antes era 100% mock (MOCK_DASHBOARD_STATS/
// MOCK_REVENUE_SERIES/MOCK_ORDER_STATUS_BREAKDOWN/MOCK_ORDERS). El gráfico de ingresos
// por mes y el desglose por estado no tienen endpoint real que los respalde — se
// eliminan en vez de dejarlos como mock; la tabla inferior pasa de pedidos recientes
// a productos más vendidos del período, que sí es un campo real de la respuesta.
export const AdminDashboard = () => {
  const { t } = useTranslation("admin");
  const { getAccessToken } = useAuth();
  const [range, setRange] = useState({ dateFrom: DEFAULT_FROM, dateTo: DEFAULT_TO });
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    getSalesReport(range, getAccessToken())
      .then((res) => {
        if (!cancelled) {
          setReport(res);
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
  }, [range.dateFrom, range.dateTo]);

  const exportCsv = async () => {
    setExporting(true);
    setExportError(null);
    try {
      await downloadSalesReportCsv(range, getAccessToken(), `ventas-${range.dateFrom}-a-${range.dateTo}.csv`);
    } catch {
      setExportError(t("dashboard.exportError"));
    } finally {
      setExporting(false);
    }
  };

  const stats = report ? [
    { label: t("dashboard.stats.totalSales"), value: formatCurrency(report.summary.totalSales), icon: "arrow", iconBg: "var(--botanic-muted)", iconColor: "var(--botanic-deep)" },
    { label: t("dashboard.stats.averageTicket"), value: formatCurrency(report.summary.averageTicket), icon: "gear", iconBg: "var(--botanic-muted)", iconColor: "var(--botanic-deep)" },
    { label: t("dashboard.stats.orderCount"), value: report.summary.orderCount, icon: "cart", iconBg: "#F1E4CB", iconColor: "var(--gold)" },
  ] : [];

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input type="date" value={range.dateFrom} max={range.dateTo} onChange={(e) => setRange((r) => ({ ...r, dateFrom: e.target.value }))} style={inputStyle} />
        <span style={{ color: "var(--ink-soft)", fontSize: 12.5 }}>{t("dashboard.dateRangeSeparator")}</span>
        <input type="date" value={range.dateTo} min={range.dateFrom} onChange={(e) => setRange((r) => ({ ...r, dateTo: e.target.value }))} style={inputStyle} />
        <button onClick={exportCsv} disabled={exporting || status !== "ready"} className="foc" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, border: "1px solid var(--line)", borderRadius: 999, padding: "10px 18px", background: "#fff", fontSize: 12.5, fontWeight: 700, cursor: exporting ? "wait" : "pointer" }}>
          <Icon name="download" size={14} />
          {exporting ? t("dashboard.exporting") : t("dashboard.exportCsv")}
        </button>
      </div>

      {exportError && <div style={{ fontSize: 12.5, color: "var(--terracotta-deep)", marginBottom: 14 }}>{exportError}</div>}

      {status === "loading" && <div style={{ padding: "24px 0", color: "var(--ink-soft)", fontSize: 13.5 }}>{t("dashboard.loading")}</div>}
      {status === "error" && <div style={{ padding: "24px 0", color: "var(--terracotta-deep)", fontSize: 13.5 }}>{t("dashboard.loadError")}</div>}

      {status === "ready" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18, marginBottom: 26 }}>
            {stats.map((s) => (
              <div key={s.label} style={{ background: "#fff", borderRadius: 20, padding: "22px 24px", border: ".5px solid var(--line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 12.5, color: "var(--ink-soft)", fontWeight: 600 }}>{s.label}</span>
                  <span style={{ width: 32, height: 32, borderRadius: 9, background: s.iconBg, display: "grid", placeItems: "center" }}>
                    <Icon name={s.icon} size={15} color={s.iconColor} />
                  </span>
                </div>
                <div className="display" style={{ fontSize: 32, marginTop: 14 }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", overflow: "hidden" }}>
            <div style={{ padding: "22px 26px" }}>
              <div className="display" style={{ fontSize: 19 }}>{t("dashboard.topProducts.title")}</div>
            </div>
            <div className="admin-table-head" style={{ display: "grid", gridTemplateColumns: "1.6fr 120px 140px", padding: "10px 26px", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-soft)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}>
              <span>{t("dashboard.topProducts.columns.product")}</span><span>{t("dashboard.topProducts.columns.units")}</span><span style={{ textAlign: "right" }}>{t("dashboard.topProducts.columns.revenue")}</span>
            </div>
            {report.topProducts.length === 0 ? (
              <div style={{ padding: "24px 26px", fontSize: 13, color: "var(--ink-soft)" }}>{t("dashboard.topProducts.empty")}</div>
            ) : (
              report.topProducts.map((p) => (
                <div key={p.productId} className="admin-row admin-list-row" style={{ display: "grid", gridTemplateColumns: "1.6fr 120px 140px", padding: "14px 26px", alignItems: "center", fontSize: 13.5, borderBottom: "1px solid var(--line)" }}>
                  <span style={{ fontWeight: 600 }}>{p.productName}</span>
                  <span className="mono"><span className="cell-label">{t("dashboard.topProducts.columns.units")}</span>{p.unitsSold}</span>
                  <span style={{ textAlign: "right" }} className="display"><span className="cell-label">{t("dashboard.topProducts.columns.revenue")}</span>{formatCurrency(p.revenue)}</span>
                </div>
              ))
            )}
          </div>
        </>
      )}

      <style>{`
        .admin-row:hover{background:#FAF7F0}
        .cell-label{display:none}
        @media (max-width: 720px){
          .admin-table-head{display:none}
          .admin-list-row{grid-template-columns:1fr !important; gap:6px; align-items:flex-start !important}
          .admin-list-row .cell-label{display:block; font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-soft); margin-bottom:2px}
          .admin-list-row > *{text-align:left !important}
        }
      `}</style>
    </div>
  );
};
