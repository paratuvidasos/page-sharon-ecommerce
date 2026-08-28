import { useState } from "react";
import { Icon, Stars } from "@ui/Icon";
import { ProductImage } from "@ui/ProductImage";
import { IconButton } from "@ui/components/IconButton";
import { formatCurrency } from "@shared/i18n/currency";

// [0013][BE] stockStatus viene real del backend (agregado entre variantes) —
// se usa para la píldora de estado y para deshabilitar "Añadir" cuando no hay
// stock, en vez del "badge" (Nuevo/Más vendido) que antes era dato de mentira.
const STOCK_BADGE = {
  OUT_OF_STOCK: { label: "Agotado", bg: "var(--ink-soft)" },
  LOW_STOCK: { label: "Últimas unidades", bg: "var(--ink)" },
};

// [0023][BE] "Añadir" no llama al carrito directo: el listado no trae variantId
// (solo GET /products/:slug las expone), así que abre el detalle para que el
// selector de variante/cantidad que ya vive ahí confirme qué se agrega.

export const ProductCard = ({ product, onWish, onViewDetail, wished = false }) => {
  const [hover, setHover] = useState(false);
  const hasGallery = product.gallery && product.gallery.length > 0;
  const outOfStock = product.stockStatus === "OUT_OF_STOCK";
  const stockBadge = STOCK_BADGE[product.stockStatus];

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onViewDetail && onViewDetail(product.slug)}
      style={{
        position: "relative",
        background: "#fff",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: hover ? "var(--shadow-lg)" : "var(--shadow-sm)",
        transition: "transform .35s ease, box-shadow .35s ease",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        border: ".5px solid var(--line)",
        cursor: onViewDetail ? "pointer" : undefined,
      }}
    >
      {stockBadge && (
        <span
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            zIndex: 2,
            background: stockBadge.bg,
            color: "#fff",
            fontSize: 10,
            padding: "5px 10px",
            borderRadius: 999,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {stockBadge.label}
        </span>
      )}
      <IconButton
        icon="heart"
        size={36}
        iconSize={16}
        color={wished ? "var(--botanic-deep)" : "var(--ink-soft)"}
        onClick={(e) => {
          e.stopPropagation();
          onWish && onWish(product);
        }}
        aria-label="Favorito"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 2,
          background: "rgba(255,255,255,.85)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 8px rgba(27,24,21,.06)",
          transition: "color .2s ease, transform .2s ease",
          transform: wished ? "scale(1.05)" : "scale(1)",
        }}
      />

      <div
        style={{
          padding: "16px 16px 0",
          transition: "transform .5s ease",
          transform: hover && !hasGallery ? "scale(1.04)" : "scale(1)",
        }}
        className="product-image-wrap"
      >
        <ProductImage
          image={product.image}
          thumbnail={product.thumbnail}
          gallery={product.gallery}
          name={product.name}
        />
      </div>

      <div style={{ padding: "18px 20px 22px" }}>
        <h3
          className="display"
          style={{ fontSize: 24, margin: "6px 0 4px", fontWeight: 500 }}
        >
          {product.name}
        </h3>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <Stars value={product.ratingAverage ?? 0} />
          <span className="mono" style={{ color: "var(--ink-soft)" }}>
            {product.ratingAverage != null ? `${product.ratingAverage.toFixed(1)} · ${product.ratingCount}` : "Sin reseñas"}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span className="display" style={{ fontSize: 24, fontWeight: 500 }}>
              {formatCurrency(product.price)}
            </span>
            {product.oldPrice && (
              <span
                style={{
                  color: "var(--ink-soft)",
                  fontSize: 13,
                  textDecoration: "line-through",
                }}
              >
                {formatCurrency(product.oldPrice)}
              </span>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!outOfStock) onViewDetail && onViewDetail(product.slug);
            }}
            disabled={outOfStock}
            style={{
              border: 0,
              cursor: outOfStock ? "not-allowed" : "pointer",
              padding: "10px 14px",
              borderRadius: 999,
              background: outOfStock ? "var(--cream-2)" : hover ? "var(--ink)" : "var(--cream-2)",
              color: outOfStock ? "var(--ink-soft)" : hover ? "var(--cream)" : "var(--ink)",
              opacity: outOfStock ? 0.6 : 1,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: ".04em",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "background .3s ease, color .3s ease",
            }}
          >
            <Icon name="plus" size={14} />
            Añadir
          </button>
        </div>
      </div>
    </div>
  );
};
