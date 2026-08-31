import { useTranslation } from "react-i18next";
import { ProductImage } from "@ui/ProductImage";
import { formatCurrency } from "@shared/i18n/currency";

// Costo de envío + total mostrados en el checkout — informativo (lo que se cobra de
// verdad lo decide el backend en POST /orders/checkout). Exportado para que la barra
// fija de móvil en CheckoutPage.jsx use el mismo número sin duplicar la fórmula.
export const computeCheckoutTotal = (cart, shippingOption) => {
  const shippingCost = shippingOption ? (shippingOption.freeShippingApplied ? 0 : shippingOption.cost) : null;
  return { shippingCost, total: cart.total + (shippingCost || 0) };
};

// Columna derecha del checkout: items + cupón + totales. El costo de envío que se ve
// acá es el de la opción elegida en ShippingMethodStep (solo informativo — lo que se
// cobra de verdad lo decide el backend en POST /orders/checkout).
export const OrderSummary = ({ cart, shippingOption }) => {
  const { t } = useTranslation("checkout");
  const { shippingCost, total } = computeCheckoutTotal(cart, shippingOption);

  return (
    <div
      style={{
        background: "var(--cream-2)",
        borderRadius: 24,
        border: ".5px solid var(--line)",
        padding: "24px 26px",
      }}
    >
      <div className="eyebrow" style={{ marginBottom: 16, fontSize: 10 }}>
        {t("orderSummary.title")}
      </div>

      {cart.items.map((it) => (
        <div
          key={it.itemId}
          style={{
            display: "grid",
            gridTemplateColumns: "56px 1fr auto",
            gap: 12,
            alignItems: "center",
            padding: "10px 0",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden" }}>
            <ProductImage image={it.thumbnailUrl} thumbnail={it.thumbnailUrl} name={it.productName} />
          </div>
          <div>
            <div style={{ fontWeight: 500, fontSize: 14 }}>{it.productName}</div>
            <div style={{ color: "var(--ink-soft)", fontSize: 12 }}>{t("orderSummary.quantity", { count: it.quantity })}</div>
          </div>
          <div className="display" style={{ fontSize: 16 }}>
            {formatCurrency(it.subtotal)}
          </div>
        </div>
      ))}

      <div style={{ paddingTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ink-soft)", fontSize: 13, marginBottom: 4 }}>
          <span>{t("orderSummary.subtotal")}</span><span>{formatCurrency(cart.subtotal)}</span>
        </div>
        {cart.discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--botanic-deep)", fontSize: 13, marginBottom: 4 }}>
            <span>{cart.couponCode ? t("orderSummary.discountWithCode", { code: cart.couponCode }) : t("orderSummary.discount")}</span><span>-{formatCurrency(cart.discount)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ink-soft)", fontSize: 13 }}>
          <span>{t("orderSummary.shipping")}</span>
          <span>{shippingCost == null ? t("orderSummary.shippingTBD") : shippingCost === 0 ? t("orderSummary.free") : formatCurrency(shippingCost)}</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, marginTop: 10, borderTop: "1px solid var(--line)" }}>
        <span className="display" style={{ fontSize: 20 }}>{t("orderSummary.total")}</span>
        <span className="display" style={{ fontSize: 26 }}>{formatCurrency(total)}</span>
      </div>
    </div>
  );
};
