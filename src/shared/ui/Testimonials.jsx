import { useRef } from "react";
import { Reveal } from "./Reveal";
import { Stars } from "./Icon";
import { TESTIMONIALS } from "./data/testimonials";

const avatarBg = (tone) => ({
  rose: "linear-gradient(180deg, #C9D6C5, #5E7860)",
  botanic: "linear-gradient(180deg, #C9D6C5, #5E7860)",
  gold: "linear-gradient(180deg, #E2CDA3, #C9A876)"
}[tone]);

// Marquee horizontal infinito (rebrand): reemplaza el carrito manual anterior
// (prev/next + dots) por una cinta que se desplaza sola, con pausa al pasar el
// mouse — misma lista TESTIMONIALS, duplicada una vez para el loop sin costuras.
export const Testimonials = () => {
  const trackRef = useRef(null);

  const pause = () => { if (trackRef.current) trackRef.current.style.animationPlayState = "paused"; };
  const resume = () => { if (trackRef.current) trackRef.current.style.animationPlayState = "running"; };

  return (
    <section id="testimonios" data-screen-label="Testimonios" style={{
      padding: "120px 0",
      background: "var(--ink)", color: "var(--cream)",
      position: "relative", overflow: "hidden"
    }}>
      <div aria-hidden="true" style={{
        position: "absolute", top: -180, left: -180, width: 520, height: 520, borderRadius: "50%",
        background: "radial-gradient(closest-side, rgba(94,120,96,.35), transparent 70%)"
      }} />
      <div aria-hidden="true" style={{
        position: "absolute", bottom: -180, right: -180, width: 520, height: 520, borderRadius: "50%",
        background: "radial-gradient(closest-side, rgba(201,168,118,.25), transparent 70%)"
      }} />

      <div style={{ position: "relative" }}>
        <Reveal>
          <div className="wrap" style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="eyebrow" style={{ color: "var(--gold-soft)" }}>Lo dicen ellas</div>
            <h2 className="display" style={{ fontSize: "clamp(40px, 5vw, 60px)", margin: "8px 0 0", color: "var(--cream)" }}>
              Historias de <span className="script" style={{ color: "var(--botanic)" }}>transformación</span>
            </h2>
          </div>
        </Reveal>

        <div
          style={{ position: "relative", overflow: "hidden" }}
          onMouseEnter={pause}
          onMouseLeave={resume}
        >
          <div ref={trackRef} className="testi-marquee" style={{ display: "flex", gap: 20, width: "max-content" }}>
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <div key={`${t.id}-${i}`} style={{
                width: 340, flexShrink: 0,
                background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)",
                borderRadius: 18, padding: "26px 24px",
              }}>
                <Stars value={t.rating} size={13} color="var(--gold-soft)" />
                <p className="display" style={{ fontSize: 18, lineHeight: 1.4, margin: "14px 0 18px", fontWeight: 400, color: "var(--cream)" }}>
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{
                    width: 32, height: 32, borderRadius: "50%", background: avatarBg(t.tone),
                    display: "grid", placeItems: "center", flexShrink: 0,
                    fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 15,
                  }}>{t.avatar}</span>
                  <span style={{ fontSize: 12.5, fontWeight: 500 }}>{t.name} · {t.role}</span>
                </div>
              </div>
            ))}
          </div>
          <div aria-hidden="true" style={{
            position: "absolute", top: 0, bottom: 0, left: 0, width: 120,
            background: "linear-gradient(90deg, var(--ink) 0%, rgba(27,24,21,.7) 45%, rgba(27,24,21,0) 100%)",
            pointerEvents: "none",
          }} />
          <div aria-hidden="true" style={{
            position: "absolute", top: 0, bottom: 0, right: 0, width: 120,
            background: "linear-gradient(270deg, var(--ink) 0%, rgba(27,24,21,.7) 45%, rgba(27,24,21,0) 100%)",
            pointerEvents: "none",
          }} />
        </div>
      </div>

      <style>{`
        @keyframes testiMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .testi-marquee { animation: testiMarquee 45s linear infinite; }
      `}</style>
    </section>
  );
};
