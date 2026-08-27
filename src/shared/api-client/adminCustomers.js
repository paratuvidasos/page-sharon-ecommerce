import { request } from "./http";

function paginationParams({ page, limit } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  return params;
}

export function listCustomers({ page, limit, search, status } = {}, accessToken) {
  const params = paginationParams({ page, limit });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  const qs = params.toString();
  return request(`/admin/customers${qs ? `?${qs}` : ""}`, { token: accessToken });
}

// También cierra las sesiones activas del cliente (del lado del backend).
export function suspendCustomer(id, accessToken) {
  return request(`/admin/customers/${id}/suspend`, { method: "PATCH", token: accessToken });
}

export function reactivateCustomer(id, accessToken) {
  return request(`/admin/customers/${id}/reactivate`, { method: "PATCH", token: accessToken });
}
