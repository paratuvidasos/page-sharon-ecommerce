import { useTranslation } from "react-i18next";
import { formatCurrency } from "@shared/i18n/currency";

const groupLabelStyle = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "var(--ink)",
  marginBottom: 14,
};

const rowStyle = (active, disabled) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 10,
  width: "100%",
  padding: "9px 2px",
  border: 0,
  borderBottom: "1px solid var(--line)",
  background: "transparent",
  cursor: disabled ? "not-allowed" : "pointer",
  fontSize: 13,
  textAlign: "left",
  color: disabled ? "var(--ink-soft)" : "var(--ink)",
  opacity: disabled ? 0.4 : 1,
  fontWeight: active ? 600 : 400,
});

const checkboxStyle = (active) => ({
  width: 15,
  height: 15,
  borderRadius: 4,
  border: "1px solid " + (active ? "var(--ink)" : "var(--line)"),
  background: active ? "var(--ink)" : "transparent",
  flexShrink: 0,
  display: "grid",
  placeItems: "center",
});

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--line)",
  borderRadius: 8,
  background: "#fff",
  fontSize: 13,
  fontFamily: "var(--sans)",
  outline: 0,
};

const FACETS = [
  { key: "hairType", labelKey: "filters.groups.hairType", facetKey: "hairType" },
  { key: "line", labelKey: "filters.groups.line", facetKey: "line" },
  { key: "ingredient", labelKey: "filters.groups.ingredient", facetKey: "mainIngredient" },
];

// Sidebar de filtros al estilo de referencias de e-commerce como Undergold: grupos
// verticales con checkbox + conteo, en vez de píldoras horizontales — folding de
// categoría + atributos + precio en un solo panel lateral. Los conteos de
// GET /products/filters reflejan solo la categoría ya aplicada, no los otros
// filtros de atributo entre sí (ver Products.jsx: solo se vuelve a pedir cuando
// cambia categoryId).
export const ProductFilters = ({
  categories,
  categoryId,
  onCategoryChange,
  facets,
  selected,
  onChange,
}) => {
  const { t } = useTranslation("catalog");
  const hasActiveFilters = selected.hairType || selected.line || selected.ingredient || selected.priceMin || selected.priceMax || categoryId;

  const toggleAttr = (key, value) => {
    onChange({ ...selected, [key]: selected[key] === value ? null : value });
  };

  const clearAll = () => {
    onCategoryChange(null);
    onChange({ hairType: null, line: null, ingredient: null, priceMin: null, priceMax: null });
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".14em", textTransform: "uppercase" }}>{t("filters.title")}</span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAll}
            style={{ background: "none", border: 0, padding: 0, fontSize: 11, color: "var(--ink-soft)", textDecoration: "underline", cursor: "pointer" }}
          >
            {t("filters.clear")}
          </button>
        )}
      </div>

      {categories && categories.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <div style={groupLabelStyle}>{t("filters.category")}</div>
          <button onClick={() => onCategoryChange(null)} style={rowStyle(categoryId === null)}>
            <span>{t("filters.all")}</span>
            <span style={checkboxStyle(categoryId === null)} />
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => onCategoryChange(c.id)} style={rowStyle(categoryId === c.id)}>
              <span>{c.name}</span>
              <span style={checkboxStyle(categoryId === c.id)} />
            </button>
          ))}
        </div>
      )}

      {facets && FACETS.map(({ key, labelKey, facetKey }) => {
        const options = facets[facetKey];
        if (!options || options.length === 0) return null;
        return (
          <div key={key} style={{ marginBottom: 28 }}>
            <div style={groupLabelStyle}>{t(labelKey)}</div>
            {options.map((opt) => {
              const active = selected[key] === opt.value;
              const disabled = opt.count === 0 && !active;
              return (
                <button
                  key={opt.value}
                  onClick={() => toggleAttr(key, opt.value)}
                  disabled={disabled}
                  style={rowStyle(active, disabled)}
                >
                  <span style={{ textTransform: "capitalize" }}>{opt.value}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span className="mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>{opt.count}</span>
                    <span style={checkboxStyle(active)} />
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}

      {facets?.priceRange && (
        <div style={{ marginBottom: 28 }}>
          <div style={groupLabelStyle}>{t("filters.price")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <input
              type="number"
              placeholder={t("filters.priceFrom", { amount: formatCurrency(facets.priceRange.min) })}
              value={selected.priceMin ?? ""}
              onChange={(e) => onChange({ ...selected, priceMin: e.target.value ? Number(e.target.value) : null })}
              style={inputStyle}
            />
            <input
              type="number"
              placeholder={t("filters.priceTo", { amount: formatCurrency(facets.priceRange.max) })}
              value={selected.priceMax ?? ""}
              onChange={(e) => onChange({ ...selected, priceMax: e.target.value ? Number(e.target.value) : null })}
              style={inputStyle}
            />
          </div>
        </div>
      )}
    </div>
  );
};
