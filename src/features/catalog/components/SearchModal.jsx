import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@ui/Icon";
import { ProductImage } from "@ui/ProductImage";
import { Z } from "@ui/zIndex";
import { getSearchSuggestions, listCategories } from "@shared/api-client";

// [0018][BE] Búsqueda real: reemplaza el filtro local sobre el array estático por
// GET /products/search/suggestions (autocomplete, hasta 8, sin paginar — es el
// endpoint pensado para este modal rápido, no el /search paginado, que es para una
// pantalla de resultados completa que hoy no existe). Clickear un resultado abre el
// detalle (onOpenProduct, la única instancia de ProductDetailModal que vive en
// App.jsx) en vez de añadir a la bolsa a ciegas, porque las sugerencias no traen
// precio/stock. Para "sin resultados" se sugieren categorías reales (no hay
// endpoint dedicado para eso, se reusa GET /categories).
export const SearchModal = ({ open, onClose, onOpenProduct }) => {
  const { t } = useTranslation("catalog");
  const FREQUENT_SEARCHES = t("search.frequentTerms", { returnObjects: true });
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
    if (!open) {
      setQ("");
      setSuggestions([]);
    }
  }, [open]);

  useEffect(() => {
    if (!open || categories.length > 0) return;
    listCategories({ limit: 6 })
      .then((res) => setCategories(res.items))
      .catch(() => setCategories([]));
  }, [open, categories.length]);

  useEffect(() => {
    if (!q.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      getSearchSuggestions(q.trim())
        .then((res) => setSuggestions(res.suggestions))
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [q]);

  const showEmptyState = q.trim() && !loading && suggestions.length === 0;

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(27,24,21,.5)",
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity .3s ease", zIndex: Z.search, backdropFilter: "blur(6px)"
      }} />
      <div style={{
        position: "fixed", top: 80, left: "50%", transform: `translateX(-50%) ${open ? "translateY(0)" : "translateY(-20px)"}`,
        width: "min(640px, 92vw)", background: "#fff", borderRadius: 20, zIndex: Z.search + 1,
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity .3s ease, transform .3s ease",
        boxShadow: "0 24px 80px rgba(27,24,21,.25)",
        border: "1px solid var(--line)", overflow: "hidden"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px", borderBottom: "1px solid var(--line)" }}>
          <Icon name="search" size={20} color="var(--ink-soft)" />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
                 placeholder={t("search.placeholder")}
                 style={{ flex: 1, border: 0, outline: 0, background: "transparent", fontSize: 16, fontFamily: "var(--sans)" }} />
          <button onClick={onClose} style={{ border: 0, background: "transparent", cursor: "pointer", color: "var(--ink-soft)", fontSize: 12, padding: "4px 10px", borderRadius: 6 }}>{t("search.close")}</button>
        </div>
        {q.trim() && (
          <div style={{ padding: "10px 12px", maxHeight: 420, overflowY: "auto" }}>
            {showEmptyState && (
              <div style={{ padding: "30px 16px", textAlign: "center", color: "var(--ink-soft)" }}>
                <p>{t("search.noResults", { query: q })}</p>
                {categories.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>{t("search.tryCategories")}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
                      {categories.map((c) => (
                        <button key={c.id} onClick={() => setQ(c.name)} style={{ padding: "6px 12px", borderRadius: 999, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", fontSize: 12 }}>{c.name}</button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {suggestions.map(p => (
              <button key={p.id} onClick={() => onOpenProduct(p.slug)}
                style={{ width: "100%", display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 14, alignItems: "center", padding: "10px 12px", border: 0, background: "transparent", textAlign: "left", borderRadius: 12, cursor: "pointer" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--cream-2)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden" }}>
                  <ProductImage image={p.thumbnailUrl} thumbnail={p.thumbnailUrl} name={p.name} />
                </div>
                <div style={{ fontWeight: 500 }}>{p.name}</div>
                <Icon name="arrow" size={16} color="var(--ink-soft)" />
              </button>
            ))}
          </div>
        )}
        {!q.trim() && (
          <div style={{ padding: "10px 22px 18px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            <span className="eyebrow" style={{ width: "100%", marginBottom: 4 }}>{t("search.frequent")}</span>
            {FREQUENT_SEARCHES.map(t => (
              <button key={t} onClick={() => setQ(t)} style={{ padding: "6px 12px", borderRadius: 999, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", fontSize: 12 }}>{t}</button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
