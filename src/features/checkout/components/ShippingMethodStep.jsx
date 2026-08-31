import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { quoteShipping, ApiError } from "@shared/api-client";
import { formatCurrency } from "@shared/i18n/currency";
import { fieldLabelStyle, optionCardStyle, optionRowStyle } from "../fieldStyles";

// Cotiza el envío contra el backend (POST /shipping/quote) cada vez que cambia la
// dirección, el subtotal (aplicar un cupón cambia el subtotal y puede activar envío
// gratis) o el carrito. El costo mostrado acá es solo informativo — lo que de verdad se
// cobra lo recalcula el backend en POST /orders/checkout a partir de shippingMethod.
// `items` (variantId + quantity) se manda siempre que haya carrito: sin eso el backend
// solo devuelve la tarifa de respaldo en vez de cotizar con la transportadora real.
export const ShippingMethodStep = ({ countryCode, stateProvince, postalCode, subtotal, currency, items, hasAddress, value, onSelect }) => {
  const { t } = useTranslation("checkout");
  const [state, setState] = useState({ loading: false, options: [], zoneName: "", restrictedProducts: [], error: null });

  useEffect(() => {
    if (!hasAddress || (!stateProvince && !postalCode)) {
      setState({ loading: false, options: [], zoneName: "", restrictedProducts: [], error: null });
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      quoteShipping({ countryCode, stateProvince, postalCode, subtotal, currency, items })
        .then((res) => {
          if (cancelled) return;
          // Envío exprés fuera de servicio por ahora: la transportadora real todavía
          // no está definida (ver CARRIER_* en .env.example) y el tiempo 1-2 días de
          // la tarifa de respaldo no es un compromiso real, así que se oculta la opción
          // en vez de mostrar una promesa que no se puede cumplir.
          const options = res.options.filter((o) => o.method !== "EXPRESS");
          setState({ loading: false, options, zoneName: res.zoneName, restrictedProducts: res.restrictedProducts || [], error: null });
          const stillValid = options.some((o) => o.method === value?.method);
          if (!stillValid) onSelect(options[0] || null);
        })
        .catch((e) => {
          if (cancelled) return;
          const message = e instanceof ApiError ? e.message : t("shippingMethodStep.genericError");
          setState({ loading: false, options: [], zoneName: "", restrictedProducts: [], error: { code: e instanceof ApiError ? e.code : null, message } });
          onSelect(null);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryCode, stateProvince, postalCode, subtotal, currency, items, hasAddress]);

  if (!hasAddress) {
    return (
      <div>
        <div className="eyebrow" style={fieldLabelStyle}>{t("shippingMethodStep.title")}</div>
        <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>
          {t("shippingMethodStep.noAddress")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="eyebrow" style={fieldLabelStyle}>{t("shippingMethodStep.title")}</div>

      {state.loading && <p style={{ fontSize: 13, color: "var(--ink-soft)" }}>{t("shippingMethodStep.loading")}</p>}

      {state.error && (
        <div
          role="alert"
          style={{ background: "rgba(156,74,74,.08)", border: "1px solid rgba(156,74,74,.3)", borderRadius: 14, padding: "12px 18px", fontSize: 13, color: "#7A3535" }}
        >
          {state.error.code === "NO_SHIPPING_COVERAGE"
            ? t("shippingMethodStep.noShippingCoverage")
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
                  <div style={{ fontSize: 13.5 }}>
                    {opt.label}
                    {opt.source === "CARRIER" && opt.carrierName && (
                      <span style={{ color: "var(--ink-soft)" }}> · {opt.carrierName}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                    {opt.estimatedMinDays === opt.estimatedMaxDays
                      ? t("shippingMethodStep.days", { count: opt.estimatedMinDays })
                      : t("shippingMethodStep.daysRange", { min: opt.estimatedMinDays, max: opt.estimatedMaxDays })}
                  </div>
                </span>
              </span>
              <span className="display" style={{ fontSize: 15 }}>
                {opt.freeShippingApplied || opt.cost === 0 ? t("shippingMethodStep.free") : formatCurrency(opt.cost)}
              </span>
            </label>
          ))}
        </div>
      )}

      {!state.loading && state.restrictedProducts.length > 0 && (
        <div
          role="alert"
          style={{ background: "rgba(201,168,118,.14)", border: "1px solid rgba(201,168,118,.4)", borderRadius: 14, padding: "12px 18px", fontSize: 12.5, color: "#7A5E2E", marginTop: 10 }}
        >
          <div style={{ fontWeight: 600, marginBottom: 4 }}>{t("shippingMethodStep.restrictedTitle")}</div>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {state.restrictedProducts.map((p) => (
              <li key={p.productId}>{p.reason}</li>
            ))}
          </ul>
          <div style={{ marginTop: 4 }}>{t("shippingMethodStep.restrictedHint")}</div>
        </div>
      )}
    </div>
  );
};
