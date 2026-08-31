import { useTranslation } from "react-i18next";
import { Button } from "@ui/components/Button";
import { formatCurrency } from "@shared/i18n/currency";

// Mapea los códigos de error documentados en el handoff de checkout con Bold a un
// mensaje + acción de recuperación. `error` es { code, message, lines?, restrictedProducts? }
// armado en CheckoutPage a partir del ApiError que devuelve POST /orders/checkout.
// `cartItems` sirve solo para resolver el nombre de los productos restringidos (el
// backend únicamente manda productId + reason).
export const CheckoutErrorBanner = ({ error, cartItems, onRefreshCart, onRemoveCoupon }) => {
  const { t } = useTranslation("checkout");
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
        {error.code && t(`errorBanner.codes.${error.code}`, { defaultValue: "" }) || t("errorBanner.genericTitle")}
      </div>
      <div>{error.message}</div>

      {error.lines?.length > 0 && (
        <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
          {error.lines.map((line, i) => (
            <li key={i} style={{ fontSize: 12 }}>
              {line.productName || t("errorBanner.productFallback")}
              {line.previousUnitPrice != null && line.currentUnitPrice != null && (
                <> {t("errorBanner.priceChange", { previous: formatCurrency(line.previousUnitPrice), current: formatCurrency(line.currentUnitPrice) })}</>
              )}
              {line.availableQuantity != null && <> {t("errorBanner.availableQuantity", { count: line.availableQuantity })}</>}
            </li>
          ))}
        </ul>
      )}

      {error.restrictedProducts?.length > 0 && (
        <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
          {error.restrictedProducts.map((p) => (
            <li key={p.productId} style={{ fontSize: 12 }}>
              {cartItems?.find((it) => it.productId === p.productId)?.productName || t("errorBanner.productFallback")} — {p.reason}
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        {needsCartRefresh && (
          <Button type="button" size="sm" onClick={onRefreshCart}>
            {t("errorBanner.refreshCartAndRetry")}
          </Button>
        )}
        {isCouponError && (
          <Button type="button" size="sm" onClick={onRemoveCoupon}>
            {t("errorBanner.removeCoupon")}
          </Button>
        )}
      </div>
    </div>
  );
};
