import { useTranslation } from "react-i18next";
import { IconButton } from "@ui/components/IconButton";
import { ProductImage } from "@ui/ProductImage";
import { formatCurrency } from "@shared/i18n/currency";

// Fila de un producto guardado: los datos de nombre/precio/imagen se resuelven contra
// el catálogo local (products.js) porque el backend de wishlist solo devuelve
// productId + addedAt (el módulo catalog todavía no existe del lado del backend).
export const WishlistRow = ({ product, onOpenProduct, onRemove }) => {
  const { t } = useTranslation("wishlist");
  if (!product) return null;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "56px 1fr auto auto",
        gap: 12,
        alignItems: "center",
        padding: "14px 0",
        borderBottom: "1px solid var(--line)",
      }}
    >
      <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden" }}>
        <ProductImage
          image={product.image}
          thumbnail={product.thumbnail}
          name={product.name}
          type={product.type}
          accent={product.accent}
          category={product.category}
        />
      </div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{product.name}</div>
        <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{formatCurrency(product.price)}</div>
      </div>
      <button
        type="button"
        onClick={() => onOpenProduct && onOpenProduct(product.slug)}
        style={{
          border: 0,
          cursor: "pointer",
          padding: "9px 14px",
          borderRadius: 999,
          background: "var(--cream-2)",
          color: "var(--ink)",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: ".02em",
          whiteSpace: "nowrap",
        }}
      >
        {t("row.add")}
      </button>
      <IconButton
        icon="close"
        size={32}
        iconSize={16}
        onClick={() => onRemove(product)}
        aria-label={t("row.remove")}
      />
    </div>
  );
};
