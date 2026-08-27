import { request } from "./http";

// Gestión de catálogo del panel admin: categorías, atributos, productos+variantes+
// imágenes e inventario. Ver shared-api-client/admin.js para pedidos/cupones/envío.

function paginationParams({ page, limit } = {}) {
  const params = new URLSearchParams();
  if (page) params.set("page", page);
  if (limit) params.set("limit", limit);
  return params;
}

// --- Categorías ---

export function listAdminCategories({ page, limit } = {}, accessToken) {
  const qs = paginationParams({ page, limit }).toString();
  return request(`/admin/categories${qs ? `?${qs}` : ""}`, { token: accessToken });
}

export function createCategory(payload, accessToken) {
  return request("/admin/categories", { method: "POST", body: payload, token: accessToken });
}

export function updateCategory(id, payload, accessToken) {
  return request(`/admin/categories/${id}`, { method: "PATCH", body: payload, token: accessToken });
}

// 409 si tiene productos ACTIVE asociados — el llamador debe mostrar ese error tal
// cual (reasignar productos es responsabilidad del admin, editando cada producto).
export function deleteCategory(id, accessToken) {
  return request(`/admin/categories/${id}`, { method: "DELETE", token: accessToken });
}

// --- Atributos (catálogo chico, sin paginar) ---

export function listAttributes(accessToken) {
  return request("/admin/attributes", { token: accessToken });
}

export function createAttribute(payload, accessToken) {
  return request("/admin/attributes", { method: "POST", body: payload, token: accessToken });
}

// `key` es inmutable — no se manda en el payload de edición.
export function updateAttribute(id, payload, accessToken) {
  return request(`/admin/attributes/${id}`, { method: "PATCH", body: payload, token: accessToken });
}

export function deleteAttribute(id, accessToken) {
  return request(`/admin/attributes/${id}`, { method: "DELETE", token: accessToken });
}

// --- Productos y variantes ---

export function createProduct(payload, accessToken) {
  return request("/admin/products", { method: "POST", body: payload, token: accessToken });
}

export function updateProduct(id, payload, accessToken) {
  return request(`/admin/products/${id}`, { method: "PATCH", body: payload, token: accessToken });
}

// 200 {archived:boolean} — si tiene pedidos históricos se archiva en vez de borrarse.
export function deleteProduct(id, accessToken) {
  return request(`/admin/products/${id}`, { method: "DELETE", token: accessToken });
}

export function createProductVariant(productId, payload, accessToken) {
  return request(`/admin/products/${productId}/variants`, { method: "POST", body: payload, token: accessToken });
}

export function updateProductVariant(productId, variantId, payload, accessToken) {
  return request(`/admin/products/${productId}/variants/${variantId}`, { method: "PATCH", body: payload, token: accessToken });
}

// 409 si es la última variante del producto.
export function deleteProductVariant(productId, variantId, accessToken) {
  return request(`/admin/products/${productId}/variants/${variantId}`, { method: "DELETE", token: accessToken });
}

// multipart/form-data, campo "images" (hasta 10 archivos) — devuelve el arreglo
// COMPLETO de imágenes del producto (viejas + nuevas), no solo las subidas ahora.
export function uploadProductImages(productId, files, accessToken) {
  const formData = new FormData();
  [...files].forEach((file) => formData.append("images", file));
  return request(`/admin/products/${productId}/images`, {
    method: "POST",
    body: formData,
    token: accessToken,
  });
}

// --- Inventario ---

// sort: NAME_ASC (default) | NAME_DESC | STOCK_ASC (agotados primero) | STOCK_DESC.
// onlyLowStock: mismo criterio que antes (stock <= umbral, 5 por defecto) — ahora es
// un filtro opcional del listado general, no un endpoint aparte.
export function listInventory({ page, limit, search, categoryId, onlyLowStock, sort } = {}, accessToken) {
  const params = paginationParams({ page, limit });
  if (search) params.set("search", search);
  if (categoryId) params.set("categoryId", categoryId);
  if (onlyLowStock) params.set("onlyLowStock", "true");
  if (sort) params.set("sort", sort);
  const qs = params.toString();
  return request(`/admin/inventory${qs ? `?${qs}` : ""}`, { token: accessToken });
}

// SET absoluto de stock, no delta.
export function setVariantStock(productId, variantId, quantity, accessToken) {
  return request(`/admin/products/${productId}/variants/${variantId}/stock`, {
    method: "PATCH",
    body: { quantity },
    token: accessToken,
  });
}

// threshold: number | null (null = usar el umbral global).
export function setVariantLowStockThreshold(productId, variantId, threshold, accessToken) {
  return request(`/admin/products/${productId}/variants/${variantId}/low-stock-threshold`, {
    method: "PATCH",
    body: { threshold },
    token: accessToken,
  });
}
