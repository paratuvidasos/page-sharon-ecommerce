import { Reveal } from "./Reveal";
import { Icon } from "./Icon";
import { Button } from "./components/Button";

export const OfferBanner = () => {
  return (
    <section style={{ padding: "100px 0" }}>
      <div className="wrap">
        <Reveal>
          <div style={{
            position: "relative", overflow: "hidden",
            background: "linear-gradient(120deg, var(--botanic) 0%, var(--botanic-muted) 60%, var(--cream-2) 100%)",
            borderRadius: 32,
            padding: "clamp(40px, 6vw, 80px)",
            display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 40, alignItems: "center"
          }} className="offer-grid">
            <div aria-hidden="true" style={{
              position: "absolute", top: -120, right: -80, width: 400, height: 400, borderRadius: "50%",
              background: "radial-gradient(closest-side, rgba(94,120,96,.25), transparent 70%)"
            }} />
            <svg className="leaves drift" style={{ bottom: 30, right: 40, width: 90, height: 180, opacity: .4 }} viewBox="0 0 100 200" aria-hidden="true">
              <path fill="var(--botanic-deep)" d="M50 5C30 30 18 70 26 110c6 30 22 50 24 80 0-30 14-50 24-78 12-40 0-80-24-107z"/>
            </svg>

            <div style={{ position: "relative", zIndex: 2 }}>
              <div className="eyebrow">Oferta Especial · Solo esta semana</div>
              <h2 className="display" style={{ fontSize: "clamp(40px, 6vw, 72px)", margin: "12px 0 18px", lineHeight: 1 }}>
                Kit <span className="script" style={{ color: "var(--botanic-deep)" }}>Sharon</span><br />
                completo
              </h2>
              <p style={{ fontSize: 17, color: "var(--ink-soft)", lineHeight: 1.6, maxWidth: 460, marginBottom: 30 }}>
                Tónico, mascarilla, engrosante y cepillo masajeador. La rutina premium en un solo gesto.
              </p>

              <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginBottom: 28 }}>
                <span className="display" style={{ fontSize: 56, color: "var(--ink)" }}>$
                  {Intl.NumberFormat("es-CO").format(138000)} p
                </span>
                <span style={{ fontSize: 20, color: "var(--ink-soft)", textDecoration: "line-through" }}>${Intl.NumberFormat("es-CO").format(150000)}</span>
                <span style={{
                  background: "var(--ink)", color: "var(--cream)",
                  padding: "6px 12px", borderRadius: 999,
                  fontSize: 11, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase"
                }}>-25%</span>
              </div>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <Button>Llevar el kit <Icon name="arrow" size={16} /></Button>
                <Button as="a" href="#shop" variant="ghost">Ver qué incluye</Button>
              </div>

              <div style={{ display: "flex", gap: 24, marginTop: 32, flexWrap: "wrap", color: "var(--ink-soft)", fontSize: 12 }}>
                <span>✦ Envío gratis</span>
                <span>✦ Devolución en 30 días</span>
                <span>✦ Stock limitado</span>
              </div>
            </div>

            <div style={{ position: "relative", minHeight: 360, zIndex: 2 }} className="offer-kit">
              <div style={{ position: "absolute", left: "5%", top: "10%", width: "38%", aspectRatio: ".8/1", zIndex: 3 }}>
                <div className="ph ph-jar drift" style={{ width: "100%", height: "100%", borderRadius: 16, background: "linear-gradient(180deg, #E5EBE2, #D2DFD0)", animationDelay: "0s" }} data-label="Mascarilla" />
              </div>
              <div style={{ position: "absolute", left: "30%", top: "0%", width: "34%", aspectRatio: ".55/1", zIndex: 2 }}>
                <div className="ph ph-spray drift" style={{ width: "100%", height: "100%", borderRadius: 16, background: "linear-gradient(180deg, #DEE8DC, #C9D6C5)", animationDelay: "1s" }} data-label="Tónico" />
              </div>
              <div style={{ position: "absolute", right: "10%", top: "12%", width: "32%", aspectRatio: ".6/1", zIndex: 2 }}>
                <div className="ph ph-bottle drift" style={{ width: "100%", height: "100%", borderRadius: 16, background: "linear-gradient(180deg, #DEE8DC, #C9D6C5)", animationDelay: ".5s" }} data-label="Engrosante" />
              </div>
              <div style={{ position: "absolute", right: "0%", bottom: "5%", width: "28%", aspectRatio: "1/1", zIndex: 3 }}>
                <div className="ph ph-jar drift" style={{ width: "100%", height: "100%", borderRadius: "50%", background: "linear-gradient(180deg, #B5C9B4, #5E7860)", animationDelay: "1.5s" }} data-label="Cepillo" />
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 900px){
          .offer-grid{grid-template-columns: 1fr !important}
          .offer-kit{min-height: 300px !important}
        }
      `}</style>
    </section>
  );
};
