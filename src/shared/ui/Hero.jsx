import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import { Icon, Stars } from "./Icon";
import { ProductImage } from "./ProductImage";
import { Button } from "./components/Button";
import { PRODUCTS } from "@features/catalog/data/products";
import FotoModelo from "@assets/img/sharon_img_2_square.jpg"

export const Hero = ({ onShop }) => {
  const { t } = useTranslation("home");
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
                <span className="eyebrow" style={{ letterSpacing: ".18em", fontSize: 10 }}>{t("hero.badge")}</span>
              </div>
            </Reveal>

            <Reveal delay={120}>
              <h1 className="display" style={{ fontSize: "clamp(48px, 7vw, 96px)", margin: 0 }}>
                {t("hero.title1")}<br />
                {t("hero.title2")}<br />
                <span className="script" style={{ color: "var(--botanic-deep)" }}>{t("hero.titleScript")}</span>
              </h1>
            </Reveal>

            <Reveal delay={260}>
              <p style={{ fontSize: 17, lineHeight: 1.65, color: "var(--ink-soft)", maxWidth: 520, margin: "28px 0 36px" }}>
                {t("hero.description")}
              </p>
            </Reveal>

            <Reveal delay={400}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
                <Button onClick={onShop}>{t("hero.ctaShop")} <Icon name="arrow" size={16} /></Button>
                <Button as="a" href="#beneficios" variant="ghost">{t("hero.ctaDiscover")}</Button>
              </div>
            </Reveal>

            <Reveal delay={540}>
              <div style={{ display: "flex", gap: 40, marginTop: 56, flexWrap: "wrap" }}>
                <div>
                  <div className="display" style={{ fontSize: 34 }}>+12k</div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", letterSpacing: ".06em" }}>{t("hero.stats.customers")}</div>
                </div>
                <div>
                  <div className="display" style={{ fontSize: 34 }}>4.9<span style={{ fontSize: 18, color: "var(--gold)" }}> ★</span></div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", letterSpacing: ".06em" }}>{t("hero.stats.rating")}</div>
                </div>
                <div>
                  <div className="display" style={{ fontSize: 34 }}>0%</div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)", letterSpacing: ".06em" }}>{t("hero.stats.sulfateFree")}</div>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200}>
          <div className="hero-orbit-box" style={{ position: "relative", minHeight: 560 }}>
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

            {/* Insignias orbitando el círculo: el wrapper externo gira 360°/70s
                alrededor del círculo (mismo tamaño, position:absolute inset:0);
                el hijo, anclado cerca del borde superior, gira en sentido contrario
                a la misma velocidad para cancelar la rotación heredada — así la
                tarjeta viaja alrededor de la imagen sin girar sobre sí misma. */}
            <div style={{ position: "absolute", inset: 0, animation: "heroOrbitA 70s linear infinite", pointerEvents: "none", zIndex: 2 }}>
              <div style={{ position: "absolute", top: "1%", left: "50%", transform: "translate(-50%,-50%)", animation: "heroOrbitACounter 70s linear infinite", pointerEvents: "auto" }}>
                <div className="hero-badge hero-badge-a" style={{
                  background: "rgba(255,255,255,.85)", backdropFilter: "blur(18px)",
                  border: ".5px solid rgba(255,255,255,.7)",
                  borderRadius: 18, padding: 14, width: 220,
                  boxShadow: "var(--shadow)",
                  display: "flex", alignItems: "center", gap: 12,
                }}>
                  <div className="hero-badge-a-thumb" style={{ width: 50, height: 60, borderRadius: 10, overflow: "hidden", flexShrink: 0 }}>
                    <ProductImage product={PRODUCTS[2]} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="eyebrow" style={{ fontSize: 9 }}>{t("hero.bestSeller")}</div>
                    <div className="hero-badge-a-name" style={{ fontWeight: 500, fontSize: 13, lineHeight: 1.2 }}>{t("hero.bestSellerProduct")}</div>
                    <div style={{ marginTop: 4 }}><Stars value={5} size={10} /></div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ position: "absolute", inset: 0, animation: "heroOrbitB 70s linear infinite", pointerEvents: "none", zIndex: 2 }}>
              <div style={{ position: "absolute", top: "1%", left: "50%", transform: "translate(-50%,-50%)", animation: "heroOrbitBCounter 70s linear infinite", pointerEvents: "auto" }}>
                <div className="hero-badge hero-badge-b" style={{
                  background: "rgba(27,24,21,.92)", color: "var(--cream)",
                  borderRadius: 18, padding: "16px 18px", width: 200,
                  boxShadow: "var(--shadow-lg)",
                }}>
                  <div className="eyebrow" style={{ color: "var(--gold-soft)", fontSize: 9 }}>{t("hero.freeShipping")}</div>
                  <div style={{ fontSize: 11, opacity: .7, marginTop: 2 }}>{t("hero.freeShippingDesc")}</div>
                </div>
              </div>
            </div>
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
            {t("hero.badges", { returnObjects: true }).map(badge => (
              <span key={badge} className="mono" style={{ fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" }}>
                ✦ {badge}
              </span>
            ))}
          </div>
        </Reveal>
      </div>

      <style>{`
        @keyframes heroOrbitA { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes heroOrbitACounter { from { transform: translate(-50%,-50%) rotate(0deg); } to { transform: translate(-50%,-50%) rotate(-360deg); } }
        @keyframes heroOrbitB { from { transform: rotate(180deg); } to { transform: rotate(540deg); } }
        @keyframes heroOrbitBCounter { from { transform: translate(-50%,-50%) rotate(-180deg); } to { transform: translate(-50%,-50%) rotate(-540deg); } }
        @media (max-width: 900px){
          .hero-grid{grid-template-columns: 1fr !important; gap: 40px !important}
          /* Las insignias orbitan a un radio proporcional a la altura de esta caja
             (heroOrbitA/B parten del borde superior y giran 360°) — en desktop la
             caja es ancha y el radio cabe de sobra, pero a lo angosto de un celular
             ese mismo radio las saca del viewport en la mitad del recorrido y
             quedan "desaparecidas" detrás del overflow:hidden de la sección. Se
             reduce la caja (baja el radio) y el ancho de las tarjetas para que el
             círculo completo quepa dentro del viewport móvil. */
          .hero-orbit-box{min-height: 240px !important}
          .hero-badge-a{width: 130px !important; padding: 9px !important; gap: 8px !important}
          .hero-badge-a-thumb{width: 34px !important; height: 42px !important}
          .hero-badge-a-name{font-size: 11.5px !important}
          .hero-badge-b{width: 118px !important; padding: 10px 12px !important}
          .hero-badge-b div:last-child{font-size: 9.5px !important}
        }
      `}</style>
    </section>
  );
};
