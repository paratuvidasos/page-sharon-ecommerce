import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@ui/Icon";
import { ProductImage } from "@ui/ProductImage";
import { IconButton } from "@ui/components/IconButton";
import { Button } from "@ui/components/Button";
import { CouponForm } from "./CouponForm";
import { Z } from "@ui/zIndex";
import { formatCurrency } from "@shared/i18n/currency";
import { useCart } from "@shared/cart/CartContext";

const FREE_SHIPPING_THRESHOLD = 150000;
const SHIPPING_COST = 9900;

// Fila individual del carrito: dueña de su propio estado de "confirmar quitar" y
// del mensaje de stock insuficiente (mismo patrón inline de AddressCard.jsx, sin
// un ConfirmDialog compartido) — así cada línea reintenta su propia mutación sin
// pisar el estado de las demás.
const CartLine = ({ item }) => {
  const { t } = useTranslation("cart");
  const { updateItem, removeItem } = useCart();
  const [pending, setPending] = useState(false);
  const [confirmingRemove, setConfirmingRemove] = useState(false);
  const [stockNotice, setStockNotice] = useState(null);

  const changeQty = async (nextQty) => {
    if (nextQty <= 0) {
      setConfirmingRemove(true);
      return;
    }
    setPending(true);
    setStockNotice(null);
    const result = await updateItem(item.itemId, nextQty);
    setPending(false);
    if (!result.ok && result.code === "INSUFFICIENT_STOCK") {
      setStockNotice(result.availableQuantity);
    }
  };

  const handleRemove = async () => {
    setPending(true);
    await removeItem(item.itemId);
    setPending(false);
  };

  return (
    <div style={{ padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 14, alignItems: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: 12, overflow: "hidden", opacity: item.unavailable ? 0.5 : 1 }}>
          <ProductImage image={item.thumbnailUrl} thumbnail={item.thumbnailUrl} name={item.productName} />
        </div>
        <div>
          <div style={{ fontWeight: 500 }}>{item.productName}</div>
          {item.variantLabel && <div style={{ color: "var(--ink-soft)", fontSize: 12 }}>{item.variantLabel}</div>}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8, border: "1px solid var(--line)", borderRadius: 999, padding: "2px" }}>
            <button
              className="cart-qty-btn"
              onClick={() => changeQty(item.quantity - 1)}
              disabled={pending || item.unavailable}
              style={{ width: 26, height: 26, borderRadius: 999, border: 0, background: "transparent", cursor: pending ? "not-allowed" : "pointer", display: "grid", placeItems: "center" }}
            >
              <Icon name="minus" size={12} />
            </button>
            <span className="mono" style={{ minWidth: 16, textAlign: "center" }}>{item.quantity}</span>
            <button
              className="cart-qty-btn"
              onClick={() => changeQty(item.quantity + 1)}
              disabled={pending || item.unavailable}
              style={{ width: 26, height: 26, borderRadius: 999, border: 0, background: "transparent", cursor: pending ? "not-allowed" : "pointer", display: "grid", placeItems: "center" }}
            >
              <Icon name="plus" size={12} />
            </button>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="display" style={{ fontSize: 18 }}>{formatCurrency(item.subtotal)}</div>
          {!confirmingRemove && (
            <button
              onClick={() => setConfirmingRemove(true)}
              disabled={pending}
              style={{ background: "transparent", border: 0, color: "var(--ink-soft)", fontSize: 11, cursor: "pointer", marginTop: 6, textDecoration: "underline" }}
            >
              {t("line.remove")}
            </button>
          )}
        </div>
      </div>

      {item.priceChanged && !item.unavailable && (
        <div style={{ fontSize: 11.5, color: "#9C4A4A", marginTop: 6 }}>{t("line.priceChanged")}</div>
      )}
      {item.unavailable && (
        <div style={{ fontSize: 11.5, color: "#9C4A4A", marginTop: 6 }}>{t("line.unavailable")}</div>
      )}
      {stockNotice != null && (
        <div style={{ fontSize: 11.5, color: "#9C4A4A", marginTop: 6 }}>
          {t("line.onlyAvailable", { count: stockNotice })}{" "}
          {stockNotice > 0 && (
            <button
              type="button"
              onClick={() => changeQty(stockNotice)}
              style={{ background: "none", border: 0, padding: 0, color: "inherit", textDecoration: "underline", cursor: "pointer", fontSize: "inherit" }}
            >
              {t("line.useMaxQuantity")}
            </button>
          )}
        </div>
      )}

      {confirmingRemove && (
        <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(156,74,74,.08)", border: "1px solid rgba(156,74,74,.3)", borderRadius: 12 }}>
          <p style={{ fontSize: 12, color: "#7A3535" }}>{t("line.confirmRemove")}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Button type="button" size="sm" onClick={handleRemove} disabled={pending}>
              {pending ? t("line.removing") : t("line.confirmYes")}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmingRemove(false)} disabled={pending}>
              {t("line.cancel")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export const CartDrawer = ({ open, onClose }) => {
  const { t } = useTranslation("cart");
  const navigate = useNavigate();
  const { cart, clear } = useCart();
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [clearing, setClearing] = useState(false);

  const shipping = cart.total === 0 || cart.total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

  const handleClear = async () => {
    setClearing(true);
    await clear();
    setClearing(false);
    setConfirmingClear(false);
  };

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(27,24,21,.4)",
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity .35s ease", zIndex: Z.cart, backdropFilter: "blur(2px)"
      }} />
      <aside style={{
        position: "fixed", top: 0, right: 0, height: "100vh", width: "min(460px, 100vw)",
        background: "var(--cream)", zIndex: Z.cart + 1,
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform .45s cubic-bezier(.2,.7,.2,1)",
        display: "flex", flexDirection: "column",
        boxShadow: "-20px 0 60px rgba(27,24,21,.18)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 26px" }}>
          <div>
            <div className="eyebrow">{t("drawer.title")}</div>
            <div className="display" style={{ fontSize: 22 }}>{t("drawer.itemCount", { count: cart.items.length })}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {cart.items.length > 0 && !confirmingClear && (
              <button
                onClick={() => setConfirmingClear(true)}
                style={{ background: "transparent", border: 0, color: "var(--ink-soft)", fontSize: 11, cursor: "pointer", textDecoration: "underline" }}
              >
                {t("drawer.clear")}
              </button>
            )}
            <IconButton icon="close" size={38} iconSize={20} onClick={onClose} aria-label={t("drawer.close")} />
          </div>
        </div>
        <div className="stitch" style={{ margin: "0 26px" }} />

        {confirmingClear && (
          <div style={{ margin: "16px 26px 0", padding: "10px 12px", background: "rgba(156,74,74,.08)", border: "1px solid rgba(156,74,74,.3)", borderRadius: 12 }}>
            <p style={{ fontSize: 12, color: "#7A3535" }}>{t("drawer.confirmClear")}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Button type="button" size="sm" onClick={handleClear} disabled={clearing}>
                {clearing ? t("drawer.clearing") : t("drawer.confirmClearYes")}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmingClear(false)} disabled={clearing}>
                {t("drawer.cancel")}
              </Button>
            </div>
          </div>
        )}

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 26px" }}>
          {cart.items.length === 0 && (
            <div style={{ display: "grid", placeItems: "center", gap: 14, padding: "60px 0", textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: 999, background: "var(--cream-2)", display: "grid", placeItems: "center", color: "var(--ink-soft)" }}>
                <Icon name="cart" size={32} />
              </div>
              <div>
                <div className="display" style={{ fontSize: 22 }}>{t("drawer.emptyTitle")}</div>
                <div style={{ color: "var(--ink-soft)", fontSize: 14, marginTop: 4 }}>{t("drawer.emptySubtitle")}</div>
              </div>
              <Button onClick={onClose} size="sm" style={{ marginTop: 6 }}>{t("drawer.exploreProducts")}</Button>
            </div>
          )}

          {cart.items.map((it) => (
            <CartLine key={it.itemId} item={it} />
          ))}
        </div>

        {cart.items.length > 0 && (
          <div style={{ padding: "20px 26px 28px", borderTop: "1px solid var(--line)", background: "#fff" }}>
            <CouponForm />
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ink-soft)", fontSize: 13, marginBottom: 4 }}>
              <span>{t("drawer.subtotal")}</span><span>{formatCurrency(cart.subtotal)}</span>
            </div>
            {cart.discount > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--botanic-deep)", fontSize: 13, marginBottom: 4 }}>
                <span>{t("drawer.discount")}</span><span>-{formatCurrency(cart.discount)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ink-soft)", fontSize: 13, marginBottom: 12 }}>
              <span>{t("drawer.shipping")}</span><span>{shipping === 0 ? t("drawer.shippingFree") : formatCurrency(shipping)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 12, borderTop: "1px solid var(--line)", marginBottom: 14 }}>
              <span className="display" style={{ fontSize: 22 }}>{t("drawer.total")}</span>
              <span className="display" style={{ fontSize: 28 }}>{formatCurrency(cart.total + shipping)}</span>
            </div>
            <Button onClick={() => { onClose(); navigate("/checkout"); }} style={{ width: "100%", justifyContent: "center" }}>
              {t("drawer.checkout")} <Icon name="arrow" size={16} />
            </Button>
            <div style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: 11, marginTop: 10 }}>
              {cart.total < FREE_SHIPPING_THRESHOLD && cart.total > 0
                ? t("drawer.freeShippingRemaining", { amount: formatCurrency(FREE_SHIPPING_THRESHOLD - cart.total) })
                : t("drawer.freeShippingApplied")}
            </div>
          </div>
        )}
      </aside>

      <style>{`
        @media (max-width: 480px){
          .cart-qty-btn{width: 38px !important; height: 38px !important}
        }
      `}</style>
    </>
  );
};
