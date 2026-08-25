import { request } from "./http";

// countryCode es obligatorio; hay que mandar al menos uno de stateProvince/postalCode.
// items (variantId + quantity) es opcional pero recomendado: sin eso el backend solo
// cotiza con la tarifa de respaldo (source: "FALLBACK") en vez de la transportadora real.
export const quoteShipping = ({ countryCode, stateProvince, postalCode, subtotal, currency, items }, accessToken) =>
  request("/shipping/quote", {
    method: "POST",
    body: { countryCode, stateProvince, postalCode, subtotal, currency, items },
    token: accessToken,
  });

// Público, sin token: lista los destinos con cobertura para no ofrecer países/estados
// que después el quote va a rechazar con 422 NO_SHIPPING_COVERAGE.
export const getShippingCoverage = () => request("/shipping/coverage");
