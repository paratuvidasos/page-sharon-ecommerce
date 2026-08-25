import { useEffect, useRef, useState } from "react";
import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
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
export const AccountMenu = ({ onOpenAuth, onOpenProfile, onOpenOrderHistory, onLogout }) => {
  const { user } = useAuth();
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
    return <IconButton icon="user" iconSize={18} onClick={onOpenAuth} aria-label="Cuenta" className="nav-user" />;
  }

  const firstName = user.name?.trim().split(/\s+/)[0] || "Tu cuenta";

  return (
    <div ref={rootRef} style={{ position: "relative" }} className="nav-user">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Mi cuenta"
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

      {open && (
        <div
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
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 8px 12px" }}>
            <Avatar user={user} size={40} fontSize={17} />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name || "Tu cuenta"}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-soft)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.email}
              </div>
            </div>
          </div>
          <div style={{ height: 1, background: "var(--line)", margin: "0 -4px 8px" }} />

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenProfile();
            }}
            style={menuItemStyle(false)}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cream-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Icon name="user" size={16} /> Perfil
          </button>

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onOpenOrderHistory();
            }}
            style={{ ...menuItemStyle(false), marginTop: 2 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cream-2)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Icon name="cart" size={16} /> Historial de pedidos
          </button>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            style={{ ...menuItemStyle(true), marginTop: 2 }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(156,74,74,.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Icon name="logout" size={16} color="#9C4A4A" /> {loggingOut ? "Cerrando…" : "Cerrar sesión"}
          </button>
        </div>
      )}
    </div>
  );
};
