import { useEffect, useState } from "react";
import { Reveal } from "@ui/Reveal";
import { Icon } from "@ui/Icon";
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
const SORT_OPTIONS = [
  { value: "NEWEST", label: "Más nuevo" },
  { value: "BEST_SELLING", label: "Más vendido" },
  { value: "PRICE_ASC", label: "Precio: menor a mayor" },
  { value: "PRICE_DESC", label: "Precio: mayor a menor" },
];

// Cuerpo de la página de catálogo (sidebar de filtros + grid), estilo tienda
// (referencia: layouts de e-commerce tipo Undergold — sidebar vertical con
// checkboxes y conteos, header minimalista, grid limpio) en vez del carrusel de
// "selección destacada" que tenía cuando esto vivía embebido en la landing.
export const Products = ({ onWish, wishlistIds, onOpenProduct }) => {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState(null);
  const [facets, setFacets] = useState(null);
  const [attrFilters, setAttrFilters] = useState(EMPTY_ATTR_FILTERS);
  const [sort, setSort] = useState("NEWEST");
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error

  useEffect(() => {
    let cancelled = false;
    listCategories({ limit: 100 })
      .then((res) => {
        if (!cancelled) setCategories(res.items);
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
        setProducts(res.items.map(normalizeProduct));
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

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32, paddingBottom: 20, borderBottom: "1px solid var(--line)" }}>
          <span className="mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
            {status === "ready" ? `${products.length} ${products.length === 1 ? "producto" : "productos"}${activeCategoryName ? ` en ${activeCategoryName}` : ""}` : " "}
          </span>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "var(--ink-soft)" }}>
            Ordenar por
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 999, background: "#fff", fontSize: 12.5, fontFamily: "var(--sans)", color: "var(--ink)", outline: 0 }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </label>
        </div>

        {status === "error" && (
          <div style={{ textAlign: "center", padding: "80px 8px", color: "var(--ink-soft)" }}>
            <Icon name="cart" size={26} />
            <p style={{ fontSize: 13, marginTop: 10 }}>No pudimos cargar el catálogo. Intenta de nuevo en un momento.</p>
          </div>
        )}

        {status !== "error" && products.length === 0 && status === "ready" && (
          <div style={{ textAlign: "center", padding: "80px 8px", color: "var(--ink-soft)" }}>
            <p style={{ fontSize: 13 }}>No encontramos productos con estos filtros.</p>
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

      <style>{`
        @media (max-width: 860px){
          .catalog-layout{flex-direction: column !important}
          .catalog-sidebar{width: 100% !important; position: static !important}
        }
      `}</style>
    </div>
  );
};
