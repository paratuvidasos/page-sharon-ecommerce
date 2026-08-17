// Único punto de llamadas HTTP al backend (ver CLAUDE.md > Reglas de arquitectura #1).
// Ningún componente hace fetch directo a la API — todo pasa por request() o por
// las funciones tipadas de cada recurso (ej. accounts.js).
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || "Error de la API");
    this.status = status;
    this.code = body?.error;
    this.issues = body?.issues;
  }
}

export async function request(path, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, data);
  return data;
}
