import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "./Icon";
import { IconButton } from "./components/IconButton";
import { ProductImage } from "./ProductImage";
import { useCart } from "@shared/cart/CartContext";
import { formatCurrency } from "@shared/i18n/currency";
import { NotificationsBell } from "@features/notifications/components/NotificationsBell";
import { AccountMenu } from "@features/profile/components/AccountMenu";

const MAX_MINI_CART_LINES = 3;

// Los links de "hábitos/resultados/proceso/historia" son anchors a secciones que
// solo existen en Home ("/") — en Home siguen siendo <a href="#..."> (scroll suave
// en la misma página, sin recargar); en cualquier otra ruta (ej. /tienda) se
// convierten en <Link to="/#..."> para volver a Home primero (HomePage hace el
// scroll al hash una vez montada). "Shop" en cambio ya no es un anchor — es una
// página real (/tienda, ver CatalogPage) desde que el catálogo dejó de vivir
// embebido en la landing.
const SECTION_LINKS = [
  { label: "Hábitos", hash: "#beneficios" },
  { label: "Resultados", hash: "#antes-despues" },
  { label: "Proceso de compra", hash: "#proceso-compra" },
  { label: "Historia", hash: "#testimonios" },
];

export const Nav = ({ onOpenCart, onOpenSearch, onOpenMenu, onOpenAuth, onOpenProfile, onOpenOrderHistory, onLogout, onOpenWishlist, wishlistCount, onOpenOrder }) => {
  const [scrolled, setScrolled] = useState(false);
  const [miniCartOpen, setMiniCartOpen] = useState(false);
  const { cart, itemCount } = useCart();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isTienda = location.pathname === "/tienda";

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const linkStyle = (active) => ({
    fontSize: 13, fontWeight: active ? 700 : 500, letterSpacing: ".06em", textTransform: "uppercase",
    color: active ? "var(--ink)" : "var(--ink-soft)", position: "relative", padding: "6px 0", textDecoration: "none",
    borderBottom: active ? "2px solid var(--terracotta)" : "2px solid transparent",
  });
  const linkHover = (active) => ({
    onMouseEnter: (e) => { if (!active) e.currentTarget.style.color = "var(--botanic-deep)"; },
    onMouseLeave: (e) => { if (!active) e.currentTarget.style.color = "var(--ink-soft)"; },
  });
  const iconBtnStyle = { border: "1px solid rgba(27,24,21,.12)" };

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: scrolled ? "rgba(251,247,242,.78)" : "transparent",
      backdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
      WebkitBackdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
      borderBottom: scrolled ? ".5px solid rgba(27,24,21,.06)" : ".5px solid transparent",
      transition: "background .35s ease, border-color .35s ease, backdrop-filter .35s ease"
    }}>
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 78 }}>
        <button onClick={onOpenMenu} aria-label="Menú" className="nav-burger"
          style={{ background: "transparent", border: 0, cursor: "pointer", display: "none" }}>
          <Icon name="menu" size={22} />
        </button>

        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span style={{
            width: 38, height: 38, borderRadius: "50%", background: "var(--botanic-deep)",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <span className="script" style={{ fontSize: 20, color: "var(--cream)" }}>S</span>
          </span>
          <span className="script" style={{ fontSize: 28, lineHeight: 1, color: "var(--ink)", letterSpacing: "-.01em" }}>Sharon</span>
        </Link>

        <nav className="nav-links" style={{ display: "flex", gap: 36, alignItems: "center" }}>
          <Link to="/tienda" style={linkStyle(isTienda)} {...linkHover(isTienda)}>Shop</Link>
          {SECTION_LINKS.map(l => (
            isHome
              ? <a key={l.label} href={l.hash} style={linkStyle(false)} {...linkHover(false)}>{l.label}</a>
              : <Link key={l.label} to={`/${l.hash}`} style={linkStyle(false)} {...linkHover(false)}>{l.label}</Link>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <IconButton icon="search" iconSize={18} onClick={onOpenSearch} aria-label="Buscar" style={iconBtnStyle} />
          <IconButton icon="heart" iconSize={18} onClick={onOpenWishlist} aria-label="Favoritos" badge={wishlistCount} badgeColor="var(--terracotta)" style={iconBtnStyle} />
          <NotificationsBell onOpenOrder={onOpenOrder} triggerStyle={iconBtnStyle} />
          <AccountMenu onOpenAuth={onOpenAuth} onOpenProfile={onOpenProfile} onOpenOrderHistory={onOpenOrderHistory} onLogout={onLogout} triggerStyle={iconBtnStyle} />

          {/* [0030][FE] Mini-carrito: hover/focus sobre el mismo ícono que abre el
              drawer completo, reutilizando el `cart` que ya trajo CartProvider (GET
              /cart) — no dispara ninguna llamada propia. */}
          <div
            style={{ position: "relative" }}
            onMouseEnter={() => setMiniCartOpen(true)}
            onMouseLeave={() => setMiniCartOpen(false)}
            onFocus={() => setMiniCartOpen(true)}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) setMiniCartOpen(false);
            }}
          >
            <IconButton icon="cart" iconSize={18} onClick={onOpenCart} aria-label="Bolsa" badge={itemCount} />

            {miniCartOpen && cart.items.length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 10px)",
                  right: 0,
                  width: 300,
                  background: "#fff",
                  borderRadius: 16,
                  border: ".5px solid var(--line)",
                  boxShadow: "var(--shadow-lg)",
                  padding: 16,
                  zIndex: 60,
                }}
              >
                {cart.items.slice(0, MAX_MINI_CART_LINES).map((it) => (
                  <div key={it.itemId} style={{ display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 10, alignItems: "center", padding: "8px 0" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 8, overflow: "hidden" }}>
                      <ProductImage image={it.thumbnailUrl} thumbnail={it.thumbnailUrl} name={it.productName} />
                    </div>
                    <div style={{ fontSize: 12.5, minWidth: 0 }}>
                      <div style={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.productName}</div>
                      <div style={{ color: "var(--ink-soft)" }}>x{it.quantity}</div>
                    </div>
                    <div style={{ fontSize: 12.5 }}>{formatCurrency(it.subtotal)}</div>
                  </div>
                ))}
                {cart.items.length > MAX_MINI_CART_LINES && (
                  <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 4 }}>
                    +{cart.items.length - MAX_MINI_CART_LINES} más
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--line)" }}>
                  <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>Total</span>
                  <span className="display" style={{ fontSize: 18 }}>{formatCurrency(cart.total)}</span>
                </div>
                <button
                  onClick={onOpenCart}
                  style={{
                    width: "100%",
                    marginTop: 12,
                    padding: "10px 0",
                    border: 0,
                    borderRadius: 999,
                    background: "var(--ink)",
                    color: "var(--cream)",
                    fontSize: 12.5,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  Ver carrito
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px){
          .nav-links{display:none !important}
          .nav-burger{display:grid !important; place-items:center; width:40px; height:40px}
          .nav-user{display:none !important}
        }
      `}</style>
    </header>
  );
};
