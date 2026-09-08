// Utilidad centralizada de formato de fecha (mismo criterio que formatCurrency en
// currency.js): sin esto, cada componente formateaba fechas con "es-CO" fijo, así
// que un pedido en inglés seguía mostrando "3 de septiembre de 2026" en vez de
// "September 3, 2026" — el idioma de la UI cambiaba, pero las fechas no.
const LOCALE_BY_UI_LANG = { es: "es-CO", en: "en-US" };

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function resolveLocale(locale) {
  const uiLang = locale || readCookie("locale") || "es";
  return LOCALE_BY_UI_LANG[uiLang] || "es-CO";
}

export function formatDate(isoDate, options = {}) {
  const { locale, ...dateTimeOptions } = options;
  return new Date(isoDate).toLocaleDateString(resolveLocale(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...dateTimeOptions,
  });
}

export function formatDateTime(isoDate, options = {}) {
  const { locale, ...dateTimeOptions } = options;
  return new Date(isoDate).toLocaleDateString(resolveLocale(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...dateTimeOptions,
  });
}
