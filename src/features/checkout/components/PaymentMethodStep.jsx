import { useEffect, useState } from "react";
import { listPaymentMethods, ApiError } from "@shared/api-client";
import { Icon, ICONS } from "@ui/Icon";
import { fieldLabelStyle, optionCardStyle, optionRowStyle } from "../fieldStyles";
import { CardBrandIcons } from "./CardBrandIcons";

// Método de pago "WHATSAPP": no viene del backend (GET /payments/methods) — es un
// camino alterno puramente de frontend. La persona arma el pedido en el checkout normal
// y, en vez de pagar con tarjeta/Bold, confirma y coordina el pago directo por WhatsApp
// (ver features/checkout/whatsapp.js). Se agrega siempre como última opción de la lista.
const WHATSAPP_METHOD = {
  method: "WHATSAPP",
  uiLabel: "Pagar por WhatsApp",
  uiDescription: "Te armamos el resumen de tu pedido, listo para enviarnos por chat.",
};

const WhatsAppBadge = () => (
  <span style={{
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 26, height: 26, borderRadius: "50%", background: "#25D366", flexShrink: 0,
  }}>
    <Icon name={ICONS.WHATSAPP} size={14} />
  </span>
);

// El backend (GET /payments/methods) devuelve hasta 5 códigos para CO/COP
// (CREDIT_CARD, DEBIT_CARD, PSE, NEQUI, BANCOLOMBIA_BUTTON), pero todos terminan en
// el mismo widget de Bold — nuestra UI no necesita listarlos todos por separado.
// Se agrupan en dos casillas: "Tarjeta" (crédito/débito, con marcas) y "Bold" (todo
// lo demás que el propio botón de Bold resuelve puertas adentro: PSE, Nequi,
// Bancolombia…). El código real que se manda a POST /orders/checkout sigue siendo
// el que devolvió el backend (m.method/m.label) — acá solo se agrupa la vista.
const CARD_CODES = ["CREDIT_CARD", "DEBIT_CARD"];

// `compact` se usa cuando este mismo componente se reutiliza dentro de
// RetryPaymentPanel (pantalla de resultado, tras un pago rechazado). Ahí también se
// desactiva `allowWhatsApp`: ese panel llama POST /orders/{orderNumber}/retry-payment,
// que espera uno de los códigos reales del backend — "WHATSAPP" no es uno de ellos.
export const PaymentMethodStep = ({ countryCode, currency, value, onSelect, compact = false, allowWhatsApp = true }) => {
  const [state, setState] = useState({ loading: true, methods: [], error: null });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    listPaymentMethods({ countryCode, currency })
      .then((res) => {
        if (cancelled) return;
        setState({ loading: false, methods: res.methods, error: null });
        const stillValid = (allowWhatsApp && value?.method === WHATSAPP_METHOD.method) || res.methods.some((m) => m.method === value?.method);
        if (!stillValid) {
          const card = CARD_CODES.map((code) => res.methods.find((m) => m.method === code)).find(Boolean);
          onSelect(card || res.methods[0] || null);
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setState({ loading: false, methods: [], error: e instanceof ApiError ? e.message : "No pudimos cargar los métodos de pago." });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, currency]);

  const cardMethod = CARD_CODES.map((code) => state.methods.find((m) => m.method === code)).find(Boolean);
  const boldMethod = state.methods.find((m) => !CARD_CODES.includes(m.method));
  const options = [
    cardMethod && { ...cardMethod, uiLabel: "Tarjeta de crédito o débito", uiDescription: "Visa, Mastercard, American Express y Diners." },
    boldMethod && { ...boldMethod, uiLabel: "Paga con Bold", uiDescription: "Serás redirigido a Bold para completar el pago de forma segura." },
    allowWhatsApp && !state.loading && !state.error && WHATSAPP_METHOD,
  ].filter(Boolean);

  return (
    <div>
      {!compact && (
        <>
          <div className="eyebrow" style={fieldLabelStyle}>Método de pago</div>
          <p style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 14 }}>
            Los pagos con tarjeta o Bold se procesan de forma encriptada. También puedes coordinar tu pago directo por WhatsApp.
          </p>
        </>
      )}

      {state.loading && <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>Cargando métodos de pago…</p>}
      {state.error && (
        <div role="alert" style={{ background: "rgba(156,74,74,.08)", border: "1px solid rgba(156,74,74,.3)", borderRadius: 14, padding: "12px 18px", fontSize: 13, color: "#7A3535" }}>
          {state.error}
        </div>
      )}

      {!state.loading && !state.error && options.length > 0 && (
        <div style={optionCardStyle}>
          {options.map((m, i) => {
            const selected = value?.method === m.method;
            return (
              <label key={m.method} style={optionRowStyle(selected, i === options.length - 1)}>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={selected}
                    onChange={() => onSelect(m)}
                    style={{ accentColor: "var(--botanic-deep)" }}
                  />
                  <span>
                    <div style={{ fontSize: 13.5 }}>{m.uiLabel}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{m.uiDescription}</div>
                  </span>
                </span>
                {CARD_CODES.includes(m.method) && <CardBrandIcons />}
                {m.method === WHATSAPP_METHOD.method && <WhatsAppBadge />}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};
