import { request } from "./http";

export function listOrders({ status, dateFrom, dateTo, page, limit } = {}, accessToken) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  const qs = params.toString();
  return request(`/orders${qs ? `?${qs}` : ""}`, { token: accessToken });
}

// [0011][BE] Checkout como invitado: auth opcional (con token asocia el pedido al
// usuario logueado y omite guestEmail/createAccount; sin token es invitado y
// guestEmail es obligatorio). No hay módulo de carrito en el backend todavía, así
// que el cliente arma `items` completo desde su carrito local en cada llamada.
export function checkout(payload, accessToken) {
  return request("/orders/checkout", {
    method: "POST",
    body: payload,
    token: accessToken,
  });
}

// [checkout Bold] El pedido queda en PENDING hasta que Bold confirme el pago (webhook
// o retorno del usuario) — la pantalla de resultado usa esto para hacer polling. Como
// invitado, el backend exige ?email= porque no hay sesión que valide la dueñez del pedido.
export function getOrder(orderNumber, { email } = {}, accessToken) {
  const qs = email ? `?email=${encodeURIComponent(email)}` : "";
  return request(`/orders/${orderNumber}${qs}`, { token: accessToken });
}

// Reintento de pago tras un rechazo: el orderNumber no cambia, pero Bold exige una
// referenceId nueva (no acepta referencias repetidas), así que el backend genera una
// sesión de pago nueva en la respuesta.
export function retryPayment(orderNumber, payload, accessToken) {
  return request(`/orders/${orderNumber}/retry-payment`, {
    method: "POST",
    body: payload,
    token: accessToken,
  });
}
