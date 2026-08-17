// Lista única de países soportados en el frontend, con las reglas de formato que
// hoy se usan para validar en cliente: teléfono (features/profile) y código postal
// (features/profile/components/addresses). Vive en shared/ porque ambas features la
// necesitan — antes estaba duplicada en features/profile/data/countries.js.
// Simplificado a propósito: "N dígitos exactos" para teléfono y una regex simple por
// país para el código postal. Las reglas reales (rangos por operador, validación
// postal contra un servicio real, etc.) viven en el backend cuando exista.
export const COUNTRIES = [
  { code: "CO", name: "Colombia", dialCode: "+57", phoneDigits: 10, postalCodeRegex: /^\d{6}$/, postalCodeExample: "110111" },
  { code: "MX", name: "México", dialCode: "+52", phoneDigits: 10, postalCodeRegex: /^\d{5}$/, postalCodeExample: "01000" },
  { code: "AR", name: "Argentina", dialCode: "+54", phoneDigits: 10, postalCodeRegex: /^\d{4}$/, postalCodeExample: "1000" },
  { code: "CL", name: "Chile", dialCode: "+56", phoneDigits: 9, postalCodeRegex: /^\d{7}$/, postalCodeExample: "8320000" },
  { code: "PE", name: "Perú", dialCode: "+51", phoneDigits: 9, postalCodeRegex: /^\d{5}$/, postalCodeExample: "15001" },
  { code: "EC", name: "Ecuador", dialCode: "+593", phoneDigits: 9, postalCodeRegex: /^\d{6}$/, postalCodeExample: "170150" },
  { code: "ES", name: "España", dialCode: "+34", phoneDigits: 9, postalCodeRegex: /^\d{5}$/, postalCodeExample: "28001" },
  { code: "US", name: "Estados Unidos", dialCode: "+1", phoneDigits: 10, postalCodeRegex: /^\d{5}(-\d{4})?$/, postalCodeExample: "10001" },
];

// El backend devuelve los teléfonos normalizados en E.164 (ej. "+573001234567"); la UI
// solo maneja dígitos nacionales + un selector de país aparte, así que hace falta
// despojar el dial code de vuelta antes de guardarlo en el estado local de un formulario
// (usado por profile y por addresses, cada uno contra su propio countryCode).
export function stripDialCode(e164Phone, countryCode) {
  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
  return e164Phone?.startsWith(country.dialCode) ? e164Phone.slice(country.dialCode.length) : e164Phone || "";
}
