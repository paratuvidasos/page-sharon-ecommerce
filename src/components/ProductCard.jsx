import { useState } from "react";
import { Icon, Stars } from "./Icon";
import { ProductImage } from "./ProductImage";

export const ProductCard = ({ product, onAdd, onWish }) => {
  const [hover, setHover] = useState(false);
  const [wished, setWished] = useState(false);
  const hasGallery = product.gallery && product.gallery.length > 0;

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        background: "#fff",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: hover ? "var(--shadow-lg)" : "var(--shadow-sm)",
        transition: "transform .35s ease, box-shadow .35s ease",
        transform: hover ? "translateY(-4px)" : "translateY(0)",
        border: ".5px solid var(--line)",
      }}
    >
      {product.badge && (
        <span
          style={{
            position: "absolute",
            top: 14,
            left: 14,
            zIndex: 2,
            background:
              product.badge === "Nuevo" ? "var(--botanic-deep)" : "var(--ink)",
            color: "#fff",
            fontSize: 10,
            padding: "5px 10px",
            borderRadius: 999,
            letterSpacing: ".12em",
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          {product.badge}
        </span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setWished((w) => !w);
          onWish && onWish(product);
        }}
        aria-label="Favorito"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          zIndex: 2,
          width: 36,
          height: 36,
          borderRadius: 999,
          border: 0,
          background: "rgba(255,255,255,.85)",
          backdropFilter: "blur(8px)",
          color: wished ? "var(--botanic-deep)" : "var(--ink-soft)",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          boxShadow: "0 2px 8px rgba(27,24,21,.06)",
          transition: "color .2s ease, transform .2s ease",
          transform: wished ? "scale(1.05)" : "scale(1)",
        }}
      >
        <Icon name="heart" size={16} />
      </button>

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
          accent={product.accent}
          type={product.type}
          category={product.category}
        />
      </div>

      <div style={{ padding: "18px 20px 22px" }}>
        <div className="eyebrow" style={{ fontSize: 10 }}>
          {product.category}
        </div>
        <h3
          className="display"
          style={{ fontSize: 24, margin: "6px 0 4px", fontWeight: 500 }}
        >
          {product.name}
        </h3>
        <div
          style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 12 }}
        >
          {product.sub}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 14,
          }}
        >
          <Stars value={product.rating} />
          <span className="mono" style={{ color: "var(--ink-soft)" }}>
            {product.rating.toFixed(1)} · {product.reviews}
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
              ${Intl.NumberFormat("es-CO").format(product.price)}
            </span>
            {product.oldPrice && (
              <span
                style={{
                  color: "var(--ink-soft)",
                  fontSize: 13,
                  textDecoration: "line-through",
                }}
              >
                ${Intl.NumberFormat("es-CO").format(product.oldPrice)}
              </span>
            )}
          </div>
          <button
            onClick={() => onAdd(product)}
            style={{
              border: 0,
              cursor: "pointer",
              padding: "10px 14px",
              borderRadius: 999,
              background: hover ? "var(--ink)" : "var(--cream-2)",
              color: hover ? "var(--cream)" : "var(--ink)",
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
