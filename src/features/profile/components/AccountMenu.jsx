import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
import { Modal } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { useAuth } from "@shared/auth/AuthContext";

const avatarStyle = (size) => ({
  width: size,
  height: size,
  borderRadius: "50%",
  overflow: "hidden",
  background: "var(--botanic-muted)",
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
});

const menuItemStyle = (danger) => ({
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  textAlign: "left",
  background: "transparent",
  border: 0,
  borderRadius: 11,
  padding: "10px 10px",
  fontSize: 13.5,
  fontWeight: 500,
  color: danger ? "#9C4A4A" : "var(--ink)",
  cursor: "pointer",
  marginTop: 2,
});

const Avatar = ({ user, size = 32, fontSize = 14 }) =>
  user.avatarUrl ? (
    <div style={avatarStyle(size)}>
      <img src={user.avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  ) : (
    <div style={avatarStyle(size)}>
      <span className="script" style={{ fontSize, color: "var(--botanic-deep)" }}>
        {(user.name?.trim()[0] || user.email?.[0] || "?").toUpperCase()}
      </span>
    </div>
  );

// Ícono de cuenta en Nav: sin sesión abre AuthModal directo (no hay nada más que
// mostrar), con sesión abre este dropdown en vez de ProfileModal directo — antes un
// solo click aterrizaba en un modal grande con todo (perfil/direcciones/pedidos/
// sesión), cuando la mayoría de las veces solo se quiere entrar al perfil o cerrar
// sesión. El trigger y el header del panel muestran el avatar + nombre (mismo
// tratamiento que PhotoField: iniciales en var(--serif) sobre var(--botanic-muted))
// para que quede claro de una quién tiene la sesión abierta, no solo un ícono suelto.
// "Perfil" abre ese mismo ProfileModal (onOpenProfile, ver App.jsx); "Historial de
// pedidos" abre OrderHistoryModal directo, ya no vive dentro de ProfileModal — con
// !user este componente ni se monta (ver más abajo), así que la opción nunca llega a
// mostrarse a un invitado. "Cerrar sesión" llama directo a onLogout sin pasar por el modal.
export const AccountMenu = ({ onOpenAuth, onOpenProfile, onOpenOrderHistory, onLogout, triggerStyle }) => {
  const { t } = useTranslation(["nav", "profile", "orders", "common"]);
  const { user, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
      setOpen(false);
    }
  };

  if (!user) {
    return <IconButton icon="user" iconSize={18} onClick={onOpenAuth} aria-label={t("account", { ns: "nav" })} className="nav-user" style={triggerStyle} />;
  }

  const firstName = user.name?.trim().split(/\s+/)[0] || t("myAccountFallback", { ns: "common" });

  // Ítems compartidos entre el dropdown de escritorio y el bottom sheet de móvil
  // (mismo contenido, dos contenedores distintos según viewport — ver render abajo).
  const items = [
    { key: "profile", icon: "user", label: t("menuLabel", { ns: "profile" }), onClick: () => { setOpen(false); onOpenProfile(); } },
    { key: "orders", icon: "cart", label: t("historyMenuLabel", { ns: "orders" }), onClick: () => { setOpen(false); onOpenOrderHistory(); } },
    ...(isAdmin ? [{ key: "admin", icon: "grid", iconColor: "var(--botanic-deep)", label: t("adminPanel", { ns: "nav" }), to: "/admin", tag: t("adminBadge", { ns: "common" }) }] : []),
    { key: "logout", icon: "logout", iconColor: "#9C4A4A", label: loggingOut ? t("loggingOut", { ns: "common" }) : t("logout", { ns: "common" }), onClick: handleLogout, danger: true, disabled: loggingOut },
  ];

  const renderItem = (item, rowStyleFn) => {
    const className = "account-menu-item" + (item.danger ? " account-menu-item-danger" : "");
    const style = { ...rowStyleFn(item.danger), ...(item.to ? { textDecoration: "none" } : {}) };
    const content = (
      <>
        <Icon name={item.icon} size={16} color={item.iconColor} /> {item.label}
        {item.tag && (
          <span className="mono" style={{ marginLeft: "auto", fontSize: 9, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--gold)" }}>
            {item.tag}
          </span>
        )}
      </>
    );
    if (item.to) {
      return (
        <Link key={item.key} to={item.to} onClick={() => setOpen(false)} className={className} style={style}>
          {content}
        </Link>
      );
    }
    return (
      <button key={item.key} type="button" onClick={item.onClick} disabled={item.disabled} className={className} style={style}>
        {content}
      </button>
    );
  };

  return (
    <div ref={rootRef} style={{ position: "relative" }} className="nav-user">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("myAccount", { ns: "nav" })}
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "var(--cream-2)",
          border: ".5px solid var(--line)",
          borderRadius: 999,
          padding: "4px 12px 4px 4px",
          cursor: "pointer",
          fontFamily: "var(--sans)",
        }}
      >
        <Avatar user={user} />
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", maxWidth: 96, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {firstName}
        </span>
        <svg width="10" height="10" viewBox="0 0 12 12" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform .18s", flexShrink: 0 }}>
          <path d="M2 4l4 4 4-4" stroke="var(--ink-soft)" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Escritorio: dropdown anclado. Oculto bajo 720px (ver .account-sheet más abajo). */}
      {open && (
        <div
          className="account-dropdown"
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: 240,
            background: "#fff",
            borderRadius: 18,
            border: ".5px solid var(--line)",
            boxShadow: "var(--shadow-lg)",
            padding: 12,
            zIndex: Z.accountMenu,
          }}
        >
          <AccountHeader user={user} />
          <div style={{ height: 1, background: "var(--line)", margin: "0 -4px 8px" }} />
          {items.map((it) => renderItem(it, menuItemStyle))}
        </div>
      )}

      {/* Móvil: bottom sheet a pantalla completa, con mejor área táctil por fila. El
          wrapper solo existe para poder ocultar el Modal completo (overlay + panel,
          ambos position:fixed) en escritorio vía CSS, sin tocar su mecánica interna. */}
      <div className="account-sheet-wrap">
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          zIndex={Z.accountMenu}
          variant="sheet"
          closeOnEscape
          labelledBy="account-sheet-title"
          panelStyle={{
            background: "var(--cream)",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            boxShadow: "0 -20px 60px rgba(27,24,21,.25)",
            padding: "20px 20px calc(20px + env(safe-area-inset-bottom))",
          }}
        >
          <span id="account-sheet-title" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden" }}>{t("myAccount", { ns: "nav" })}</span>
          <AccountHeader user={user} />
          <div style={{ height: 1, background: "var(--line)", margin: "0 -4px 12px" }} />
          {items.map((it) => renderItem(it, (danger) => ({ ...menuItemStyle(danger), padding: "14px 10px", fontSize: 14.5 })))}
        </Modal>
      </div>

      <style>{`
        .account-menu-item:hover{background: var(--cream-2)}
        .account-menu-item-danger:hover{background: rgba(156,74,74,.08)}
        .account-sheet-wrap{display: none}
        @media (max-width: 720px){
          .account-dropdown{display: none !important}
          .account-sheet-wrap{display: contents}
        }
      `}</style>
    </div>
  );
};

const AccountHeader = ({ user }) => {
  const { t } = useTranslation("common");
  return (
  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 8px 12px" }}>
    <Avatar user={user} size={40} fontSize={17} />
    <div style={{ minWidth: 0 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {user.name || t("myAccountFallback")}
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-soft)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {user.email}
      </div>
    </div>
  </div>
  );
};
