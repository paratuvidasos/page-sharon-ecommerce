import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@shared/auth/AuthContext";
import { listInventory, listAdminCategories, setVariantStock, setVariantLowStockThreshold } from "@shared/api-client";
import { Pagination } from "../Pagination";

function getSortOptions(t) {
  return [
    { value: "NAME_ASC", label: t("inventory.sortOptions.nameAsc") },
    { value: "NAME_DESC", label: t("inventory.sortOptions.nameDesc") },
    { value: "STOCK_ASC", label: t("inventory.sortOptions.stockAsc") },
    { value: "STOCK_DESC", label: t("inventory.sortOptions.stockDesc") },
  ];
}

const filterStyle = { padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 10, background: "#fff", fontSize: 12.5, fontFamily: "var(--sans)" };

const InventoryRow = ({ item, onSaved }) => {
  const { t } = useTranslation("admin");
  const { getAccessToken } = useAuth();
  const [quantity, setQuantity] = useState(String(item.stockQuantity));
  const [threshold, setThreshold] = useState(item.lowStockThreshold != null ? String(item.lowStockThreshold) : "");
  const [saving, setSaving] = useState(false);

  const saveStock = async () => {
    setSaving(true);
    try {
      await setVariantStock(item.productId, item.variantId, Number(quantity), getAccessToken());
      onSaved({ ...item, stockQuantity: Number(quantity) });
    } finally {
      setSaving(false);
    }
  };

  const saveThreshold = async () => {
    setSaving(true);
    try {
      const value = threshold === "" ? null : Number(threshold);
      await setVariantLowStockThreshold(item.productId, item.variantId, value, getAccessToken());
      onSaved({ ...item, lowStockThreshold: value });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-row admin-list-row" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 140px 170px", padding: "14px 22px", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{item.productName}</div>
        <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{item.variantLabel}</div>
      </div>
      <span className="mono" style={{ fontSize: 12 }}><span className="cell-label">SKU</span>{item.sku}</span>
      <div>
        <span className="cell-label">{t("inventory.columns.stock")}</span>
        <div style={{ display: "flex", gap: 6 }}>
          <input value={quantity} onChange={(e) => setQuantity(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveStock()} type="number" min="0" style={{ width: 70, padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12.5 }} />
          <button onClick={saveStock} disabled={saving} className="foc" style={{ border: "1px solid var(--line)", borderRadius: 8, background: "#fff", fontSize: 11, padding: "0 10px", cursor: "pointer" }}>{t("inventory.save")}</button>
        </div>
      </div>
      <div>
        <span className="cell-label">{t("inventory.columns.threshold")}</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <input value={threshold} onChange={(e) => setThreshold(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveThreshold()} type="number" min="0" placeholder={t("inventory.thresholdPlaceholder")} style={{ width: 60, padding: "8px 8px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12.5 }} />
          <button onClick={saveThreshold} disabled={saving} className="foc" style={{ border: "1px solid var(--line)", borderRadius: 8, background: "#fff", fontSize: 11, padding: "0 10px", cursor: "pointer" }}>{t("inventory.save")}</button>
        </div>
      </div>
    </div>
  );
};

// GET /admin/inventory: listado general de variantes con filtros (búsqueda por
// nombre/SKU, categoría, solo-stock-bajo) y orden. Cada fila edita stock (SET
// absoluto) y umbral (null = usar el global) inline.
export const AdminInventory = () => {
  const { t } = useTranslation("admin");
  const SORT_OPTIONS = getSortOptions(t);
  const { getAccessToken } = useAuth();
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("loading");
  const [categories, setCategories] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [sort, setSort] = useState("NAME_ASC");

  useEffect(() => {
    listAdminCategories({ limit: 100 }, getAccessToken())
      .then((res) => setCategories(res.items))
      .catch(() => setCategories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce del buscador (~350ms) — no manda `search` mientras el campo está vacío.
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const load = ({ silent } = {}) => {
    if (!silent) setStatus("loading");
    listInventory({ page, limit: 20, search: search || undefined, categoryId: categoryId || undefined, onlyLowStock, sort }, getAccessToken())
      .then((res) => {
        setItems(res.items);
        setMeta(res.meta);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, [page, search, categoryId, onlyLowStock, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const resetAndSet = (setter) => (value) => {
    setPage(1);
    setter(value);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t("inventory.searchPlaceholder")}
          style={{ ...filterStyle, flex: "1 1 220px" }}
        />
        <select value={categoryId} onChange={(e) => resetAndSet(setCategoryId)(e.target.value)} style={filterStyle}>
          <option value="">{t("inventory.allCategories")}</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => resetAndSet(setSort)(e.target.value)} style={filterStyle}>
          {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
          <input type="checkbox" checked={onlyLowStock} onChange={(e) => resetAndSet(setOnlyLowStock)(e.target.checked)} />
          {t("inventory.onlyLowStock")}
        </label>
      </div>

      <div style={{ background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", overflow: "hidden" }}>
        <div className="admin-table-head" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 140px 170px", padding: "12px 22px", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-soft)", borderBottom: "1px solid var(--line)" }}>
          <span>{t("inventory.columns.product")}</span><span>{t("inventory.columns.sku")}</span><span>{t("inventory.columns.stock")}</span>
          <span>
            {t("inventory.columns.threshold")}
            <span style={{ display: "block", fontSize: 9.5, letterSpacing: "normal", textTransform: "none", fontWeight: 400, marginTop: 2 }}>
              {t("inventory.columns.thresholdHint")}
            </span>
          </span>
        </div>

        {status === "loading" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>{t("inventory.loading")}</div>}
        {status === "error" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--terracotta-deep)" }}>{t("inventory.loadError")}</div>}
        {status === "ready" && items.length === 0 && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>{t("inventory.empty")}</div>}

        {items.map((item) => (
          <InventoryRow
            key={item.variantId}
            item={item}
            onSaved={() => load({ silent: true })}
          />
        ))}
        <Pagination meta={meta} page={page} onPageChange={setPage} />
      </div>
      <style>{`
        .admin-row:hover{background:#FAF7F0}
        .cell-label{display:none}
        @media (max-width: 720px){
          .admin-table-head{display:none}
          .admin-list-row{grid-template-columns:1fr !important; gap:8px; align-items:flex-start !important}
          .admin-list-row .cell-label{display:block; font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-soft); margin-bottom:2px}
        }
      `}</style>
    </div>
  );
};
