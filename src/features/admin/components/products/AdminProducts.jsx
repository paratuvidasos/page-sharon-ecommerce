import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@ui/Icon";
import { formatCurrency } from "@shared/i18n/currency";
import { useAuth } from "@shared/auth/AuthContext";
import { listProducts, setProductFeatured, deleteProduct } from "@shared/api-client";
import { Pagination } from "../Pagination";
import { AdminProductForm } from "./AdminProductForm";

// No hay un GET /admin/products dedicado en la especificación — se reusa el listado
// público GET /products (mismo que ve la tienda) ya expuesto por catalog.js, con
// paginación real. Crear/editar/borrar y las imágenes sí son endpoints admin reales.
export const AdminProducts = () => {
  const { t } = useTranslation("admin");
  const { getAccessToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("loading");
  const [formTarget, setFormTarget] = useState(null); // null=cerrado, {}=nuevo, product=editar
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [archivedNotice, setArchivedNotice] = useState(null);
  const [savingFeaturedId, setSavingFeaturedId] = useState(null);

  const load = () => {
    setStatus("loading");
    listProducts({ page, limit: 20 })
      .then((res) => {
        setProducts(res.items);
        setMeta(res.meta);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFeatured = async (p) => {
    const next = !p.isFeatured;
    setSavingFeaturedId(p.id);
    setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, isFeatured: next } : x)));
    try {
      await setProductFeatured(p.id, next, getAccessToken());
    } catch {
      setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, isFeatured: !next } : x)));
    } finally {
      setSavingFeaturedId(null);
    }
  };

  const confirmDelete = async (id) => {
    try {
      const res = await deleteProduct(id, getAccessToken());
      if (res?.archived) {
        setArchivedNotice(id);
        setConfirmingDeleteId(null);
      } else {
        setProducts((ps) => ps.filter((p) => p.id !== id));
      }
    } catch {
      setConfirmingDeleteId(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button onClick={() => setFormTarget({})} className="foc" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--ink)", color: "var(--cream)", border: 0, borderRadius: 999, padding: "12px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Icon name="plus" size={15} color="var(--cream)" />
          {t("products.new")}
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", overflow: "hidden" }}>
        <div className="admin-table-head" style={{ display: "grid", gridTemplateColumns: "64px 1.6fr 100px 90px 90px", padding: "12px 22px", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-soft)", borderBottom: "1px solid var(--line)", alignItems: "center" }}>
          <span></span><span>{t("products.columns.product")}</span><span>{t("products.columns.price")}</span><span>{t("products.columns.featured")}</span><span></span>
        </div>

        {status === "loading" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>{t("products.loading")}</div>}
        {status === "error" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--terracotta-deep)" }}>{t("products.loadError")}</div>}

        {products.map((p) => (
          <div key={p.id}>
            <div className="admin-row admin-product-row" style={{ display: "grid", gridTemplateColumns: "64px 1.6fr 100px 90px 90px", padding: "14px 22px", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
              <div className="cell-thumb" style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", background: "var(--botanic-muted)" }}>
                {p.thumbnailUrl && <img src={p.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
              <span className="cell-name" style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</span>
              <span className="cell-price display" style={{ fontSize: 15 }}><span className="cell-label">{t("products.columns.price")}</span>{formatCurrency(p.basePrice)}</span>
              <button
                onClick={() => toggleFeatured(p)}
                disabled={savingFeaturedId === p.id}
                aria-label={t("products.toggleFeaturedAria")}
                className="foc cell-star"
                style={{ background: "transparent", border: 0, cursor: "pointer" }}
              >
                <Icon name="star" size={20} color={p.isFeatured ? "var(--gold)" : "var(--line)"} />
              </button>
              <span className="cell-actions" style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button onClick={() => setFormTarget(p)} aria-label={t("products.editAria")} className="foc" style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}>
                  <Icon name="pencil" size={14} />
                </button>
                <button onClick={() => setConfirmingDeleteId(p.id)} aria-label={t("products.deleteAria")} className="foc" style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(193,99,63,.25)", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}>
                  <Icon name="trash" size={14} color="var(--terracotta-deep)" />
                </button>
              </span>
            </div>
            {confirmingDeleteId === p.id && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 22px", background: "rgba(193,99,63,.06)", borderBottom: "1px solid var(--line)" }}>
                <span style={{ fontSize: 12.5, color: "#7A3535", flex: 1 }}>{t("products.confirmDelete", { name: p.name })}</span>
                <button onClick={() => confirmDelete(p.id)} className="foc" style={{ border: 0, borderRadius: 999, padding: "8px 16px", background: "var(--terracotta-deep)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{t("products.confirmDeleteButton")}</button>
                <button onClick={() => setConfirmingDeleteId(null)} className="foc" style={{ border: 0, borderRadius: 999, padding: "8px 16px", background: "transparent", color: "var(--ink)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t("products.cancelButton")}</button>
              </div>
            )}
            {archivedNotice === p.id && (
              <div style={{ padding: "10px 22px", background: "rgba(201,168,118,.14)", borderBottom: "1px solid var(--line)", fontSize: 12.5, color: "#7A5A20" }}>
                {t("products.archivedNotice")}
              </div>
            )}
          </div>
        ))}

        <Pagination meta={meta} page={page} onPageChange={setPage} />
      </div>

      {formTarget && (
        <AdminProductForm
          product={formTarget.id ? formTarget : null}
          onClose={() => { setFormTarget(null); load(); }}
          onSaved={() => load()}
        />
      )}
      <style>{`
        .admin-row:hover{background:#FAF7F0}
        .cell-label{display:none}
        @media (max-width: 720px){
          .admin-table-head{display:none}
          .admin-product-row{
            grid-template-columns: 44px 1fr auto !important;
            grid-template-areas: "thumb name star" "thumb price actions";
            gap: 6px 12px !important;
          }
          .cell-thumb{grid-area: thumb}
          .cell-name{grid-area: name}
          .cell-price{grid-area: price}
          .cell-star{grid-area: star; justify-self: end}
          .cell-actions{grid-area: actions; justify-self: end}
          .admin-product-row .cell-label{display:block; font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-soft); margin-bottom:2px}
        }
      `}</style>
    </div>
  );
};
