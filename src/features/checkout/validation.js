import { COUNTRIES } from "@shared/data/countries";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /(?=.*[A-Za-z])(?=.*\d).{8,}/;

export function validateGuestEmail(value) {
  if (!value.trim()) return "Necesitamos tu correo para confirmarte el pedido.";
  if (!EMAIL_RE.test(value.trim())) return "Ese correo no parece válido, revisa el formato.";
  return "";
}
export function validateRecipientName(value) {
  if (!value.trim()) return "Necesitamos el nombre de quien recibe.";
  return "";
}
export function validatePhone(value, countryCode) {
  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
  if (!value) return "Ingresa un teléfono de contacto.";
  if (value.length !== country.phoneDigits) return `Debe tener ${country.phoneDigits} dígitos para ${country.name}.`;
  return "";
}
export function validateStreetLine1(value) {
  if (!value.trim()) return "Necesitamos la dirección.";
  if (value.trim().length < 5) return "Agrega un poco más de detalle a la dirección.";
  return "";
}
export function validateStateProvince(value) {
  if (!value.trim()) return "Necesitamos el departamento o estado.";
  return "";
}
export function validateCity(value) {
  if (!value.trim()) return "Necesitamos la ciudad.";
  return "";
}
export function validatePostalCode(value, countryCode) {
  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
  if (!value.trim()) return "Necesitamos el código postal.";
  if (!country.postalCodeRegex.test(value.trim())) {
    return `Formato inválido para ${country.name} (ej. ${country.postalCodeExample}).`;
  }
  return "";
}
export function validateFirstName(value) {
  if (!value.trim()) return "Ingresa tu nombre.";
  return "";
}
export function validateLastName(value) {
  if (!value.trim()) return "Ingresa tu apellido.";
  return "";
}
export function validatePassword(value) {
  if (!value) return "Elige una contraseña.";
  if (!PASSWORD_RE.test(value)) return "Necesita al menos 8 caracteres, con una letra y un número.";
  return "";
}

export function validateAddressFields({ recipientName, phone, countryCode, streetLine1, stateProvince, city, postalCode }) {
  return {
    recipientName: validateRecipientName(recipientName),
    phone: validatePhone(phone, countryCode),
    streetLine1: validateStreetLine1(streetLine1),
    stateProvince: validateStateProvince(stateProvince),
    city: validateCity(city),
    postalCode: validatePostalCode(postalCode, countryCode),
  };
}
