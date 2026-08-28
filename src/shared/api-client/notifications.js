import { request } from "./http";

// Todo bajo /notifications requiere sesión — no hay buzón para invitados (los pedidos
// de invitado solo notifican por correo, ver CLAUDE.md).
export function listNotifications({ page, limit, unreadOnly } = {}, accessToken) {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  if (unreadOnly) params.set("unreadOnly", "true");
  const qs = params.toString();
  return request(`/notifications${qs ? `?${qs}` : ""}`, { token: accessToken });
}

export const getUnreadNotificationCount = (accessToken) =>
  request("/notifications/unread-count", { token: accessToken });

export const markNotificationRead = (id, accessToken) =>
  request(`/notifications/${id}/read`, { method: "PATCH", token: accessToken });

export const markAllNotificationsRead = (accessToken) =>
  request("/notifications/read-all", { method: "POST", token: accessToken });

export const getNotificationPreferences = (accessToken) =>
  request("/notifications/preferences", { token: accessToken });

export const updateNotificationPreferences = ({ emailEnabled, inAppEnabled }, accessToken) =>
  request("/notifications/preferences", {
    method: "PUT",
    body: { emailEnabled, inAppEnabled },
    token: accessToken,
  });
