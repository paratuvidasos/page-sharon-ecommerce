// Códigos de país + longitud esperada del número local, para validar el teléfono
// del perfil en cliente. Simplificado a "N dígitos exactos" a propósito: las reglas
// reales de numeración (rangos por operador, números fijos vs. móviles, etc.) viven
// en el backend/proveedor de verificación cuando exista, esto es solo una guía en UI.
export const COUNTRIES = [
  { code: "CO", name: "Colombia", dialCode: "+57", digits: 10 },
  { code: "MX", name: "México", dialCode: "+52", digits: 10 },
  { code: "AR", name: "Argentina", dialCode: "+54", digits: 10 },
  { code: "CL", name: "Chile", dialCode: "+56", digits: 9 },
  { code: "PE", name: "Perú", dialCode: "+51", digits: 9 },
  { code: "EC", name: "Ecuador", dialCode: "+593", digits: 9 },
  { code: "ES", name: "España", dialCode: "+34", digits: 9 },
  { code: "US", name: "Estados Unidos", dialCode: "+1", digits: 10 },
];
