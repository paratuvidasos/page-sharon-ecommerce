import { useEffect, useRef, useState } from "react";
import { NavLink, Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@ui/Icon";
import { Modal } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { useAuth } from "@shared/auth/AuthContext";

const NAV_ITEM_DEFS = [
  { to: "/admin", key: "dashboard", icon: "grid", end: true },
  { to: "/admin/orders", key: "orders", icon: "cart" },
  { to: "/admin/products", key: "products", icon: "box" },
  { to: "/admin/categories", key: "categories", icon: "layers" },
  { to: "/admin/inventory", key: "inventory", icon: "warehouse" },
  { to: "/admin/customers", key: "customers", icon: "people" },
  { to: "/admin/coupons", key: "coupons", icon: "tag" },
  { to: "/admin/reviews", key: "reviews", icon: "star" },
  { to: "/admin/banners", key: "banners", icon: "megaphone" },
  { to: "/admin/team", key: "team", icon: "team" },
  { to: "/admin/settings", key: "settings", icon: "gear" },
];

export const AdminLayout = () => {
  const { t } = useTranslation("admin");
  const { user, status, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const rootRef = useRef(null);

  const NAV_ITEMS = NAV_ITEM_DEFS.map((item) => ({
    ...item,
    label: t(`layout.nav.${item.key}.label`),
    subtitle: t(`layout.nav.${item.key}.subtitle`),
  }));

  // Los primeros 4 accesos van directo en la barra inferior de móvil (mismo orden que
  // el sidebar); el resto vive detrás de "Más" (sheet), junto con logout/volver a la tienda.
  const MOBILE_NAV_ITEMS = NAV_ITEMS.slice(0, 4);
  const MOBILE_MORE_ITEMS = NAV_ITEMS.slice(4);

  useEffect(() => {
    if (!menuOpen) return;
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [menuOpen]);

  // Gate real por rol (JWT trae `role` desde [0057]-[0066]): mientras la sesión
  // todavía está resolviendo el refresh-token ("loading") no se rebota, para no
  // expulsar a un admin real solo porque el token no ha terminado de cargar. El
  // early return va después de todos los hooks para no violar las Rules of Hooks
  // (si `isAdmin` cambia entre renders, el número de hooks llamados debe ser el mismo).
  if (status !== "loading" && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const active = NAV_ITEMS.find((n) =>
    n.end ? location.pathname === n.to : location.pathname.startsWith(n.to)
  ) || NAV_ITEMS[0];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--cream-2)", fontFamily: "var(--sans)", color: "var(--ink)" }}>
      <aside className="admin-sidebar" style={{ width: 250, flexShrink: 0, background: "var(--cream)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", padding: "26px 0" }}>
        <div style={{ padding: "0 24px 26px" }}>
          <span className="script" style={{ fontSize: 28 }}>Sharon</span>
          <span className="mono" style={{ fontSize: 10, color: "var(--ink-soft)", display: "block", textTransform: "uppercase", marginTop: 2 }}>
            {t("layout.brandSubtitle")}
          </span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 14px", flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className="foc"
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 12,
                background: isActive ? "var(--botanic-deep)" : "transparent",
                color: isActive ? "var(--cream)" : "var(--ink)",
                fontSize: 13.5,
                fontWeight: 600,
                textDecoration: "none",
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains("active")) e.currentTarget.style.background = "var(--cream-2)";
              }}
              onMouseLeave={(e) => {
                const isActive = location.pathname === item.to || (!item.end && location.pathname.startsWith(item.to));
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon name={item.icon} size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div ref={rootRef} style={{ padding: "16px 20px 0", borderTop: "1px solid var(--line)", marginTop: 14, position: "relative" }}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="foc"
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", background: "transparent", border: 0, cursor: "pointer", padding: 0, textAlign: "left" }}
          >
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--gold)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
              {(user?.name?.trim()[0] || "S").toUpperCase()}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.name || t("layout.defaultAdminName")}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-soft)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email || t("layout.defaultAdminEmail")}
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 12 12" style={{ flexShrink: 0, transform: menuOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}>
              <path d="M2 4l4 4 4-4" stroke="var(--ink-soft)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {menuOpen && (
            <div style={{ position: "absolute", bottom: "calc(100% + 8px)", left: 20, right: 20, background: "#fff", border: "1px solid var(--line)", borderRadius: 14, boxShadow: "var(--shadow-lg)", padding: 8, zIndex: 20 }}>
              <Link
                to="/"
                className="foc"
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, textDecoration: "none", color: "var(--ink)", fontSize: 13, fontWeight: 600 }}
              >
                <Icon name="cart" size={16} /> {t("layout.backToStore")}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="foc"
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 10, border: 0, background: "transparent", cursor: "pointer", color: "#9C4A4A", fontSize: 13, fontWeight: 600, textAlign: "left" }}
              >
                <Icon name="logout" size={16} color="#9C4A4A" /> {t("layout.logout")}
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="admin-main" style={{ flex: 1, padding: "36px 44px", minWidth: 0 }}>
        <div style={{ marginBottom: 32 }}>
          <h1 className="display" style={{ fontSize: 34, margin: 0 }}>{active.label}</h1>
          <div style={{ color: "var(--ink-soft)", fontSize: 14, marginTop: 4 }}>{active.subtitle}</div>
        </div>

        {/* En una recarga dura (F5) o entrando directo a /admin/*, el accessToken vive
            solo en memoria (ver AuthContext) y se pierde — status arranca en "loading"
            mientras se intenta refrescarlo en silencio. Antes de este fix, <Outlet/> ya
            montaba la pantalla hija y su useEffect de carga inicial disparaba con
            getAccessToken() todavía en null, saliendo un 401 real contra /admin/* antes
            de que el refresh terminara. Al no montar la pantalla hasta que `status`
            resuelva, ese primer request siempre sale con el token ya listo — arregla la
            carrera para todas las pantallas del panel de una sola vez, no solo Banners. */}
        {status === "loading" ? (
          <div style={{ padding: "60px 0", textAlign: "center", color: "var(--ink-soft)", fontSize: 13.5 }}>{t("layout.loading")}</div>
        ) : (
          <Outlet />
        )}
      </main>

      {/* Móvil: nav inferior fija con los 4 accesos más usados + "Más" (sheet con el
          resto de NAV_ITEMS y logout/volver a la tienda). Solo visible bajo 900px
          (ver .admin-bottom-nav más abajo) — en escritorio el sidebar ya cubre esto. */}
      <nav className="admin-bottom-nav" style={{
        display: "none", position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 30,
        background: "var(--cream)", borderTop: "1px solid var(--line)",
        padding: "6px 4px calc(6px + env(safe-area-inset-bottom))",
      }}>
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
          return (
            <Link key={item.to} to={item.to} style={bottomNavItemStyle(isActive)}>
              <Icon name={item.icon} size={19} color={isActive ? "var(--botanic-deep)" : "var(--ink-soft)"} />
              {item.label}
            </Link>
          );
        })}
        <button type="button" onClick={() => setMoreOpen(true)} style={bottomNavItemStyle(moreOpen)}>
          <Icon name="menu" size={19} color={moreOpen ? "var(--botanic-deep)" : "var(--ink-soft)"} />
          {t("layout.more")}
        </button>
      </nav>

      <Modal
        open={moreOpen}
        onClose={() => setMoreOpen(false)}
        zIndex={Z.adminNav}
        variant="sheet"
        closeOnEscape
        labelledBy="admin-more-sheet-title"
        panelStyle={{
          background: "var(--cream)",
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          boxShadow: "0 -20px 60px rgba(27,24,21,.25)",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "20px 20px calc(20px + env(safe-area-inset-bottom))",
        }}
      >
        <span id="admin-more-sheet-title" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>{t("layout.more")}</span>
        {MOBILE_MORE_ITEMS.map((item) => {
          const isActive = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
          return (
            <Link key={item.to} to={item.to} onClick={() => setMoreOpen(false)} className="admin-more-item" style={moreItemStyle(isActive)}>
              <Icon name={item.icon} size={17} color={isActive ? "var(--botanic-deep)" : "var(--ink)"} />
              {item.label}
            </Link>
          );
        })}
        <div style={{ height: 1, background: "var(--line)", margin: "8px -4px" }} />
        <Link to="/" onClick={() => setMoreOpen(false)} className="admin-more-item" style={moreItemStyle(false)}>
          <Icon name="cart" size={17} /> {t("layout.backToStore")}
        </Link>
        <button
          type="button"
          onClick={() => { setMoreOpen(false); logout(); }}
          className="admin-more-item"
          style={{ ...moreItemStyle(false), color: "#9C4A4A", width: "100%", border: 0, background: "transparent", cursor: "pointer", textAlign: "left" }}
        >
          <Icon name="logout" size={17} color="#9C4A4A" /> {t("layout.logout")}
        </button>
      </Modal>

      <style>{`
        .admin-more-item:hover{background: var(--cream-2)}
        @media (max-width: 900px){
          .admin-sidebar{display: none !important}
          .admin-main{padding: 20px 16px 90px !important}
          .admin-bottom-nav{display: flex !important}
        }
      `}</style>
    </div>
  );
};

const bottomNavItemStyle = (active) => ({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 3,
  padding: "8px 4px",
  border: 0,
  background: "transparent",
  cursor: "pointer",
  textDecoration: "none",
  fontSize: 10.5,
  fontWeight: 600,
  color: active ? "var(--botanic-deep)" : "var(--ink-soft)",
});

const moreItemStyle = (active) => ({
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "13px 10px",
  borderRadius: 12,
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 600,
  color: active ? "var(--botanic-deep)" : "var(--ink)",
});
