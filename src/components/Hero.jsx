import { Reveal } from "./Reveal";
import { Icon, Stars } from "./Icon";
import { ProductImage } from "./ProductImage";
import { PRODUCTS } from "../data/products";
import FotoModelo from "../assets/img/sharon_img_2_square.jpg"

export const Hero = ({ onShop }) => {
  return (
    <section style={{ position: "relative", overflow: "hidden", paddingBottom: 60 }}>
      <div aria-hidden="true" style={{
        position: "absolute", top: -200, right: -200, width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(closest-side, rgba(156,178,155,.5), transparent 70%)", pointerEvents: "none"
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", top: 200, left: -160, width: 460, height: 460, borderRadius: "50%",
        background: "radial-gradient(closest-side, rgba(156,178,155,.35), transparent 70%)", pointerEvents: "none"
      }} />
      <svg className="leaves drift" style={{ top: 90, right: 40, width: 90, height: 180 }} viewBox="0 0 100 200" aria-hidden="true">
        <path fill="var(--botanic-deep)" opacity=".35" d="M50 5C30 30 18 70 26 110c6 30 22 50 24 80 0-30 14-50 24-78 12-40 0-80-24-107z"/>
        <path stroke="rgba(255,255,255,.7)" strokeWidth="1" fill="none" d="M50 20v160M50 40c-8 4-14 10-18 18M50 40c8 4 14 10 18 18M50 70c-10 4-18 12-22 22M50 70c10 4 18 12 22 22M50 105c-10 4-18 12-22 22M50 105c10 4 18 12 22 22M50 140c-8 4-14 10-18 18M50 140c8 4 14 10 18 18"/>
      </svg>

      <div className="wrap" style={{ position: "relative", zIndex: 2, paddingTop: 60 }}>
        <div style={{
          display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 60, alignItems: "center"
        }} className="hero-grid">
          <div>
            <Reveal>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 999, background: "rgba(255,255,255,.7)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,.6)", marginBottom: 28 }}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--botanic-deep)" }}></span>
                <span className="eyebrow" style={{ letterSpacing: ".18em", fontSize: 10 }}>Nueva colección · Otoño</span>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <h1 className="display" style={{ fontSize: "clamp(48px, 7vw, 96px)", margin: 0 }}>
                Transforma<br />
                tu cabello con<br />
                <span className="script" style={{ color: "var(--botanic-deep)" }}>productos profesionales</span>
              </h1>
            </Reveal>

            <Reveal delay={260}>
              <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--ink-soft)", maxWidth: 520, margin: "28px 0 36px" }}>
                Fórmulas botánicas, libres de sulfatos y desarrolladas por especialistas.
                Sharon es el ritual diario que tu cabello pidió desde siempre.
              </p>
            </Reveal>

            <Reveal delay={400}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                <button onClick={onShop} className="btn btn-dark">Comprar ahora <Icon name="arrow" size={16} /></button>
                <a href="#beneficios" className="btn btn-ghost">Descubrir hábitos</a>
              </div>
            </Reveal>

            <Reveal delay={540}>
              <div style={{ display: "flex", gap: 40, marginTop: 56, flexWrap: "wrap" }}>
                <div>
                  <div className="display" style={{ fontSize: 34 }}>+12k</div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", letterSpacing: ".06em" }}>Clientas felices</div>
                </div>
                <div>
                  <div className="display" style={{ fontSize: 34 }}>4.9<span style={{ fontSize: 18, color: "var(--gold)" }}> ★</span></div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", letterSpacing: ".06em" }}>Valoración media</div>
                </div>
                <div>
                  <div className="display" style={{ fontSize: 34 }}>0%</div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", letterSpacing: ".06em" }}>Sulfatos & parabenos</div>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} style={{ position: "relative", minHeight: 560 }}>
            <div style={{
              position: "absolute", inset: 0,
              borderRadius: 280,
              overflow: "hidden",
              boxShadow: "var(--shadow-lg)"
            }}>
              <div className="ph-hair" style={{ width: "100%", height: "100%" }}>
                <div style={{
                  position: "absolute", inset: 0,
                  display: "grid", placeItems: "center",
                  color: "var(--ink-soft)"
                }}>
                  <img src={FotoModelo} alt="Foto Modelo" />
                  <div style={{ background: "rgba(251,247,242,.85)", backdropFilter: "blur(8px)", padding: "10px 18px", borderRadius: 999, fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".08em" }}>
                    {/* <img src={FotoModelo} alt="Foto Modelo" /> */}
                    {/* [ FOTO MODELO · CABELLO SEDOSO ] */}
                  </div>
                </div>
              </div>
            </div>

            <div className="drift" style={{
              position: "absolute", bottom: 30, left: -20,
              background: "rgba(255,255,255,.7)", backdropFilter: "blur(18px)",
              border: ".5px solid rgba(255,255,255,.7)",
              borderRadius: 18, padding: 14, width: 220,
              boxShadow: "var(--shadow)",
              display: "flex", alignItems: "center", gap: 12,
              animationDelay: "1s"
            }}>
              <div style={{ width: 50, height: 60, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                <ProductImage product={PRODUCTS[2]} />
              </div>
              <div>
                <div className="eyebrow" style={{ fontSize: 9 }}>Más vendido</div>
                <div style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.2 }}>Engrosante & Anticaída</div>
                <div style={{ marginTop: 4 }}><Stars value={5} size={10} /></div>
              </div>
            </div>

            <div className="drift" style={{
              position: "absolute", top: 40, right: -10,
              background: "rgba(27,24,21,.92)", color: "var(--cream)",
              borderRadius: 18, padding: "16px 18px", width: 200,
              boxShadow: "var(--shadow-lg)",
              animationDelay: ".5s"
            }}>
              <div className="eyebrow" style={{ color: "var(--gold-soft)", fontSize: 9 }}>Envío gratis</div>
              {/* <div className="display" style={{ fontSize: 22, marginTop: 4, color: "var(--cream)" }}>+ 40$</div> */}
              <div style={{ fontSize: 11, opacity: .7, marginTop: 2 }}>En toda el area metropolitana de Medellin, en 24h</div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={700}>
          <div style={{
            marginTop: 80, padding: "22px 0",
            borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)",
            display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap",
            color: "var(--ink-soft)"
          }}>
            {["Vegano certificado", "Cruelty-free", "Made in Spain", "PH neutro", "Dermatológicamente testado"].map(t => (
              <span key={t} className="mono" style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" }}>
                ✦ {t}
              </span>
            ))}
          </div>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 900px){
          .hero-grid{grid-template-columns: 1fr !important; gap: 40px !important}
        }
      `}</style>
    </section>
  );
};
