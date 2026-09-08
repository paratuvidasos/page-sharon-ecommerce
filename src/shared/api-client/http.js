// Único punto de llamadas HTTP al backend (ver CLAUDE.md > Reglas de arquitectura #1).
// Ningún componente hace fetch directo a la API — todo pasa por request() o por
// las funciones tipadas de cada recurso (ej. accounts.js).

//export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || "Error de la API");
    this.status = status;
    this.code = body?.error;
    this.issues = body?.issues;
    this.availableQuantity = body?.availableQuantity;
    // CHECKOUT_PRICE_CHANGED / CHECKOUT_ITEM_UNAVAILABLE (POST /orders/checkout) traen
    // las líneas afectadas acá, con previousUnitPrice/currentUnitPrice o availableQuantity.
    this.lines = body?.lines;
    // PRODUCTS_RESTRICTED_FOR_ZONE (POST /orders/checkout) y la respuesta de
    // POST /shipping/quote traen acá los productos que no se pueden enviar a la zona.
    this.restrictedProducts = body?.restrictedProducts;
  }
}

export async function request(path, { method = "GET", body, token } = {}) {
  const isFormData = body instanceof FormData;
  const headers = {};
  if (body && !isFormData) headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: Object.keys(headers).length ? headers : undefined,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}
