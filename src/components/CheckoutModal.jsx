import { useState } from "react";
import { Icon } from "./Icon";
import { ProductImage } from "./ProductImage";

const WA_PHONE = "573103879555";

function buildWhatsAppMessage(items, { name, phone, address, neighborhood }) {
  const lines = [
    "Hola, buen día. Estoy interesado en realizar la compra de los siguientes productos:",
    "",
    ...items.map(
      (it) => `• ${it.name} — Cantidad: ${it.qty} — $${(it.price * it.qty).toLocaleString("es-CO")}`
    ),
    "",
    "Mis datos:",
    `- Nombre: ${name}`,
    `- Teléfono: ${phone}`,
    `- Dirección: ${address}`,
    `- Barrio: ${neighborhood}`,
  ];
  return lines.join("\n");
}

export const CheckoutModal = ({ open, onClose, items, onClearCart }) => {
  const [form, setForm] = useState({ name: "", phone: "", address: "", neighborhood: "" });
  const [sending, setSending] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const total = items.reduce((s, it) => s + it.price * it.qty, 0);

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.address || !form.neighborhood) return;

    setSending(true);
    const msg = buildWhatsAppMessage(items, form);
    const url = `https://api.whatsapp.com/send?phone=${WA_PHONE}&text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");

    setTimeout(() => {
      onClearCart();
      onClose();
      setForm({ name: "", phone: "", address: "", neighborhood: "" });
      setSending(false);
    }, 600);
  };

  const field = (label, fieldName, type = "text", placeholder = "") => (
    <label style={{ display: "block" }}>
      <span className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
        {label}
      </span>
      <input
        value={form[fieldName]}
        onChange={set(fieldName)}
        type={type}
        placeholder={placeholder}
        required
        style={{
          width: "100%",
          padding: "14px 18px",
          border: ".5px solid var(--line)",
          borderRadius: 999,
          background: "#fff",
          fontSize: 14,
          fontFamily: "var(--sans)",
          outline: 0,
          transition: "border-color .25s",
        }}
        onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
      />
    </label>
  );

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(27,24,21,.5)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .35s ease",
          zIndex: 100,
          backdropFilter: "blur(6px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) ${open ? "scale(1)" : "scale(.96)"}`,
          width: "min(560px, 92vw)",
          maxHeight: "90vh",
          background: "var(--cream)",
          borderRadius: 24,
          zIndex: 101,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .3s ease, transform .35s cubic-bezier(.2,.7,.2,1)",
          boxShadow: "0 32px 80px rgba(27,24,21,.3)",
          border: ".5px solid var(--line)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
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
            <div className="eyebrow">Finalizar compra</div>
            <div className="display" style={{ fontSize: 22 }}>
              {items.length} {items.length === 1 ? "producto" : "productos"}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              border: 0,
              background: "transparent",
              cursor: "pointer",
            }}
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 26px" }}>
          <div style={{ marginBottom: 24 }}>
            <div className="eyebrow" style={{ marginBottom: 12, fontSize: 10 }}>
              Resumen del pedido
            </div>
            {items.map((it) => (
              <div
                key={it.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "56px 1fr auto",
                  gap: 12,
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <ProductImage
                    image={it.image}
                    thumbnail={it.thumbnail}
                    name={it.name}
                    accent={it.accent}
                    type={it.type}
                    category={it.category}
                  />
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{it.name}</div>
                  <div style={{ color: "var(--ink-soft)", fontSize: 12 }}>
                    Cantidad: {it.qty}
                  </div>
                </div>
                <div className="display" style={{ fontSize: 16 }}>
                  ${(it.price * it.qty).toLocaleString("es-CO")}
                </div>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 14,
                marginTop: 6,
              }}
            >
              <span className="display" style={{ fontSize: 20 }}>
                Total
              </span>
              <span className="display" style={{ fontSize: 24 }}>
                ${total.toLocaleString("es-CO")}
              </span>
            </div>
          </div>

          <div className="eyebrow" style={{ marginBottom: 14, fontSize: 10 }}>
            Tus datos
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
            className="checkout-form"
          >
            {field("Nombre", "name", "text", "Tu nombre completo")}
            {field("Teléfono", "phone", "tel", "Tu número de contacto")}
            {field("Dirección", "address", "text", "Dirección de entrega")}
            {field("Barrio", "neighborhood", "text", "Barrio o zona")}
          </div>
        </div>

        <div
          style={{
            padding: "18px 26px 24px",
            borderTop: "1px solid var(--line)",
            background: "#fff",
            flexShrink: 0,
          }}
        >
          <button
            onClick={handleSubmit}
            disabled={
              sending || !form.name || !form.phone || !form.address || !form.neighborhood
            }
            className="btn btn-dark"
            style={{
              width: "100%",
              justifyContent: "center",
              opacity:
                sending || !form.name || !form.phone || !form.address || !form.neighborhood
                  ? 0.5
                  : 1,
              cursor:
                sending || !form.name || !form.phone || !form.address || !form.neighborhood
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {sending ? (
              "Enviando…"
            ) : (
              <>
                Enviar pedido por WhatsApp <Icon name="tt" size={16} />
              </>
            )}
          </button>
          <div
            style={{
              textAlign: "center",
              color: "var(--ink-soft)",
              fontSize: 11,
              marginTop: 8,
            }}
          >
            Al enviar aceptas nuestros términos y condiciones.
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 560px) {
          .checkout-form {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
};