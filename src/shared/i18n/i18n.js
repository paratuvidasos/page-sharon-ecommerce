// Diccionario estático ES/EN del storefront + admin (textos escritos a mano en el
// código, ej. "Comprar ahora", "Envío gratis") — no confundir con las traducciones de
// producto (name/description), esas SÍ vienen del backend según el `?lang` pedido
// (ver shared/api-client/catalog.js). LocalizationContext es quien decide qué idioma
// mostrar (cookie/cuenta real) y llama a i18n.changeLanguage(locale) — este archivo
// solo registra los diccionarios y arranca la instancia, nunca decide el idioma activo.
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import commonEs from "./locales/es/common.json";
import navEs from "./locales/es/nav.json";
import homeEs from "./locales/es/home.json";
import catalogEs from "./locales/es/catalog.json";
import cartEs from "./locales/es/cart.json";
import checkoutEs from "./locales/es/checkout.json";
import authEs from "./locales/es/auth.json";
import profileEs from "./locales/es/profile.json";
import ordersEs from "./locales/es/orders.json";
import notificationsEs from "./locales/es/notifications.json";
import wishlistEs from "./locales/es/wishlist.json";
import adminEs from "./locales/es/admin.json";

import commonEn from "./locales/en/common.json";
import navEn from "./locales/en/nav.json";
import homeEn from "./locales/en/home.json";
import catalogEn from "./locales/en/catalog.json";
import cartEn from "./locales/en/cart.json";
import checkoutEn from "./locales/en/checkout.json";
import authEn from "./locales/en/auth.json";
import profileEn from "./locales/en/profile.json";
import ordersEn from "./locales/en/orders.json";
import notificationsEn from "./locales/en/notifications.json";
import wishlistEn from "./locales/en/wishlist.json";
import adminEn from "./locales/en/admin.json";

export const NAMESPACES = [
  "common",
  "nav",
  "home",
  "catalog",
  "cart",
  "checkout",
  "auth",
  "profile",
  "orders",
  "notifications",
  "wishlist",
  "admin",
];

function readCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

i18n.use(initReactI18next).init({
  resources: {
    es: {
      common: commonEs,
      nav: navEs,
      home: homeEs,
      catalog: catalogEs,
      cart: cartEs,
      checkout: checkoutEs,
      auth: authEs,
      profile: profileEs,
      orders: ordersEs,
      notifications: notificationsEs,
      wishlist: wishlistEs,
      admin: adminEs,
    },
    en: {
      common: commonEn,
      nav: navEn,
      home: homeEn,
      catalog: catalogEn,
      cart: cartEn,
      checkout: checkoutEn,
      auth: authEn,
      profile: profileEn,
      orders: ordersEn,
      notifications: notificationsEn,
      wishlist: wishlistEn,
      admin: adminEn,
    },
  },
  lng: readCookie("locale") || "es",
  fallbackLng: "es",
  ns: NAMESPACES,
  defaultNS: "common",
  interpolation: { escapeValue: false },
  returnEmptyString: false,
});

export default i18n;
