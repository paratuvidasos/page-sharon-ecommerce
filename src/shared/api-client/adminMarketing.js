import { request, BASE_URL, ApiError } from "./http";

// Banners de home, configuración de destacados y reportes de ventas.

// --- Banners ---

// Sin paginar, incluye inactivos/programados (a diferencia de GET /banners público).
export function listBanners(accessToken) {
  return request("/admin/banners", { token: accessToken });
}

export function createBanner(payload, accessToken) {
  return request("/admin/banners", { method: "POST", body: payload, token: accessToken });
}

export function updateBanner(id, payload, accessToken) {
  return request(`/admin/banners/${id}`, { method: "PATCH", body: payload, token: accessToken });
}

export function deleteBanner(id, accessToken) {
  return request(`/admin/banners/${id}`, { method: "DELETE", token: accessToken });
}

// bannerIds: arreglo ORDENADO COMPLETO (lo que produce mover con los botones subir/
// bajar) — define sortOrder por posición.
export function reorderBanners(bannerIds, accessToken) {
  return request("/admin/banners/order", { method: "PUT", body: { bannerIds }, token: accessToken });
}

export function uploadBannerImage(file, accessToken) {
  const formData = new FormData();
  formData.append("image", file);
  return request("/admin/banners/upload-image", { method: "POST", body: formData, token: accessToken });
}

// --- Destacados de home ---

export function getFeaturedConfig(accessToken) {
  return request("/admin/homepage/featured-config", { token: accessToken });
}

export function setFeaturedConfig(payload, accessToken) {
  return request("/admin/homepage/featured-config", { method: "PUT", body: payload, token: accessToken });
}

// --- Reportes de ventas ---

export function getSalesReport({ dateFrom, dateTo }, accessToken) {
  const params = new URLSearchParams({ dateFrom, dateTo });
  return request(`/admin/reports/sales?${params.toString()}`, { token: accessToken });
}

// El export es una descarga de archivo (Content-Type: text/csv), no JSON — no puede
// pasar por request() (que siempre hace res.json()). Dispara la descarga vía un <a>
// temporal con un blob URL, como cualquier descarga de archivo del navegador.
export async function downloadSalesReportCsv({ dateFrom, dateTo }, accessToken, filename = "reporte-ventas.csv") {
  const params = new URLSearchParams({ dateFrom, dateTo });
  const res = await fetch(`${BASE_URL}/admin/reports/sales/export?${params.toString()}`, {
    credentials: "include",
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(res.status, data);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
