import { request } from "./http";

// Endpoints reales del panel admin: pedidos, cupones y zonas de envío. Categorías/
// atributos/productos/inventario viven en adminCatalog.js, clientes en
// adminCustomers.js, reseñas en adminReviews.js, banners/destacados/reportes en
// adminMarketing.js — mismo criterio de reparto por dominio que catalog.js/orders.js.

function paginationParams({ page, limit } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  return params;
}

export function listAdminOrders({ page, limit, status, dateFrom, dateTo, paymentMethod, userId } = {}, accessToken) {
  const params = paginationParams({ page, limit });
  if (status) params.set("status", status);
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  if (paymentMethod) params.set("paymentMethod", paymentMethod);
  if (userId) params.set("userId", userId);
  const qs = params.toString();
  return request(`/admin/orders${qs ? `?${qs}` : ""}`, { token: accessToken });
}

export function getAdminOrder(orderNumber, accessToken) {
  return request(`/admin/orders/${orderNumber}`, { token: accessToken });
}

// status ahora acepta IN_PREPARATION|SHIPPED|DELIVERED|CANCELLED|REFUNDED. SHIPPED
// exige carrierCode/carrierName/trackingNumber; CANCELLED/REFUNDED exigen reason.
export function setOrderStatus(orderNumber, payload, accessToken) {
  return request(`/admin/orders/${orderNumber}/status`, {
    method: "PATCH",
    body: payload,
    token: accessToken,
  });
}

export function listCoupons({ page, limit } = {}, accessToken) {
  const qs = paginationParams({ page, limit }).toString();
  return request(`/admin/coupons${qs ? `?${qs}` : ""}`, { token: accessToken });
}

export function createCoupon(payload, accessToken) {
  return request("/admin/coupons", {
    method: "POST",
    body: payload,
    token: accessToken,
  });
}

// code y discountType son inmutables — no se mandan en el payload de edición.
export function updateCoupon(code, payload, accessToken) {
  return request(`/admin/coupons/${encodeURIComponent(code)}`, {
    method: "PATCH",
    body: payload,
    token: accessToken,
  });
}

export function listShippingZones(accessToken) {
  return request("/admin/shipping/zones", { token: accessToken });
}

export function getShippingZone(id, accessToken) {
  return request(`/admin/shipping/zones/${id}`, { token: accessToken });
}

export function createShippingZone(payload, accessToken) {
  return request("/admin/shipping/zones", {
    method: "POST",
    body: payload,
    token: accessToken,
  });
}

export function updateShippingZone(id, payload, accessToken) {
  return request(`/admin/shipping/zones/${id}`, {
    method: "PATCH",
    body: payload,
    token: accessToken,
  });
}

export function deleteShippingZone(id, accessToken) {
  return request(`/admin/shipping/zones/${id}`, {
    method: "DELETE",
    token: accessToken,
  });
}

export function setShippingZoneRestrictions(id, restrictedProductIds, accessToken) {
  return request(`/admin/shipping/zones/${id}/restrictions`, {
    method: "PUT",
    body: { restrictedProductIds },
    token: accessToken,
  });
}
