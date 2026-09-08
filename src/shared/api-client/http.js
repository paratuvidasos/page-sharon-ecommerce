// Único punto de llamadas HTTP al backend (ver CLAUDE.md > Reglas de arquitectura #1).
// Ningún componente hace fetch directo a la API — todo pasa por request() o por
// las funciones tipadas de cada recurso (ej. accounts.js).

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
export const BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || `Error de la API (${status})`);
    this.status = status;
    this.code = body?.error;
    this.issues = body?.issues;
    this.availableQuantity = body?.availableQuantity;
    this.lines = body?.lines;
    this.restrictedProducts = body?.restrictedProducts;
  }
}

export async function request(path, { method = "GET", body, token } = {}) {
  const isFormData = body instanceof FormData;
  const headers = {};
  if (body && !isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = `${BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: Object.keys(headers).length ? headers : undefined,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const contentType = res.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }

  if (data === null && res.status !== 204) {
    // Si respondió 200 pero devolvió HTML (ej. fallback de Nginx por URL de API incorrecta)
    throw new ApiError(res.status, {
      message: `La API no devolvió JSON válido. Verifica que VITE_API_BASE_URL esté apuntando correctamente al backend (actual: ${BASE_URL}).`,
    });
  }

  return data;
}
