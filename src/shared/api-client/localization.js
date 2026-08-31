import { request } from "./http";

export function getLocales() {
  return request("/localization/locales");
}

export function getCurrencies() {
  return request("/localization/currencies");
}

export function getLocalizationPreferences() {
  return request("/localization/preferences");
}

// Sin sesión el backend guarda la elección en cookie (locale/currency, no httpOnly);
// con sesión la guarda en la cuenta — mismo endpoint, el token es opcional.
export function updateLocalizationPreferences({ locale, currency } = {}, accessToken) {
  return request("/localization/preferences", {
    method: "PUT",
    body: { locale, currency },
    token: accessToken,
  });
}
