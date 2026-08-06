import { useState, useEffect } from "react";
import { Icon } from "./Icon";

export const Nav = ({ onOpenCart, onOpenSearch, onOpenMenu, cartCount }) => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 20);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  const links = [
    { label: "Shop", href: "#shop" },
    { label: "Hábitos", href: "#beneficios" },
    { label: "Resultados", href: "#antes-despues" },
    { label: "Proceso de compra", href: "#proceso-compra" },
    { label: "Historia", href: "#testimonios" },
  ];

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

        <a href="#" className="script" style={{ fontSize: 34, lineHeight: 1, color: "var(--ink)", letterSpacing: "-.01em" }}>
          <span style={{ position: "relative" }}>
            Sharon
            <span style={{ position: "absolute", right: -10, top: -2, width: 6, height: 6, borderRadius: 999, background: "var(--botanic-deep)" }}></span>
          </span>
        </a>

        <nav className="nav-links" style={{ display: "flex", gap: 36, alignItems: "center" }}>
          {links.map(l => (
            <a key={l.label} href={l.href} style={{
              fontSize: 13, fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase",
              color: "var(--ink)", position: "relative", padding: "6px 0"
            }}
              onMouseEnter={e => e.currentTarget.style.color = "var(--botanic-deep)"}
              onMouseLeave={e => e.currentTarget.style.color = "var(--ink)"}>
              {l.label}
            </a>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={onOpenSearch} aria-label="Buscar"
            style={{ width: 40, height: 40, borderRadius: 999, border: 0, background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}>
            <Icon name="search" size={18} />
          </button>
          <button aria-label="Cuenta" className="nav-user"
            style={{ width: 40, height: 40, borderRadius: 999, border: 0, background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}>
            <Icon name="user" size={18} />
          </button>
          <button onClick={onOpenCart} aria-label="Bolsa"
            style={{ position: "relative", width: 40, height: 40, borderRadius: 999, border: 0, background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}>
            <Icon name="cart" size={18} />
            {cartCount > 0 && (
              <span style={{
                position: "absolute", top: 6, right: 4,
                background: "var(--botanic-deep)", color: "#fff",
                fontSize: 10, fontWeight: 600, lineHeight: 1,
                padding: "3px 5px", borderRadius: 999, minWidth: 16, textAlign: "center"
              }}>{cartCount}</span>
            )}
          </button>
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
