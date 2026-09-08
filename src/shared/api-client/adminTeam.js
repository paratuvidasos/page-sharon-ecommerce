import { request } from "./http";

export function listEmployees({ page, limit, search } = {}, accessToken) {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  if (search) params.set("search", search);
  const qs = params.toString();
  return request(`/admin/employees${qs ? `?${qs}` : ""}`, { token: accessToken });
}

export function createEmployee(payload, accessToken) {
  return request("/admin/employees", { method: "POST", body: payload, token: accessToken });
}

export function updateEmployee(id, payload, accessToken) {
  return request(`/admin/employees/${id}`, { method: "PATCH", body: payload, token: accessToken });
}

export function deleteEmployee(id, accessToken) {
  return request(`/admin/employees/${id}`, { method: "DELETE", token: accessToken });
}
