import { IconButton } from "./components/IconButton";

export const MobileMenu = ({ open, onClose }) => {
  const links = [
    ["Shop", "#shop"], ["Hábitos", "#beneficios"],
    ["Resultados", "#antes-despues"], ["Historia", "#testimonios"]
  ];
  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(27,24,21,.5)",
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity .3s", zIndex: 95
      }} />
      <aside style={{
        position: "fixed", top: 0, left: 0, height: "100vh", width: "min(360px, 90vw)",
        background: "var(--cream)", zIndex: 96,
        transform: open ? "translateX(0)" : "translateX(-100%)",
        transition: "transform .4s cubic-bezier(.2,.7,.2,1)",
        padding: "28px 28px"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <span className="script" style={{ fontSize: 30 }}>Sharon</span>
          <IconButton icon="close" size={36} iconSize={20} onClick={onClose} aria-label="Cerrar menú" />
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {links.map(([l, h]) => (
            <a key={l} href={h} onClick={onClose} className="display"
               style={{ fontSize: 32, padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
              {l}
            </a>
          ))}
        </nav>
        <div style={{ marginTop: 36, color: "var(--ink-soft)", fontSize: 12, letterSpacing: ".08em" }}>
          hola@sharon.co · +34 900 000 000
        </div>
      </aside>
    </>
  );
};
