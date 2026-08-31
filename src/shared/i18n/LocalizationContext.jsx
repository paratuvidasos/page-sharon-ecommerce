import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getLocales, getCurrencies, getLocalizationPreferences, updateLocalizationPreferences } from "@shared/api-client";
import { useAuth } from "@shared/auth/AuthContext";
import { setCurrencyRates } from "./currency";
import i18n from "./i18n";

const LocalizationContext = createContext(null);

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

// Igual que AuthContext hidrata el perfil real después de mostrar lo que ya había
// en memoria, acá se pinta primero lo que digan las cookies `locale`/`currency`
// (si ya existen, evita un parpadeo mientras resuelve el GET) y se confirma/corrige
// con GET /localization/preferences, que además resuelve GeoIP/Accept-Language la
// primera vez que un visitante llega sin cookie.
export function LocalizationProvider({ children }) {
  const { getAccessToken } = useAuth();
  const [locale, setLocaleState] = useState(() => readCookie("locale") || "es");
  const [currency, setCurrencyState] = useState(() => readCookie("currency") || "COP");
  const [locales, setLocales] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [detectedCountry, setDetectedCountry] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getLocales(), getCurrencies(), getLocalizationPreferences()])
      .then(([localesRes, currenciesRes, prefs]) => {
        if (cancelled) return;
        setLocales(localesRes.locales);
        setCurrencies(currenciesRes.currencies);
        setCurrencyRates(currenciesRes.currencies);
        setLocaleState(prefs.locale);
        setCurrencyState(prefs.currency);
        setDetectedCountry(prefs.detectedCountry ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // i18n.js ya arranca con el idioma de la cookie (sin parpadeo en el primer
  // render), pero cuando GET /preferences resuelve un idioma distinto (ej. visitante
  // sin cookie, detectado por GeoIP/Accept-Language) hay que avisarle a i18next sin
  // esperar el reload — a diferencia de currency/locale como preferencia de API, acá
  // no hace falta recargar la página porque el diccionario estático ya está cargado
  // en memoria para los dos idiomas.
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  // El backend confirma la elección con Set-Cookie en la respuesta del PUT (o la
  // guarda en la cuenta si hay sesión) — recargar es la forma más simple de que
  // todo lo que ya se pidió con el idioma/moneda viejos (catálogo, carrito,
  // pedidos) vuelva a pedirse con la cookie nueva, en vez de mantener en el
  // cliente una copia de qué endpoints hay que refrescar a mano.
  const applyPreferences = useCallback(
    async (patch) => {
      await updateLocalizationPreferences(patch, getAccessToken());
      window.location.reload();
    },
    [getAccessToken]
  );

  const setLocale = useCallback((next) => applyPreferences({ locale: next }), [applyPreferences]);
  const setCurrency = useCallback((next) => applyPreferences({ currency: next }), [applyPreferences]);

  const value = {
    locale,
    currency,
    locales,
    currencies,
    detectedCountry,
    ready,
    setLocale,
    setCurrency,
  };

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  const ctx = useContext(LocalizationContext);
  if (!ctx) throw new Error("useLocalization debe usarse dentro de <LocalizationProvider>");
  return ctx;
}
