import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCart } from "@shared/cart/CartContext";
import { formatCurrency } from "@shared/i18n/currency";

const inputStyle = {
  flex: 1,
  padding: "10px 14px",
  border: ".5px solid var(--line)",
  borderRadius: 999,
  background: "#fff",
  fontSize: 13,
  fontFamily: "var(--sans)",
  outline: 0,
};

// Cupón del carrito ([0027]): input + aplicar/quitar contra POST|DELETE
// /cart/coupon. El mensaje de error se muestra tal cual lo devuelve el backend
// (404 no existe, 400 vencido/no vigente/compra mínima/límite de usos).
export const CouponForm = () => {
  const { t } = useTranslation("cart");
  const { cart, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;
    setPending(true);
    setError("");
    const result = await applyCoupon(code.trim());
    setPending(false);
    if (result.ok) setCode("");
    else setError(result.message || t("coupon.genericError"));
  };

  const handleRemove = async () => {
    setPending(true);
    await removeCoupon();
    setPending(false);
  };

  if (cart.couponCode) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
        <div style={{ fontSize: 12.5 }}>
          {t("coupon.label")} <strong>{cart.couponCode}</strong>
          {cart.discount > 0 && <span style={{ color: "var(--botanic-deep)" }}> · -{formatCurrency(cart.discount)}</span>}
          {cart.couponInvalid && <span style={{ color: "#9C4A4A" }}> · {t("coupon.invalid")}</span>}
        </div>
        <button
          type="button"
          onClick={handleRemove}
          disabled={pending}
          style={{ background: "none", border: 0, padding: 0, fontSize: 12, color: "var(--ink-soft)", textDecoration: "underline", cursor: pending ? "not-allowed" : "pointer" }}
        >
          {t("coupon.remove")}
        </button>
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleApply()}
          placeholder={t("coupon.placeholder")}
          style={inputStyle}
          disabled={pending}
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={pending || !code.trim()}
          style={{
            border: 0,
            borderRadius: 999,
            padding: "10px 16px",
            background: "var(--ink)",
            color: "var(--cream)",
            fontSize: 12.5,
            fontWeight: 500,
            cursor: pending || !code.trim() ? "not-allowed" : "pointer",
            opacity: pending || !code.trim() ? 0.6 : 1,
          }}
        >
          {t("coupon.apply")}
        </button>
      </div>
      {error && (
        <div role="alert" style={{ fontSize: 11.5, color: "#9C4A4A", marginTop: 6 }}>
          {error}
        </div>
      )}
    </div>
  );
};
