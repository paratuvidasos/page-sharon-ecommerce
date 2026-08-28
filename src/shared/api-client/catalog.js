import { request } from "./http";

function paginationParams({ page, limit } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  return params;
}

export function listProducts({ page, limit, categoryId, hairType, line, ingredient, priceMin, priceMax, sort } = {}) {
  const params = paginationParams({ page, limit });
  if (categoryId) params.set("categoryId", categoryId);
  if (hairType) params.set("hairType", hairType);
  if (line) params.set("line", line);
  if (ingredient) params.set("ingredient", ingredient);
  if (priceMin != null) params.set("priceMin", priceMin);
  if (priceMax != null) params.set("priceMax", priceMax);
  if (sort) params.set("sort", sort);
  const qs = params.toString();
  return request(`/products${qs ? `?${qs}` : ""}`);
}

export function getProductFilters({ categoryId } = {}) {
  const params = new URLSearchParams();
  if (categoryId) params.set("categoryId", categoryId);
  const qs = params.toString();
  return request(`/products/filters${qs ? `?${qs}` : ""}`);
}

export function getProduct(slug) {
  return request(`/products/${encodeURIComponent(slug)}`);
}

export function getRelatedProducts(slug) {
  return request(`/products/${encodeURIComponent(slug)}/related`);
}

export function getFeaturedProducts() {
  return request("/products/featured");
}

export function searchProducts(q, { page, limit } = {}) {
  const params = paginationParams({ page, limit });
  params.set("q", q);
  return request(`/products/search?${params.toString()}`);
}

export function getSearchSuggestions(q) {
  const params = new URLSearchParams({ q });
  return request(`/products/search/suggestions?${params.toString()}`);
}

export function listCategories({ page, limit } = {}) {
  const qs = paginationParams({ page, limit }).toString();
  return request(`/categories${qs ? `?${qs}` : ""}`);
}

export function listReviews(productId, { sort, page, limit } = {}) {
  const params = paginationParams({ page, limit });
  if (sort) params.set("sort", sort);
  const qs = params.toString();
  return request(`/products/${productId}/reviews${qs ? `?${qs}` : ""}`);
}

export function createReview(productId, { rating, comment }, accessToken) {
  return request(`/products/${productId}/reviews`, {
    method: "POST",
    body: { rating, comment },
    token: accessToken,
  });
}

export function setProductFeatured(productId, isFeatured, accessToken) {
  return request(`/admin/products/${productId}/featured`, {
    method: "PATCH",
    body: { isFeatured },
    token: accessToken,
  });
}
