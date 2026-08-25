import { useEffect, useState } from "react";
import { quoteShipping, ApiError } from "@shared/api-client";
import { formatCurrency } from "@shared/i18n/currency";
import { fieldLabelStyle, optionCardStyle, optionRowStyle } from "../fieldStyles";

// Cotiza el envío contra el backend (POST /shipping/quote) cada vez que cambia la
// dirección o el subtotal (aplicar un cupón cambia el subtotal y puede activar envío
// gratis). El costo mostrado acá es solo informativo — lo que de verdad se cobra lo
// recalcula el backend en POST /orders/checkout a partir de shippingMethod.
export const ShippingMethodStep = ({ countryCode, stateProvince, subtotal, currency, hasAddress, value, onSelect }) => {
  const [state, setState] = useState({ loading: false, options: [], zoneName: "", error: null });

  useEffect(() => {
    if (!hasAddress || !stateProvince) {
      setState({ loading: false, options: [], zoneName: "", error: null });
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      quoteShipping({ countryCode, stateProvince, subtotal, currency })
        .then((res) => {
          if (cancelled) return;
          setState({ loading: false, options: res.options, zoneName: res.zoneName, error: null });
          const stillValid = res.options.some((o) => o.method === value?.method);
          if (!stillValid) onSelect(res.options[0] || null);
        })
        .catch((e) => {
          if (cancelled) return;
          const message = e instanceof ApiError ? e.message : "No pudimos cotizar el envío. Intenta de nuevo.";
          setState({ loading: false, options: [], zoneName: "", error: { code: e instanceof ApiError ? e.code : null, message } });
          onSelect(null);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, stateProvince, subtotal, currency, hasAddress]);

  if (!hasAddress) {
    return (
      <div>
        <div className="eyebrow" style={fieldLabelStyle}>Método de envío</div>
        <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>
          Ingresa tu dirección de envío para ver los métodos disponibles.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="eyebrow" style={fieldLabelStyle}>Método de envío</div>

      {state.loading && <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>Cotizando envío…</p>}

      {state.error && (
        <div
          role="alert"
          style={{ background: "rgba(156,74,74,.08)", border: "1px solid rgba(156,74,74,.3)", borderRadius: 14, padding: "12px 18px", fontSize: 13, color: "#7A3535" }}
        >
          {state.error.code === "NO_SHIPPING_COVERAGE"
            ? "No hacemos envíos a esa dirección todavía."
            : state.error.message}
        </div>
      )}

      {!state.loading && !state.error && state.options.length > 0 && (
        <div style={optionCardStyle}>
          {state.options.map((opt, i) => (
            <label key={opt.method} style={optionRowStyle(value?.method === opt.method, i === state.options.length - 1)}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  type="radio"
                  name="shippingMethod"
                  checked={value?.method === opt.method}
                  onChange={() => onSelect(opt)}
                  style={{ accentColor: "var(--botanic-deep)" }}
                />
                <span>
                  <div style={{ fontSize: 13.5 }}>{opt.label}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                    {opt.estimatedMinDays === opt.estimatedMaxDays
                      ? `${opt.estimatedMinDays} día${opt.estimatedMinDays === 1 ? "" : "s"}`
                      : `${opt.estimatedMinDays}-${opt.estimatedMaxDays} días`}
                  </div>
                </span>
              </span>
              <span className="display" style={{ fontSize: 15 }}>
                {opt.freeShippingApplied || opt.cost === 0 ? "Gratis" : formatCurrency(opt.cost)}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};
