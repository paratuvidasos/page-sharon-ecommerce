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
