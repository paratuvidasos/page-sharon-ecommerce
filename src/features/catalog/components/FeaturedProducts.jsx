import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Reveal } from "@ui/Reveal";
import { Icon } from "@ui/Icon";
import { getFeaturedProducts } from "@shared/api-client";
import { normalizeProduct } from "../utils/normalizeProduct";
import { ProductCard } from "./ProductCard";

// [0022][BE] Destacados/ofertas reales (GET /products/featured: unión de productos
// marcados como destacados por admin + productos en oferta, destacados primero).
// Complementa a OfferBanner (que es una pieza de marketing fija del "Kit Sharon",
// sin relación con datos de catálogo) en vez de reemplazarlo — son cosas distintas.
// No hay noción de rol admin en el frontend todavía (ver AuthContext), así que el
// toggle de destacado (PATCH /admin/products/:id/featured) queda pendiente: no hay
// desde dónde mostrarlo sin inventar una pantalla admin que nadie pidió.
export const FeaturedProducts = ({ onWish, wishlistIds, onOpenProduct }) => {
  const { t } = useTranslation("catalog");
  const [items, setItems] = useState([]);

  useEffect(() => {
    let cancelled = false;
    getFeaturedProducts()
      .then((res) => {
        if (!cancelled) setItems(res.items.map(normalizeProduct));
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <section data-screen-label="Destacados" style={{ padding: "60px 0" }}>
      <div className="wrap">
        <Reveal>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: 36 }}>
            <div>
              <div className="eyebrow">{t("featured.eyebrow")}</div>
              <h2 className="display" style={{ fontSize: "clamp(32px, 4vw, 48px)", margin: "8px 0 0" }}>
                {t("featured.title")}
              </h2>
            </div>
            <Link to="/tienda" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink)", borderBottom: "1px solid var(--ink)", paddingBottom: 4, textDecoration: "none" }}>
              {t("featured.viewAll")} <Icon name="arrow" size={14} />
            </Link>
          </div>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 24 }}>
          {items.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <ProductCard
                product={p}
                onWish={onWish}
                onViewDetail={onOpenProduct}
                wished={wishlistIds?.has(p.productId)}
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
