import { Button } from "@ui/components/Button";
import { formatCurrency } from "@shared/i18n/currency";

const CODE_LABELS = {
  CHECKOUT_PRICE_CHANGED: "El precio de algunos productos cambió",
  CHECKOUT_ITEM_UNAVAILABLE: "Algunos productos ya no están disponibles",
  VARIANT_OUT_OF_STOCK: "Un producto se agotó mientras confirmábamos tu pedido",
  NO_SHIPPING_COVERAGE: "No hacemos envíos a esa dirección",
  SHIPPING_METHOD_NOT_AVAILABLE: "Ese método de envío ya no está disponible",
  PAYMENT_METHOD_NOT_AVAILABLE: "Ese método de pago ya no está disponible",
  PRODUCTS_RESTRICTED_FOR_ZONE: "Algunos productos no se pueden enviar a esa zona",
};

// Mapea los códigos de error documentados en el handoff de checkout con Bold a un
// mensaje + acción de recuperación. `error` es { code, message, lines?, restrictedProducts? }
// armado en CheckoutPage a partir del ApiError que devuelve POST /orders/checkout.
// `cartItems` sirve solo para resolver el nombre de los productos restringidos (el
// backend únicamente manda productId + reason).
export const CheckoutErrorBanner = ({ error, cartItems, onRefreshCart, onRemoveCoupon }) => {
  if (!error) return null;

  const isCouponError = typeof error.code === "string" && error.code.startsWith("COUPON_");
  const needsCartRefresh = ["CHECKOUT_PRICE_CHANGED", "CHECKOUT_ITEM_UNAVAILABLE", "VARIANT_OUT_OF_STOCK"].includes(error.code);

  return (
    <div
      role="alert"
      style={{
        background: "rgba(156,74,74,.08)",
        border: "1px solid rgba(156,74,74,.3)",
        borderRadius: 14,
        padding: "14px 18px",
        marginBottom: 20,
        fontSize: 13,
        color: "#7A3535",
      }}
    >
      <div style={{ fontWeight: 600, marginBottom: 4 }}>
        {CODE_LABELS[error.code] || "No pudimos procesar tu pedido"}
      </div>
      <div>{error.message}</div>

      {error.lines?.length > 0 && (
        <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
          {error.lines.map((line, i) => (
            <li key={i} style={{ fontSize: 12 }}>
              {line.productName || "Producto"}
              {line.previousUnitPrice != null && line.currentUnitPrice != null && (
                <> — antes {formatCurrency(line.previousUnitPrice)}, ahora {formatCurrency(line.currentUnitPrice)}</>
              )}
              {line.availableQuantity != null && <> — quedan {line.availableQuantity} disponibles</>}
            </li>
          ))}
        </ul>
      )}

      {error.restrictedProducts?.length > 0 && (
        <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
          {error.restrictedProducts.map((p) => (
            <li key={p.productId} style={{ fontSize: 12 }}>
              {cartItems?.find((it) => it.productId === p.productId)?.productName || "Producto"} — {p.reason}
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {needsCartRefresh && (
          <Button type="button" size="sm" onClick={onRefreshCart}>
            Actualizar carrito y reintentar
          </Button>
        )}
        {isCouponError && (
          <Button type="button" size="sm" onClick={onRemoveCoupon}>
            Quitar cupón
          </Button>
        )}
      </div>
    </div>
  );
};
