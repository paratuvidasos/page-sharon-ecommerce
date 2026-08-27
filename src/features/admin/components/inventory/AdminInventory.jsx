import { useEffect, useState } from "react";
import { useAuth } from "@shared/auth/AuthContext";
import { listInventory, listAdminCategories, setVariantStock, setVariantLowStockThreshold } from "@shared/api-client";
import { Pagination } from "../Pagination";

const SORT_OPTIONS = [
  { value: "NAME_ASC", label: "Nombre (A-Z)" },
  { value: "NAME_DESC", label: "Nombre (Z-A)" },
  { value: "STOCK_ASC", label: "Menor stock primero" },
  { value: "STOCK_DESC", label: "Mayor stock primero" },
];

const filterStyle = { padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 10, background: "#fff", fontSize: 12.5, fontFamily: "var(--sans)" };

const InventoryRow = ({ item, onSaved }) => {
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
    <div className="admin-row" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 140px 170px", padding: "14px 22px", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
      <div>
        <div style={{ fontWeight: 600, fontSize: 13.5 }}>{item.productName}</div>
        <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{item.variantLabel}</div>
      </div>
      <span className="mono" style={{ fontSize: 12 }}>{item.sku}</span>
      <div style={{ display: "flex", gap: 6 }}>
        <input value={quantity} onChange={(e) => setQuantity(e.target.value)} type="number" min="0" style={{ width: 70, padding: "8px 10px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12.5 }} />
        <button onClick={saveStock} disabled={saving} className="foc" style={{ border: "1px solid var(--line)", borderRadius: 8, background: "#fff", fontSize: 11, padding: "0 10px", cursor: "pointer" }}>OK</button>
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input value={threshold} onChange={(e) => setThreshold(e.target.value)} type="number" min="0" placeholder="Auto" style={{ width: 60, padding: "8px 8px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12.5 }} />
        <button onClick={saveThreshold} disabled={saving} className="foc" style={{ border: "1px solid var(--line)", borderRadius: 8, background: "#fff", fontSize: 11, padding: "0 10px", cursor: "pointer" }}>OK</button>
      </div>
    </div>
  );
};

// GET /admin/inventory: listado general de variantes con filtros (búsqueda por
// nombre/SKU, categoría, solo-stock-bajo) y orden. Cada fila edita stock (SET
// absoluto) y umbral (null = usar el global) inline.
export const AdminInventory = () => {
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

  const load = () => {
    setStatus("loading");
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
          placeholder="Buscar por producto o SKU…"
          style={{ ...filterStyle, flex: "1 1 220px" }}
        />
        <select value={categoryId} onChange={(e) => resetAndSet(setCategoryId)(e.target.value)} style={filterStyle}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => resetAndSet(setSort)(e.target.value)} style={filterStyle}>
          {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, cursor: "pointer" }}>
          <input type="checkbox" checked={onlyLowStock} onChange={(e) => resetAndSet(setOnlyLowStock)(e.target.checked)} />
          Solo stock bajo
        </label>
      </div>

      <div style={{ background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 140px 170px", padding: "12px 22px", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-soft)", borderBottom: "1px solid var(--line)" }}>
          <span>Producto</span><span>SKU</span><span>Stock</span>
          <span>
            Umbral
            <span style={{ display: "block", fontSize: 9.5, letterSpacing: "normal", textTransform: "none", fontWeight: 400, marginTop: 2 }}>
              stock que dispara "stock bajo"
            </span>
          </span>
        </div>

        {status === "loading" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>Cargando inventario…</div>}
        {status === "error" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--terracotta-deep)" }}>No se pudo cargar el inventario.</div>}
        {status === "ready" && items.length === 0 && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>No hay variantes con estos filtros.</div>}

        {items.map((item) => (
          <InventoryRow
            key={item.variantId}
            item={item}
            onSaved={(next) => setItems((its) => its.map((i) => (i.variantId === next.variantId ? next : i)))}
          />
        ))}
        <Pagination meta={meta} page={page} onPageChange={setPage} />
      </div>
      <style>{`.admin-row:hover{background:#FAF7F0}`}</style>
    </div>
  );
};
