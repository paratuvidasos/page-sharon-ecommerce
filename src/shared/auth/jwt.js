// Decodifica el payload de un JWT sin verificarlo (la verificación de firma es del
// backend) — solo para leer claims públicos como `role` en el cliente. Sin librería
// nueva: es un base64url decode del segundo segmento del token.
export function parseJwt(token) {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}
