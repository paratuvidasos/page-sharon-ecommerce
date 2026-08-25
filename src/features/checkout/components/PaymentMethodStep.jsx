import { useEffect, useState } from "react";
import { listPaymentMethods, ApiError } from "@shared/api-client";
import { fieldLabelStyle, optionCardStyle, optionRowStyle } from "../fieldStyles";
import { CardBrandIcons } from "./CardBrandIcons";

// El backend (GET /payments/methods) devuelve hasta 5 códigos para CO/COP
// (CREDIT_CARD, DEBIT_CARD, PSE, NEQUI, BANCOLOMBIA_BUTTON), pero todos terminan en
// el mismo widget de Bold — nuestra UI no necesita listarlos todos por separado.
// Se agrupan en dos casillas: "Tarjeta" (crédito/débito, con marcas) y "Bold" (todo
// lo demás que el propio botón de Bold resuelve puertas adentro: PSE, Nequi,
// Bancolombia…). El código real que se manda a POST /orders/checkout sigue siendo
// el que devolvió el backend (m.method/m.label) — acá solo se agrupa la vista.
const CARD_CODES = ["CREDIT_CARD", "DEBIT_CARD"];

// `compact` se usa cuando este mismo componente se reutiliza dentro de
// RetryPaymentPanel (pantalla de resultado, tras un pago rechazado).
export const PaymentMethodStep = ({ countryCode, currency, value, onSelect, compact = false }) => {
  const [state, setState] = useState({ loading: true, methods: [], error: null });

  useEffect(() => {
    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    listPaymentMethods({ countryCode, currency })
      .then((res) => {
        if (cancelled) return;
        setState({ loading: false, methods: res.methods, error: null });
        const stillValid = res.methods.some((m) => m.method === value?.method);
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
  ].filter(Boolean);

  return (
    <div>
      {!compact && (
        <>
          <div className="eyebrow" style={fieldLabelStyle}>Método de pago</div>
          <p style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 14 }}>
            Todas las transacciones son seguras. Bold procesa tu pago de forma encriptada.
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
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};
