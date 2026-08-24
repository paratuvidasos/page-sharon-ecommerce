import { useEffect, useRef, useState } from "react";
import { Icon } from "@ui/Icon";
import { ProductImage } from "@ui/ProductImage";
import { IconButton } from "@ui/components/IconButton";
import { Button } from "@ui/components/Button";
import { Modal } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { formatCurrency } from "@shared/i18n/currency";
import { CheckoutForm } from "./CheckoutForm";

// Modal de checkout ([0011][BE]): resumen del carrito + CheckoutForm (dirección, método
// de pago, correo de invitado y "crear cuenta" cuando no hay sesión), y una pantalla de
// éxito propia con el número de pedido real que devuelve el backend. Reemplaza al flujo
// anterior de "enviar por WhatsApp" — ya existe un endpoint real para colocar pedidos.
export const CheckoutModal = ({ open, onClose, cart, onClearCart, onOrderPlaced, user, addresses }) => {
  const [submitting, setSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const formRef = useRef(null);

  useEffect(() => {
    if (open) {
      setPlacedOrder(null);
      setFormKey((k) => k + 1);
    }
  }, [open]);

  const items = cart.items;
  const subtotal = cart.subtotal;
  const shippingCost = subtotal === 0 || subtotal >= 150000 ? 0 : 9900;
  const total = cart.total + shippingCost;

  const handleSubmit = async () => {
    if (!formRef.current) return;
    setSubmitting(true);
    const result = await formRef.current.submit();
    setSubmitting(false);
    if (result?.ok) {
      setPlacedOrder(result.order);
      onClearCart();
      onOrderPlaced?.(result.order);
    }
  };

  const close = () => {
    onClose();
    setTimeout(() => setFormKey((k) => k + 1), 350);
  };

  return (
    <Modal
      open={open}
      onClose={close}
      zIndex={Z.checkout}
      width="min(560px, 92vw)"
      labelledBy="checkout-modal-title"
      panelStyle={{
        background: "var(--cream)",
        borderRadius: 24,
        boxShadow: "0 32px 80px rgba(27,24,21,.3)",
        border: ".5px solid var(--line)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        maxHeight: "90vh",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 26px",
          borderBottom: "1px solid var(--line)",
          flexShrink: 0,
        }}
      >
        <div>
          <div className="eyebrow" id="checkout-modal-title">
            {placedOrder ? "Pedido confirmado" : "Finalizar compra"}
          </div>
          <div className="display" style={{ fontSize: 22 }}>
            {placedOrder ? placedOrder.orderNumber : `${items.length} ${items.length === 1 ? "producto" : "productos"}`}
          </div>
        </div>
        <IconButton icon="close" size={38} iconSize={20} onClick={close} aria-label="Cerrar checkout" />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 26px" }}>
        {placedOrder ? (
          <div style={{ textAlign: "center", padding: "12px 8px 24px" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "var(--botanic-muted)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 20px",
              }}
            >
              <Icon name="leaf" size={28} color="var(--botanic-deep)" />
            </div>
            <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6 }}>
              Tu pedido <strong>{placedOrder.orderNumber}</strong> quedó registrado por{" "}
              <strong>{formatCurrency(placedOrder.total)}</strong>. Te avisamos por correo cuando cambie de estado.
            </p>
            <Button onClick={close} style={{ marginTop: 22 }}>
              Entendido
            </Button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <div className="eyebrow" style={{ marginBottom: 12, fontSize: 10 }}>
                Resumen del pedido
              </div>
              {items.map((it) => (
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
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 14, fontSize: 13, color: "var(--ink-soft)" }}>
                <span>Envío</span>
                <span>{shippingCost === 0 ? "Gratis" : formatCurrency(shippingCost)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, marginTop: 6 }}>
                <span className="display" style={{ fontSize: 20 }}>Total</span>
                <span className="display" style={{ fontSize: 24 }}>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="eyebrow" style={{ marginBottom: 14, fontSize: 10 }}>
              Tus datos
            </div>
            <CheckoutForm
              key={`checkout-${formKey}`}
              ref={formRef}
              items={items}
              shippingCost={shippingCost}
              user={user}
              addresses={addresses}
            />
          </>
        )}
      </div>

      {!placedOrder && (
        <div style={{ padding: "18px 26px 24px", borderTop: "1px solid var(--line)", background: "#fff", flexShrink: 0 }}>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ width: "100%", justifyContent: "center", opacity: submitting ? 0.6 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
          >
            {submitting ? "Enviando…" : <>Confirmar pedido <Icon name="arrow" size={16} /></>}
          </Button>
          <div style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: 11, marginTop: 8 }}>
            Al confirmar aceptas nuestros términos y condiciones.
          </div>
        </div>
      )}
    </Modal>
  );
};
