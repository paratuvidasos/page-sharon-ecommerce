import { request } from "./http";

export const getCart = (accessToken) => request("/cart", { token: accessToken });

export const addCartItem = ({ variantId, quantity }, accessToken) =>
  request("/cart/items", { method: "POST", body: { variantId, quantity }, token: accessToken });

export const updateCartItem = (itemId, { quantity }, accessToken) =>
  request(`/cart/items/${itemId}`, { method: "PATCH", body: { quantity }, token: accessToken });

export const removeCartItem = (itemId, accessToken) =>
  request(`/cart/items/${itemId}`, { method: "DELETE", token: accessToken });

export const clearCart = (accessToken) => request("/cart", { method: "DELETE", token: accessToken });

export const applyCoupon = (code, accessToken) =>
  request("/cart/coupon", { method: "POST", body: { code }, token: accessToken });

export const removeCoupon = (accessToken) => request("/cart/coupon", { method: "DELETE", token: accessToken });

export const mergeCart = (accessToken) => request("/cart/merge", { method: "POST", token: accessToken });
