import { Link, useLocation } from "react-router-dom";
import { IconButton } from "./components/IconButton";
import { Z } from "./zIndex";

const SECTION_LINKS = [
  ["Hábitos", "#beneficios"],
  ["Resultados", "#antes-despues"],
  ["Historia", "#testimonios"],
];

export const MobileMenu = ({ open, onClose }) => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const itemStyle = { fontSize: 32, padding: "10px 0", borderBottom: "1px solid var(--line)", textDecoration: "none", color: "var(--ink)" };

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(27,24,21,.5)",
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity .3s", zIndex: Z.mobileMenu
      }} />
      <aside style={{
        position: "fixed", top: 0, left: 0, height: "100vh", width: "min(360px, 90vw)",
        background: "var(--cream)", zIndex: Z.mobileMenu + 1,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform .4s cubic-bezier(.2,.7,.2,1)",
        padding: "28px 28px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <span className="script" style={{ fontSize: 30 }}>Sharon</span>
          <IconButton icon="close" size={36} iconSize={20} onClick={onClose} aria-label="Cerrar menú" />
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <Link to="/tienda" onClick={onClose} className="display" style={itemStyle}>Shop</Link>
          {SECTION_LINKS.map(([l, hash]) => (
            isHome
              ? <a key={l} href={hash} onClick={onClose} className="display" style={itemStyle}>{l}</a>
              : <Link key={l} to={`/${hash}`} onClick={onClose} className="display" style={itemStyle}>{l}</Link>
          ))}
        </nav>
        <div style={{ marginTop: 36, color: "var(--ink-soft)", fontSize: 12, letterSpacing: ".08em" }}>
          hola@sharon.co · +34 900 000 000
        </div>
      </aside>
    </>
  );
};
