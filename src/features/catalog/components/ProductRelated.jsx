import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getRelatedProducts } from "@shared/api-client";
import { normalizeProduct } from "../utils/normalizeProduct";
import { ProductCard } from "./ProductCard";

// [0020][BE] Relacionados: misma categoría, sin agotados, ordenados por más
// vendidos (GET /products/:slug/related). Clickear uno actualiza el slug del
// propio ProductDetailModal (onSelect) en vez de abrir un modal anidado.
export const ProductRelated = ({ slug, onWish, wishlistIds, onSelect }) => {
  const { t } = useTranslation("catalog");
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    getRelatedProducts(slug)
      .then((res) => {
        if (!cancelled) setItems(res.items.map(normalizeProduct));
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (items.length === 0) return null;

  return (
    <div style={{ marginTop: 30, paddingTop: 26, borderTop: "1px solid var(--line)" }}>
      <div className="eyebrow" style={{ fontSize: 10, marginBottom: 14 }}>{t("related.title")}</div>
      <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 6 }}>
        {items.map((p) => (
          <div key={p.id} style={{ minWidth: 200, maxWidth: 200, flexShrink: 0 }}>
            <ProductCard
              product={p}
              onWish={onWish}
              onViewDetail={onSelect}
              wished={wishlistIds?.has(p.productId)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
