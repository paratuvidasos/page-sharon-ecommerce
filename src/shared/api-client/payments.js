import { request } from "./http";

export const listPaymentMethods = ({ countryCode, currency }, accessToken) => {
  const params = new URLSearchParams();
  if (countryCode) params.set("countryCode", countryCode);
  if (currency) params.set("currency", currency);
  const qs = params.toString();
  return request(`/payments/methods${qs ? `?${qs}` : ""}`, { token: accessToken });
};

export const getPaymentStatus = (referenceId, accessToken) =>
  request(`/payments/${referenceId}/status`, { token: accessToken });

// Solo para el modo simulado (sin cuenta de Bold, ver SimulatedPaymentPanel.jsx).
// Endpoint fijo POST /payments/simulate — referenceId, outcome (y failureCode
// opcional) van en el body, no en el path.
export const simulatePaymentStatus = (referenceId, outcome, failureCode, accessToken) =>
  request(`/payments/simulate`, {
    method: "POST",
    body: { referenceId, outcome, ...(failureCode ? { failureCode } : {}) },
    token: accessToken,
  });
