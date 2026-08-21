import { request } from "./http";

export function listWishlist({ page, limit } = {}, accessToken) {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  const qs = params.toString();
  return request(`/wishlist${qs ? `?${qs}` : ""}`, { token: accessToken });
}

export function addToWishlist(productId, accessToken) {
  return request("/wishlist/items", {
    method: "POST",
    body: { productId },
    token: accessToken,
  });
}

export function removeFromWishlist(productId, accessToken) {
  return request(`/wishlist/items/${productId}`, {
    method: "DELETE",
    token: accessToken,
  });
}
