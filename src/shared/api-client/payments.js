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

// Solo para el modo simulado (sin cuenta de Bold, ver SimulatedPaymentPanel.jsx):
// contrato best-effort, no documentado en el handoff — ajustar si el backend expone
// otro endpoint para marcar una orden simulada como pagada/rechazada.
export const simulatePaymentStatus = (referenceId, status, accessToken) =>
  request(`/payments/${referenceId}/status/simulate`, {
    method: "POST",
    body: { status },
    token: accessToken,
  });
