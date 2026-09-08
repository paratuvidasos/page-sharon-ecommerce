import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Reveal } from "@ui/Reveal";
import { Icon } from "@ui/Icon";
import { Modal } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { ProductCard } from "./ProductCard";
import { ProductFilters } from "./ProductFilters";
import { listCategories, listProducts, getProductFilters } from "@shared/api-client";
import { normalizeProduct } from "../utils/normalizeProduct";

// [0013][BE] Listado real: reemplaza el array estático de products.js por
// GET /products. [0016][BE] Filtro por categoría: el sidebar se arma con
// GET /categories real, y "Todo" significa "sin categoryId" (el backend no tiene
// un valor especial para eso). [0017][BE] Filtros de atributo: ver ProductFilters.jsx.
const EMPTY_ATTR_FILTERS = { hairType: null, line: null, ingredient: null, priceMin: null, priceMax: null };

// [0019][BE] Orden del listado.
const chipStyle = (active) => ({
  flexShrink: 0,
  padding: "9px 16px",
  borderRadius: 999,
  border: "1px solid " + (active ? "var(--ink)" : "var(--line)"),
  background: active ? "var(--ink)" : "#fff",
  color: active ? "var(--cream)" : "var(--ink)",
  fontSize: 12.5,
  fontWeight: 600,
  cursor: "pointer",
  whiteSpace: "nowrap",
});

const SORT_OPTIONS = ["NEWEST", "BEST_SELLING", "PRICE_ASC", "PRICE_DESC"];

