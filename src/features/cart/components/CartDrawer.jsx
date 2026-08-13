import { useState } from "react";
import { Icon } from "@ui/Icon";
import { ProductImage } from "@ui/ProductImage";
import { IconButton } from "@ui/components/IconButton";
import { Button } from "@ui/components/Button";
import { CheckoutModal } from "@features/checkout/components/CheckoutModal";

export const CartDrawer = ({ open, onClose, items, setItems }) => {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const total = items.reduce((s, it) => s + it.price * it.qty, 0);
  const shipping = total > 40 || total === 0 ? 0 : 4.95;

  const inc = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  const dec = (id) => setItems(prev => prev.flatMap(i => i.id === id ? (i.qty - 1 <= 0 ? [] : [{ ...i, qty: i.qty - 1 }]) : [i]));
  const rm  = (id) => setItems(prev => prev.filter(i => i.id !== id));

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(27,24,21,.4)",
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity .35s ease", zIndex: 80, backdropFilter: "blur(2px)"
      }} />
      <aside style={{
        position: "fixed", top: 0, right: 0, height: "100vh", width: "min(460px, 100vw)",
        background: "var(--cream)", zIndex: 81,
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform .45s cubic-bezier(.2,.7,.2,1)",
        display: "flex", flexDirection: "column",
        boxShadow: "-20px 0 60px rgba(27,24,21,.18)"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "22px 26px", borderBottom: "1px solid var(--line)" }}>
          <div>
            <div className="eyebrow">Tu bolsa</div>
            <div className="display" style={{ fontSize: 22 }}>{items.length} {items.length === 1 ? "artículo" : "artículos"}</div>
          </div>
          <IconButton icon="close" size={38} iconSize={20} onClick={onClose} aria-label="Cerrar bolsa" />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 26px" }}>
          {items.length === 0 && (
            <div style={{ display: "grid", placeItems: "center", gap: 14, padding: "60px 0", textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: 999, background: "var(--cream-2)", display: "grid", placeItems: "center", color: "var(--ink-soft)" }}>
                <Icon name="cart" size={32} />
              </div>
              <div>
                <div className="display" style={{ fontSize: 22 }}>Tu bolsa está vacía</div>
                <div style={{ color: "var(--ink-soft)", fontSize: 14, marginTop: 4 }}>Añade algún producto para empezar tu ritual.</div>
              </div>
              <Button onClick={onClose} size="sm" style={{ marginTop: 6 }}>Explorar productos</Button>
            </div>
          )}

          {items.map(it => (
            <div key={it.id} style={{ display: "grid", gridTemplateColumns: "80px 1fr auto", gap: 14, alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--line)" }}>
              <div style={{ width: 80, height: 80, borderRadius: 12, overflow: "hidden" }}>
                <ProductImage product={it} />
              </div>
              <div>
                <div style={{ fontWeight: 500 }}>{it.name}</div>
                <div style={{ color: "var(--ink-soft)", fontSize: 12 }}>{it.sub}</div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 8, border: "1px solid var(--line)", borderRadius: 999, padding: "2px" }}>
                  <button onClick={() => dec(it.id)} style={{ width: 26, height: 26, borderRadius: 999, border: 0, background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="minus" size={12} /></button>
                  <span className="mono" style={{ minWidth: 16, textAlign: "center" }}>{it.qty}</span>
                  <button onClick={() => inc(it.id)} style={{ width: 26, height: 26, borderRadius: 999, border: 0, background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}><Icon name="plus" size={12} /></button>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="display" style={{ fontSize: 18 }}>${(it.price * it.qty)}</div>
                <button onClick={() => rm(it.id)} style={{ background: "transparent", border: 0, color: "var(--ink-soft)", fontSize: 11, cursor: "pointer", marginTop: 6, textDecoration: "underline" }}>Quitar</button>
              </div>
            </div>
          ))}
        </div>

        {items.length > 0 && (
          <div style={{ padding: "20px 26px 28px", borderTop: "1px solid var(--line)", background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ink-soft)", fontSize: 13, marginBottom: 4 }}>
              <span>Subtotal</span><span>${total}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ink-soft)", fontSize: 13, marginBottom: 12 }}>
              <span>Envío</span><span>{shipping === 0 ? "Gratis" : "$" + shipping}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: 12, borderTop: "1px solid var(--line)", marginBottom: 14 }}>
              <span className="display" style={{ fontSize: 22 }}>Total</span>
              <span className="display" style={{ fontSize: 28 }}>${(total + shipping)}</span>
            </div>
            <Button onClick={() => setCheckoutOpen(true)} style={{ width: "100%", justifyContent: "center" }}>
              Finalizar compra <Icon name="arrow" size={16} />
            </Button>
            <div style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: 11, marginTop: 10 }}>
              {total < 40 && total > 0 ? `Te faltan $${(40 - total)} para envío gratis` : "Envío gratis aplicado \u2726"}
            </div>
          </div>
        )}
      </aside>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        items={items}
        onClearCart={() => setItems([])}
      />
    </>
  );
};
