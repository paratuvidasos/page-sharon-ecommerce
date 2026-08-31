import { useEffect, useRef, useState } from "react";
import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
import { Z } from "@ui/zIndex";
import { useAuth } from "@shared/auth/AuthContext";
import {
  listNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "@shared/api-client";

const ORDER_LINK_RE = /^\/pedidos\/([^/?#]+)/;

const linkButtonStyle = {
  background: "none", border: 0, padding: 0, fontSize: 11.5, color: "var(--botanic-deep)",
  fontWeight: 600, textDecoration: "underline", cursor: "pointer",
};

const PrefToggle = ({ label, checked, onChange }) => (
  <label style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0", fontSize: 13, cursor: "pointer" }}>
    {label}
    <input type="checkbox" checked={Boolean(checked)} onChange={onChange} style={{ accentColor: "var(--botanic-deep)" }} />
  </label>
);

// Campana de notificaciones ([0044][FE]): buzón in-app para IN_PREPARATION/SHIPPED/
// DELIVERED (el pago aprobado ya manda correo aparte por [0039], no in-app). Requiere
// sesión — los pedidos de invitado solo notifican por correo, así que la campana ni
// se monta sin `user`. Mismo patrón hover/dropdown que el mini-carrito de Nav.jsx,
// pero con toggle por click (necesita interacción: marcar leída, preferencias) en vez
// de hover.
// Cada notificación trae linkUrl = "/pedidos/{orderNumber}"; como todavía no existe esa
// ruta de detalle, en vez de navegar se abre el mismo OrderDetailModal que usa el
// historial de pedidos, resuelto contra `orders` vía onOpenOrder (ver App.jsx).
// SUPUESTO A CONFIRMAR CON BACKEND: el shape de cada item de GET /notifications no está
// documentado más allá de linkUrl — se asume { id, title, message, read, createdAt,
// linkUrl } (nombres típicos de un buzón), tolerando variantes con fallbacks.
// `variant="row"` reutiliza toda la lógica/estado tal cual (misma sesión, mismo
// GET /notifications, mismo marcar-leída) pero cambia el trigger de ícono circular a
// una fila completa de menú — usado dentro de MobileMenu.jsx, donde el ícono normal
// del header no está montado (ver Nav.jsx .nav-icons-desktop, oculto bajo 900px).
export const NotificationsBell = ({ onOpenOrder, triggerStyle, variant = "icon" }) => {
  const { user, getAccessToken } = useAuth();
  const [open, setOpen] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState(null);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    let cancelled = false;
    getUnreadNotificationCount(getAccessToken())
      .then((res) => {
        if (!cancelled) setUnreadCount(res.unreadCount ?? 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    setLoading(true);
    listNotifications({ limit: 15 }, getAccessToken())
      .then((res) => {
        if (cancelled) return;
        setItems(res.items || []);
        if (res.unreadCount != null) setUnreadCount(res.unreadCount);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user?.email]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setPrefsOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const openPreferences = () => {
    setPrefsOpen(true);
    if (!prefs) {
      getNotificationPreferences(getAccessToken())
        .then(setPrefs)
        .catch(() => setPrefs({ emailEnabled: true, inAppEnabled: true }));
    }
  };

  const togglePref = (field) => {
    const next = { ...prefs, [field]: !prefs[field] };
    setPrefs(next);
    updateNotificationPreferences(next, getAccessToken()).catch(() => setPrefs(prefs));
  };

  const handleItemClick = (item) => {
    const isRead = item.read ?? Boolean(item.readAt);
    if (!isRead) {
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true, readAt: new Date().toISOString() } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      markNotificationRead(item.id, getAccessToken()).catch(() => {});
    }
    const match = item.linkUrl && item.linkUrl.match(ORDER_LINK_RE);
    if (match) onOpenOrder?.(match[1]);
    setOpen(false);
  };

  const handleMarkAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    markAllNotificationsRead(getAccessToken()).catch(() => {});
  };

  if (!user) return null;

  const toggle = () => {
    setOpen((v) => !v);
    setPrefsOpen(false);
  };

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      {variant === "row" ? (
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          className="foc"
          style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
            background: "transparent", border: 0, borderRadius: 14, padding: "14px",
            fontSize: 15, fontWeight: 500, color: "var(--ink)", cursor: "pointer", fontFamily: "var(--sans)",
          }}
        >
          <Icon name="bell" size={17} color="var(--ink-soft)" />
          Notificaciones
          {unreadCount > 0 && (
            <span className="mono" style={{ marginLeft: "auto", fontSize: 10, color: "var(--terracotta)" }}>{unreadCount}</span>
          )}
        </button>
      ) : (
        <IconButton
          icon="bell"
          iconSize={18}
          onClick={toggle}
          aria-label="Notificaciones"
          badge={unreadCount}
          badgeColor="var(--terracotta)"
          style={triggerStyle}
        />
      )}

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            left: variant === "row" ? 0 : "auto",
            right: 0,
            width: variant === "row" ? "auto" : 340,
            background: "#fff",
            borderRadius: 16,
            border: ".5px solid var(--line)",
            boxShadow: "var(--shadow-lg)",
            padding: 16,
            zIndex: Z.notifications,
            maxHeight: 420,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span className="eyebrow" style={{ fontSize: 10 }}>Notificaciones</span>
            <div style={{ display: "flex", gap: 10 }}>
              {!prefsOpen && unreadCount > 0 && (
                <button type="button" onClick={handleMarkAllRead} style={linkButtonStyle}>
                  Marcar todas
                </button>
              )}
              <button type="button" onClick={prefsOpen ? () => setPrefsOpen(false) : openPreferences} style={linkButtonStyle}>
                {prefsOpen ? "Volver" : "Preferencias"}
              </button>
            </div>
          </div>

          {prefsOpen ? (
            <div style={{ padding: "4px 0" }}>
              {!prefs ? (
                <p style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>Cargando…</p>
              ) : (
                <>
                  <PrefToggle label="Avisarme por correo" checked={prefs.emailEnabled} onChange={() => togglePref("emailEnabled")} />
                  <PrefToggle label="Avisarme en la app" checked={prefs.inAppEnabled} onChange={() => togglePref("inAppEnabled")} />
                </>
              )}
            </div>
          ) : (
            <div style={{ overflowY: "auto" }}>
              {loading ? (
                <p style={{ fontSize: 12.5, color: "var(--ink-soft)", padding: "8px 0" }}>Cargando…</p>
              ) : items.length === 0 ? (
                <p style={{ fontSize: 12.5, color: "var(--ink-soft)", padding: "8px 0" }}>No tienes notificaciones.</p>
              ) : (
                items.map((item) => {
                  const isRead = item.read ?? Boolean(item.readAt);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item)}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        background: isRead ? "transparent" : "var(--cream-2)",
                        border: 0,
                        borderRadius: 10,
                        padding: "10px 10px",
                        cursor: item.linkUrl ? "pointer" : "default",
                        marginBottom: 4,
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: isRead ? 400 : 600 }}>{item.title || item.message || "Notificación"}</div>
                      {item.title && item.message && (
                        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>{item.message}</div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
