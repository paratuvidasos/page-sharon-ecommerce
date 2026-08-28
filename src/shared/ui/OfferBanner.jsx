import { Reveal } from "./Reveal";
import { Icon } from "./Icon";
import { Button } from "./components/Button";
import { NewsletterInline } from "./Newsletter";
import FotoMascarilla from "@assets/img/sharon_img_6.jpg";
import FotoTonico from "@assets/img/sharon_img_4.jpg";
import FotoHelechos from "@assets/img/sharon_img_5.jpg";

// Diseño 1b (ver "Sharon Mejoras"): oferta + comunidad fusionadas en una sola
// tarjeta con dos zonas — la oferta arriba con fotos reales del kit, y la franja
// de suscripción (NewsletterInline, la misma del footer) fundida abajo en tinta
// oscura. Reemplaza los OfferBanner + Newsletter que antes eran dos secciones
// seguidas.
export const OfferBanner = () => {
  return (
    <section style={{ padding: "100px 0" }}>
      <div className="wrap">
        <Reveal>
          <div style={{
            borderRadius: 32, overflow: "hidden",
            boxShadow: "0 24px 64px rgba(27,24,21,.12)",
            background: "var(--cream-2)",
          }}>
            <div style={{
              position: "relative", overflow: "hidden",
              padding: "clamp(40px, 6vw, 80px)",
              display: "grid", gridTemplateColumns: "1.05fr .95fr", gap: 44, alignItems: "center"
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
                <h2 className="display" style={{ fontSize: "clamp(36px, 5.4vw, 64px)", margin: "12px 0 18px", lineHeight: 1 }}>
                  Kit <span className="script" style={{ color: "var(--botanic-deep)" }}>Sharon</span> completo
                </h2>
                <p style={{ fontSize: 16, color: "var(--ink-soft)", lineHeight: 1.6, maxWidth: 420, marginBottom: 28 }}>
                  Tónico, mascarilla, engrosante y cepillo masajeador. La rutina premium en un solo gesto.
                </p>

                <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 26 }}>
                  <span className="display" style={{ fontSize: 48, color: "var(--ink)" }}>
                    ${Intl.NumberFormat("es-CO").format(138000)}
                  </span>
                  <span style={{ fontSize: 18, color: "var(--ink-soft)", textDecoration: "line-through" }}>${Intl.NumberFormat("es-CO").format(150000)}</span>
                  <span style={{
                    background: "var(--ink)", color: "var(--cream)",
                    padding: "5px 11px", borderRadius: 999,
                    fontSize: 10, fontWeight: 600, letterSpacing: ".12em", textTransform: "uppercase"
                  }}>-25%</span>
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <Button>Llevar el kit <Icon name="arrow" size={16} /></Button>
                  <Button as="a" href="#shop" variant="ghost">Ver qué incluye</Button>
                </div>

                <div style={{ display: "flex", gap: 20, marginTop: 26, flexWrap: "wrap", color: "var(--ink-soft)", fontSize: 12 }}>
                  <span>✦ Envío gratis</span>
                  <span>✦ Devolución en 30 días</span>
                  <span>✦ Stock limitado</span>
                </div>
              </div>

              <div style={{
                position: "relative", zIndex: 2,
                display: "grid", gridTemplateColumns: "1.4fr 1fr", gridTemplateRows: "1fr 1fr",
                gap: 12, height: 400,
              }} className="offer-kit">
                <div style={{ gridRow: "span 2", borderRadius: 22, overflow: "hidden", background: "var(--botanic-muted)" }}>
                  <img src={FotoMascarilla} alt="Mascarilla capilar en manos" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ borderRadius: 22, overflow: "hidden", background: "var(--botanic-muted)" }}>
                  <img src={FotoTonico} alt="Tónico capilar acelerador de crecimiento" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ borderRadius: 22, overflow: "hidden", background: "var(--botanic-muted)" }}>
                  <img src={FotoHelechos} alt="Mascarilla capilar entre helechos" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              </div>
            </div>

            <div style={{ background: "var(--ink)", padding: "clamp(26px, 3.6vw, 34px) clamp(28px, 6vw, 60px)" }}>
              <NewsletterInline
                eyebrow="Comunidad Sharon"
                heading={<>Súmate y recibe un <span className="script" style={{ color: "var(--botanic)" }}>-10%</span> en tu primera orden</>}
              />
            </div>
          </div>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 900px){
          .offer-grid{grid-template-columns: 1fr !important}
          .offer-kit{height: 280px !important}
        }
      `}</style>
    </section>
  );
};
