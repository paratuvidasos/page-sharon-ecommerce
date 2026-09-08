const ENV_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const ENV_API_PROCESS_URL = process.env.VITE_API_BASE_URL;
export const BASE_URL = (ENV_API_BASE_URL || "http://localhost:3000/api/v1").replace(/\/$/, "");
console.log("ENV_API_BASE_URL", ENV_API_BASE_URL);
console.log("ENV_API_PROCESS_URL", ENV_API_PROCESS_URL);
console.log("BASE_URL", BASE_URL);
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