// Cuerpo de la página de catálogo (sidebar de filtros + grid), estilo tienda
// (referencia: layouts de e-commerce tipo Undergold — sidebar vertical con
// checkboxes y conteos, header minimalista, grid limpio) en vez del carrusel de
// "selección destacada" que tenía cuando esto vivía embebido en la landing.
export const Products = ({ onWish, wishlistIds, onOpenProduct }) => {
  const { t } = useTranslation("catalog");
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [facets, setFacets] = useState(null);
  const [attrFilters, setAttrFilters] = useState(EMPTY_ATTR_FILTERS);
  const [sort, setSort] = useState("NEWEST");
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listCategories({ limit: 100 })
      .then((res) => {
        if (!cancelled) setCategories(Array.isArray(res?.items) ? res.items : []);
      })
      .catch(() => {
        if (!cancelled) setCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Los conteos de /products/filters reflejan solo la categoría, no los otros
  // filtros de atributo entre sí (ver ProductFilters.jsx) — se piden de nuevo
  // solo cuando cambia categoryId, no cuando cambia attrFilters.
  useEffect(() => {
    let cancelled = false;
    getProductFilters({ categoryId: categoryId || undefined })
      .then((res) => {
        if (!cancelled) setFacets(res);
      })
      .catch(() => {
        if (!cancelled) setFacets(null);
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId]);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    listProducts({
      categoryId: categoryId || undefined,
      hairType: attrFilters.hairType || undefined,
      line: attrFilters.line || undefined,
      ingredient: attrFilters.ingredient || undefined,
      priceMin: attrFilters.priceMin ?? undefined,
      priceMax: attrFilters.priceMax ?? undefined,
      sort,
      limit: 100,
    })
      .then((res) => {
        if (cancelled) return;
        setProducts(Array.isArray(res?.items) ? res.items.map(normalizeProduct) : []);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setProducts([]);
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [categoryId, attrFilters, sort]);

  const handleCategoryChange = (id) => {
    setCategoryId(id);
    setAttrFilters(EMPTY_ATTR_FILTERS);
  };

  const activeCategoryName = categoryId ? categories.find((c) => c.id === categoryId)?.name : null;
  const activeFilterCount = ["hairType", "line", "ingredient", "priceMin", "priceMax"].filter((k) => attrFilters[k]).length;

  return (
    <div className="wrap catalog-layout" style={{ display: "flex", gap: 48, alignItems: "flex-start" }}>
      <aside className="catalog-sidebar" style={{ width: 240, flexShrink: 0, position: "sticky", top: 100 }}>
        <ProductFilters
          categories={categories}
          categoryId={categoryId}
          onCategoryChange={handleCategoryChange}
          facets={facets}
          selected={attrFilters}
          onChange={setAttrFilters}
        />
      </aside>

      {/* Fila de chips + botón "Filtrar" — solo visible bajo 860px (ver .catalog-mobile-bar
          más abajo). En escritorio el sidebar de arriba ya cubre lo mismo. */}
      <div className="catalog-mobile-bar" style={{ display: "none", width: "100%", gap: 10, alignItems: "center", overflowX: "auto", paddingBottom: 4 }}>
        <button type="button" onClick={() => handleCategoryChange(null)} style={chipStyle(categoryId === null)}>
          {t("products.all")}
        </button>
        {categories.map((c) => (
          <button key={c.id} type="button" onClick={() => handleCategoryChange(c.id)} style={chipStyle(categoryId === c.id)}>
            {c.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setFilterSheetOpen(true)}
          style={{ ...chipStyle(activeFilterCount > 0), display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: "auto" }}
        >
          <Icon name="sliders" size={14} />
          {t("products.filter")}
          {activeFilterCount > 0 && (
            <span style={{ background: "var(--terracotta)", color: "#fff", borderRadius: 999, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32, paddingBottom: 20, borderBottom: "1px solid var(--line)" }}>
          <span className="mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
            {status === "ready"
              ? activeCategoryName
                ? t("products.resultCountIn", { count: products.length, category: activeCategoryName })
                : t("products.resultCount", { count: products.length })
              : " "}
          </span>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink-soft)" }}>
            {t("products.sortBy")}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 999, background: "#fff", fontSize: 12.5, fontFamily: "var(--sans)", color: "var(--ink)", outline: 0 }}
            >
              {SORT_OPTIONS.map((value) => (
                <option key={value} value={value}>{t(`products.sortOptions.${value}`)}</option>
              ))}
            </select>
          </label>
        </div>

        {status === "error" && (
          <div style={{ textAlign: "center", padding: "80px 8px", color: "var(--ink-soft)" }}>
            <Icon name="cart" size={26} />
            <p style={{ fontSize: 13, marginTop: 10 }}>{t("products.loadError")}</p>
          </div>
        )}

        {status !== "error" && products.length === 0 && status === "ready" && (
          <div style={{ textAlign: "center", padding: "80px 8px", color: "var(--ink-soft)" }}>
            <p style={{ fontSize: 13 }}>{t("products.empty")}</p>
          </div>
        )}

        {status !== "error" && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 22
          }}>
            {(status === "loading" ? [] : products).map((p, i) => (
              <Reveal key={p.id} delay={i * 40}>
                <ProductCard product={p} onWish={onWish} onViewDetail={onOpenProduct} wished={wishlistIds?.has(p.productId)} />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <Modal
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        zIndex={Z.catalogFilters}
        variant="sheet"
        closeOnEscape
        labelledBy="catalog-filter-sheet-title"
        panelStyle={{
          background: "var(--cream)",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          boxShadow: "0 -20px 60px rgba(27,24,21,.25)",
          maxHeight: "85vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", borderBottom: "1px solid var(--line)", flexShrink: 0 }}>
          <span id="catalog-filter-sheet-title" style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase" }}>{t("products.filter")}</span>
          <button type="button" onClick={() => setFilterSheetOpen(false)} aria-label={t("products.close")} style={{ background: "none", border: 0, padding: 4, cursor: "pointer" }}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 22px" }}>
          <ProductFilters
            categories={categories}
            categoryId={categoryId}
            onCategoryChange={handleCategoryChange}
            facets={facets}
            selected={attrFilters}
            onChange={setAttrFilters}
          />
        </div>
        <div style={{ padding: "14px 22px 22px", borderTop: "1px solid var(--line)", flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setFilterSheetOpen(false)}
            style={{ width: "100%", padding: "13px 0", border: 0, borderRadius: 999, background: "var(--ink)", color: "var(--cream)", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}
          >
            {t("products.seeResults", { count: status === "ready" ? products.length : 0 })}
          </button>
        </div>
      </Modal>

      <style>{`
        @media (max-width: 860px){
          .catalog-layout{flex-direction: column !important}
          .catalog-sidebar{display: none !important}
          .catalog-mobile-bar{display: flex !important}
        }
      `}</style>
    </div>
  );
};
