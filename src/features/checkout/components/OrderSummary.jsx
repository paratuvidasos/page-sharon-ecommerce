import { ProductImage } from "@ui/ProductImage";
import { formatCurrency } from "@shared/i18n/currency";

// Columna derecha del checkout: items + cupón + totales. El costo de envío que se ve
// acá es el de la opción elegida en ShippingMethodStep (solo informativo — lo que se
// cobra de verdad lo decide el backend en POST /orders/checkout).
export const OrderSummary = ({ cart, shippingOption }) => {
  const shippingCost = shippingOption ? (shippingOption.freeShippingApplied ? 0 : shippingOption.cost) : null;
  const total = cart.total + (shippingCost || 0);

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
        Resumen del pedido
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
            <div style={{ color: "var(--ink-soft)", fontSize: 12 }}>Cantidad: {it.quantity}</div>
          </div>
          <div className="display" style={{ fontSize: 16 }}>
            {formatCurrency(it.subtotal)}
          </div>
        </div>
      ))}

      <div style={{ paddingTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ink-soft)", fontSize: 13, marginBottom: 4 }}>
          <span>Subtotal</span><span>{formatCurrency(cart.subtotal)}</span>
        </div>
        {cart.discount > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--botanic-deep)", fontSize: 13, marginBottom: 4 }}>
            <span>Descuento{cart.couponCode ? ` (${cart.couponCode})` : ""}</span><span>-{formatCurrency(cart.discount)}</span>
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ink-soft)", fontSize: 13 }}>
          <span>Envío</span>
          <span>{shippingCost == null ? "Por definir" : shippingCost === 0 ? "Gratis" : formatCurrency(shippingCost)}</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, marginTop: 10, borderTop: "1px solid var(--line)" }}>
        <span className="display" style={{ fontSize: 20 }}>Total</span>
        <span className="display" style={{ fontSize: 26 }}>{formatCurrency(total)}</span>
      </div>
    </div>
  );
};
