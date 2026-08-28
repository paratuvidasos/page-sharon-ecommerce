import { Icon } from "./Icon";
import { Newsletter } from "./Newsletter";

export const Footer = () => {
  const cols = [
    { title: "Tienda", links: ["Todos los productos", "Shampoos", "Mascarillas", "Tratamientos", "Aceites", "Kits & combos"] },
    { title: "Ayuda", links: ["Envíos y entregas", "Devoluciones", "Guía de tipo capilar", "Contacto", "Preguntas frecuentes"] },
    { title: "Sharon", links: ["Sobre nosotras", "Ingredientes", "Sostenibilidad", "Programa profesional", "Diario / Blog"] },
  ];

  // Footer de ancho completo (no flotante, sin radio) — misma paleta oscura de
  // Testimonials pero como cierre de página clásico, con la newsletter compacta
  // integrada arriba en vez de vivir aparte.
  return (
    <footer style={{
      background: "linear-gradient(180deg, var(--ink) 0%, #2A241E 100%)",
      color: "var(--cream)",
      paddingTop: 70,
      paddingBottom: 30,
      position: "relative",
      overflow: "hidden",
    }}>
      <div aria-hidden="true" style={{
        position: "absolute", top: -100, right: 80, width: 240, height: 240, borderRadius: "50%",
        background: "radial-gradient(closest-side, rgba(94,120,96,.25), transparent 70%)"
      }} />

      <div className="wrap" style={{ position: "relative" }}>
        <Newsletter compact />

        <div className="stitch" style={{ margin: "40px 0", opacity: 0.35, filter: "invert(1)" }} />

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(3, 1fr)", gap: 50 }} className="foot-grid">
          <div>
            <div className="script" style={{ fontSize: 48, lineHeight: 1, marginBottom: 18 }}>Sharon</div>
            <p style={{ color: "rgba(255,255,255,.65)", fontSize: 14, lineHeight: 1.65, maxWidth: 320, marginBottom: 24 }}>
              Cuidado capilar profesional, formulado en pequeños lotes en Colombia.
              Botánica · ciencia · hábitos.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {[["ig", "Instagram"], ["tt", "TikTok"], ["pin", "Pinterest"], ["fb", "Facebook"]].map(([k, label]) => (
                <a key={k} href="#" aria-label={label} style={{
                  width: 40, height: 40, borderRadius: 999, border: "1px solid rgba(255,255,255,.2)",
                  display: "grid", placeItems: "center", color: "var(--cream)",
                  transition: "background .25s, color .25s"
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--cream)"; e.currentTarget.style.color = "var(--ink)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--cream)"; }}>
                  <Icon name={k} size={16} />
                </a>
              ))}
            </div>
          </div>

          {cols.map(c => (
            <div key={c.title}>
              <div className="eyebrow" style={{ color: "var(--gold-soft)", marginBottom: 18 }}>{c.title}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {c.links.map(l => (
                  <li key={l}>
                    <a href="#" style={{ color: "rgba(255,255,255,.78)", fontSize: 14, transition: "color .2s" }}
                       onMouseEnter={e => e.currentTarget.style.color = "var(--botanic)"}
                       onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,.78)"}>{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginTop: 60, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.55)", fontSize: 12 }}>
          <div>© 2026 Sharon Hair Co. · Todos los derechos reservados</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ marginRight: 6 }}>Pagos seguros:</span>
            {["VISA", "MC", "AMEX", "PAYPAL", "APPLE"].map(t => (
              <span key={t} style={{
                padding: "5px 9px", borderRadius: 6, border: "1px solid rgba(255,255,255,.15)",
                fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".08em"
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .nl-inline form{ flex: 1; justify-content: flex-end; }
        @media (max-width: 900px){
          .foot-grid{grid-template-columns: 1fr 1fr !important; gap: 36px !important}
        }
        @media (max-width: 560px){
          .foot-grid{grid-template-columns: 1fr !important}
        }
        @media (max-width: 640px){
          .nl-inline{ flex-direction: column; align-items: flex-start !important; }
          .nl-inline form{ justify-content: flex-start; width: 100%; }
        }
      `}</style>
    </footer>
  );
};
