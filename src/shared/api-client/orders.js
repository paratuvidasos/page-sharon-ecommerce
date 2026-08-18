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
