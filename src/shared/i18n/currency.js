// Utilidad centralizada de formato de moneda (ver CLAUDE.md > Internacionalización).
// El catálogo/carrito/pedidos devuelven los montos siempre en la moneda base (COP) —
// GET /localization/currencies trae, junto a cada moneda no base, un `rate` que el
// propio backend describe como "solo para mostrar un precio estimado en pantalla"
// (el cobro real se congela en el checkout con la tasa vigente en ese momento, no con
// esta). O sea: la conversión a la moneda elegida es responsabilidad del frontend acá,
// multiplicando por ese rate — no hay ningún endpoint que ya devuelva el monto convertido.
const LOCALE_BY_UI_LANG = { es: "es-CO", en: "en-US" };
const ZERO_DECIMAL_CURRENCIES = new Set(["COP", "JPY", "KRW"]);

// LocalizationContext llama a esto apenas resuelve GET /currencies, para que
// formatCurrency (llamado desde componentes sueltos, sin acceso al context) pueda
// convertir sin tener que hilar el rate a mano por cada prop.
let currencyRates = { COP: 1 };
export function setCurrencyRates(currencies) {
  currencyRates = Object.fromEntries(currencies.map((c) => [c.code, c.rate]));
}

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function formatCurrency(amount, { currency, locale } = {}) {
  const resolvedCurrency = currency || readCookie("currency") || "COP";
  const uiLang = locale || readCookie("locale") || "es";
  const resolvedLocale = LOCALE_BY_UI_LANG[uiLang] || "es-CO";
  const rate = currencyRates[resolvedCurrency] ?? 1;
  const maximumFractionDigits = ZERO_DECIMAL_CURRENCIES.has(resolvedCurrency) ? 0 : 2;
  return new Intl.NumberFormat(resolvedLocale, {
    style: "currency",
    currency: resolvedCurrency,
    maximumFractionDigits,
  }).format(amount * rate);
}
