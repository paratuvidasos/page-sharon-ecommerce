import { request } from "./http";

function paginationParams({ page, limit } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  return params;
}

export function listAdminReviews({ page, limit, status } = {}, accessToken) {
  const params = paginationParams({ page, limit });
  if (status) params.set("status", status);
  const qs = params.toString();
  return request(`/admin/reviews${qs ? `?${qs}` : ""}`, { token: accessToken });
}

export function approveReview(id, accessToken) {
  return request(`/admin/reviews/${id}/approve`, { method: "PATCH", token: accessToken });
}

// Notifica al cliente por correo (del lado del backend).
export function rejectReview(id, reason, accessToken) {
  return request(`/admin/reviews/${id}/reject`, { method: "PATCH", body: { reason }, token: accessToken });
}

// Solo válido sobre una reseña APPROVED.
export function hideReview(id, accessToken) {
  return request(`/admin/reviews/${id}/hide`, { method: "PATCH", token: accessToken });
}
