import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "./Icon";
import { IconButton } from "./components/IconButton";
import { Z } from "./zIndex";
import { NotificationsBell } from "@features/notifications/components/NotificationsBell";
import { listProducts } from "@shared/api-client";
import { useAuth } from "@shared/auth/AuthContext";
import { useLocalization } from "@shared/i18n/LocalizationContext";

const LOCALE_LABELS = { es: "Español", en: "English" };

const SECTION_LINKS = [
  ["habits", "#beneficios"],
  ["results", "#antes-despues"],
  ["story", "#testimonios"],
];

const rowStyle = {
  display: "flex", alignItems: "center", gap: 10, padding: "14px",
  borderRadius: 14, textDecoration: "none", color: "var(--ink)",
  fontSize: 15, fontWeight: 500, background: "transparent",
};

// Menú de hamburguesa en móvil (mockup "Sharon Movil" 01·Landing): además de los
// links de siempre, aloja lo que en escritorio vive en el header (favoritos,
// notificaciones, cuenta) porque ahí ya no hay espacio para esos íconos — ver
// Nav.jsx .nav-icons-desktop, oculto bajo 900px. El carrito no vive acá: pasa a ser
// CartFab (botón flotante persistente), ver App.jsx.
export const MobileMenu = ({ open, onClose, user, wishlistCount, onOpenWishlist, onOpenProfile, onOpenAuth, onOpenOrder }) => {
  const { t } = useTranslation(["nav", "common"]);
  const { isAdmin } = useAuth();
  const { locale, currency, locales, currencies, setLocale, setCurrency } = useLocalization();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const [productCount, setProductCount] = useState(null);
  const [langPending, setLangPending] = useState(false);

  // Conteo real del catálogo para el badge de "Shop" (GET /products, limit 1 solo
  // para leer meta.total — mismo patrón que Pagination.jsx). Se pide una sola vez,
  // la primera vez que se abre el menú.
  useEffect(() => {
    if (!open || productCount !== null) return;
    let cancelled = false;
    listProducts({ limit: 1 })
      .then((res) => {
        if (!cancelled) setProductCount(res.meta?.total ?? res.items.length);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [open, productCount]);

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(27,24,21,.5)",
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity .3s", zIndex: Z.mobileMenu
      }} />
      <aside style={{
        position: "fixed", top: 0, left: 0, height: "100vh", width: "min(330px, 88vw)",
        background: "var(--cream)", zIndex: Z.mobileMenu + 1,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform .4s cubic-bezier(.2,.7,.2,1)",
        display: "flex", flexDirection: "column",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 24px 20px", borderBottom: "1px solid var(--line)", flexShrink: 0 }}>
          <span className="script" style={{ fontSize: 27 }}>Sharon</span>
          <IconButton icon="close" size={38} iconSize={18} onClick={onClose} aria-label={t("closeMenu")} />
        </div>

        <nav className="ns" style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 2 }}>
          <Link
            to="/tienda"
            onClick={onClose}
            style={{ ...rowStyle, justifyContent: "space-between", background: "var(--cream-2)", fontWeight: 700 }}
          >
            {t("shop")}
            {productCount != null && (
              <span className="mono" style={{ fontSize: 10, color: "var(--botanic-deep)" }}>{t("productsCount", { count: productCount })}</span>
            )}
          </Link>
          {SECTION_LINKS.map(([key, hash]) => (
            isHome
              ? <a key={key} href={hash} onClick={onClose} style={rowStyle}>{t(`sections.${key}`)}</a>
              : <Link key={key} to={`/${hash}`} onClick={onClose} style={rowStyle}>{t(`sections.${key}`)}</Link>
          ))}

          <div style={{ height: 1, background: "var(--line)", margin: "10px 14px" }} />

          <button type="button" onClick={() => { onClose(); onOpenWishlist?.(); }} style={{ ...rowStyle, width: "100%", cursor: "pointer", border: 0, fontFamily: "var(--sans)" }}>
            <Icon name="heart" size={17} color="var(--ink-soft)" />
            {t("wishlist")}
            {wishlistCount > 0 && (
              <span className="mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--terracotta)" }}>{wishlistCount}</span>
            )}
          </button>

          {user && <NotificationsBell variant="row" onOpenOrder={onOpenOrder} />}

          {locales.length > 0 && currencies.length > 0 && (
            <div style={{ display: "flex", gap: 10, padding: "10px 14px" }}>
              <select
                value={locale}
                disabled={langPending}
                onChange={(e) => { setLangPending(true); setLocale(e.target.value).catch(() => setLangPending(false)); }}
                style={{ flex: 1, fontFamily: "var(--sans)", fontSize: 13, fontWeight: 500, color: "var(--ink)", padding: "10px 12px", borderRadius: 12, border: ".5px solid var(--line)", background: "var(--cream-2)" }}
              >
                {locales.map((l) => (
                  <option key={l.code} value={l.code}>{LOCALE_LABELS[l.code] || l.code}</option>
                ))}
              </select>
              <select
                value={currency}
                disabled={langPending}
                onChange={(e) => { setLangPending(true); setCurrency(e.target.value).catch(() => setLangPending(false)); }}
                style={{ flex: 1, fontFamily: "var(--sans)", fontSize: 13, fontWeight: 500, color: "var(--ink)", padding: "10px 12px", borderRadius: 12, border: ".5px solid var(--line)", background: "var(--cream-2)" }}
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>{c.code}</option>
                ))}
              </select>
            </div>
          )}

          {isAdmin && (
            <Link to="/admin" onClick={onClose} style={{ ...rowStyle, justifyContent: "space-between" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Icon name="grid" size={17} color="var(--botanic-deep)" />
                {t("adminPanel")}
              </span>
              <span className="mono" style={{ fontSize: 9, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--gold)" }}>
                Admin
              </span>
            </Link>
          )}
        </nav>

        <div style={{ padding: 16, borderTop: "1px solid var(--line)", flexShrink: 0 }}>
          {user ? (
            <button
              type="button"
              onClick={() => { onClose(); onOpenProfile?.(); }}
              style={{ display: "flex", alignItems: "center", gap: 11, width: "100%", padding: 10, background: "var(--cream-2)", border: 0, borderRadius: 16, cursor: "pointer", textAlign: "left", fontFamily: "var(--sans)" }}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
              ) : (
                <span style={{ width: 40, height: 40, borderRadius: "50%", background: "var(--botanic-muted)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <span className="script" style={{ fontSize: 18, color: "var(--botanic-deep)" }}>
                    {(user.name?.trim()[0] || user.email?.[0] || "?").toUpperCase()}
                  </span>
                </span>
              )}
              <span style={{ minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, display: "block" }}>{user.name || t("myAccountFallback", { ns: "common" })}</span>
                <span style={{ fontSize: 11, color: "var(--ink-soft)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</span>
              </span>
              <Icon name="chev-r" size={16} color="var(--ink-soft)" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => { onClose(); onOpenAuth?.(); }}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: 14, background: "var(--ink)", color: "var(--cream)", border: 0, borderRadius: 999, fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--sans)" }}
            >
              <Icon name="user" size={16} color="var(--cream)" />
              {t("signIn", { ns: "common" })}
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
