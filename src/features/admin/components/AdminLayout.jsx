import { useEffect, useRef, useState } from "react";
import { NavLink, Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { Icon } from "@ui/Icon";
import { useAuth } from "@shared/auth/AuthContext";

const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: "grid", end: true, subtitle: "Reportes de ventas del período" },
  { to: "/admin/orders", label: "Pedidos", icon: "cart", subtitle: "Gestión de pedidos y envíos" },
  { to: "/admin/products", label: "Productos", icon: "box", subtitle: "Crea, edita y elimina productos del catálogo" },
  { to: "/admin/categories", label: "Categorías", icon: "layers", subtitle: "Categorías y atributos del catálogo" },
  { to: "/admin/inventory", label: "Inventario", icon: "warehouse", subtitle: "Variantes con stock bajo" },
  { to: "/admin/customers", label: "Clientes (CRM)", icon: "people", subtitle: "Historial y valor de cada cliente" },
  { to: "/admin/coupons", label: "Cupones", icon: "tag", subtitle: "Códigos de descuento activos" },
  { to: "/admin/reviews", label: "Reseñas", icon: "star", subtitle: "Moderación de reseñas de producto" },
  { to: "/admin/banners", label: "Banners", icon: "megaphone", subtitle: "Banners y destacados de la home" },
  { to: "/admin/team", label: "Empleados", icon: "team", subtitle: "Accesos y roles del equipo" },
  { to: "/admin/settings", label: "Configuración", icon: "gear", subtitle: "Zonas de envío y destacados de home" },
];

export const AdminLayout = () => {
  const { user, status, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const rootRef = useRef(null);

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
      <aside style={{ width: 250, flexShrink: 0, background: "var(--cream)", borderRight: "1px solid var(--line)", display: "flex", flexDirection: "column", padding: "26px 0" }}>
        <div style={{ padding: "0 24px 26px" }}>
          <span className="script" style={{ fontSize: 28 }}>Sharon</span>
          <span className="mono" style={{ fontSize: 10, color: "var(--ink-soft)", display: "block", textTransform: "uppercase", marginTop: 2 }}>
            Panel administrativo
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
              <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.name || "Sharon Hair Co."}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-soft)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.email || "admin@sharon.com"}
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
                <Icon name="cart" size={16} /> Volver a la tienda
              </Link>
              <button
                type="button"
                onClick={logout}
                className="foc"
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", borderRadius: 10, border: 0, background: "transparent", cursor: "pointer", color: "#9C4A4A", fontSize: 13, fontWeight: 600, textAlign: "left" }}
              >
                <Icon name="logout" size={16} color="#9C4A4A" /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>

      <main style={{ flex: 1, padding: "36px 44px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 className="display" style={{ fontSize: 34, margin: 0 }}>{active.label}</h1>
            <div style={{ color: "var(--ink-soft)", fontSize: 14, marginTop: 4 }}>{active.subtitle}</div>
          </div>
          <button className="foc" style={{ position: "relative", width: 44, height: 44, borderRadius: "50%", border: "1px solid var(--line)", background: "#fff", cursor: "pointer", display: "grid", placeItems: "center" }}>
            <Icon name="bell" size={18} />
            <span style={{ position: "absolute", top: -2, right: -2, width: 17, height: 17, borderRadius: "50%", background: "var(--terracotta)", color: "#fff", fontSize: 9.5, display: "grid", placeItems: "center", fontWeight: 700 }}>
              5
            </span>
          </button>
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
          <div style={{ padding: "60px 0", textAlign: "center", color: "var(--ink-soft)", fontSize: 13.5 }}>Cargando…</div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};
