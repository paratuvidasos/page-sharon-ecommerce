import { useState, useEffect, useRef } from "react";
import { Reveal } from "./Reveal";
import { Icon, Stars } from "./Icon";
import { TESTIMONIALS } from "./data/testimonials";

export const Testimonials = () => {
  const [idx, setIdx] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      if (!pausedRef.current) setIdx(i => (i + 1) % TESTIMONIALS.length);
    }, 5500);
    return () => clearInterval(t);
  }, []);

  const avatarBg = (tone) => ({
    rose: "linear-gradient(180deg, #C9D6C5, #5E7860)",
    botanic: "linear-gradient(180deg, #C9D6C5, #5E7860)",
    gold: "linear-gradient(180deg, #E2CDA3, #C9A876)"
  }[tone]);

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

      <div className="wrap" style={{ position: "relative" }}
           onMouseEnter={() => pausedRef.current = true}
           onMouseLeave={() => pausedRef.current = false}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: 48 }}>
            <div>
              <div className="eyebrow" style={{ color: "var(--gold-soft)" }}>Lo dicen ellas</div>
              <h2 className="display" style={{ fontSize: "clamp(40px, 5vw, 60px)", margin: "8px 0 0", color: "var(--cream)" }}>
                Historias de <span className="script" style={{ color: "var(--botanic)" }}>transformación</span>
              </h2>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                aria-label="Anterior"
                style={{ width: 48, height: 48, borderRadius: 999, border: "1px solid rgba(255,255,255,.2)", background: "transparent", color: "var(--cream)", cursor: "pointer", display: "grid", placeItems: "center" }}>
                <Icon name="chev-l" size={18} />
              </button>
              <button onClick={() => setIdx(i => (i + 1) % TESTIMONIALS.length)}
                aria-label="Siguiente"
                style={{ width: 48, height: 48, borderRadius: 999, border: "1px solid var(--cream)", background: "var(--cream)", color: "var(--ink)", cursor: "pointer", display: "grid", placeItems: "center" }}>
                <Icon name="chev-r" size={18} />
              </button>
            </div>
          </div>
        </Reveal>

        <div style={{ position: "relative", minHeight: 320 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={t.id} style={{
              position: i === idx ? "relative" : "absolute",
              inset: 0,
              opacity: i === idx ? 1 : 0,
              transition: "opacity .6s ease",
              pointerEvents: i === idx ? "auto" : "none",
              display: "grid", gridTemplateColumns: "auto 1fr", gap: 32, alignItems: "center"
            }} className="testi-grid">
              <div style={{
                width: 200, height: 200, borderRadius: 999,
                background: avatarBg(t.tone),
                display: "grid", placeItems: "center",
                fontFamily: "var(--serif)", fontSize: 90, color: "rgba(255,255,255,.95)",
                fontStyle: "italic", fontWeight: 500,
                boxShadow: "0 20px 60px rgba(0,0,0,.3)"
              }}>
                {t.avatar}
              </div>
              <div>
                <Stars value={t.rating} size={16} color="var(--gold-soft)" />
                <blockquote className="display" style={{
                  fontSize: "clamp(22px, 2.4vw, 32px)", lineHeight: 1.35,
                  margin: "20px 0 24px", fontWeight: 400, color: "var(--cream)",
                  textWrap: "pretty"
                }}>
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ fontWeight: 500 }}>{t.name}</div>
                  <span style={{ width: 4, height: 4, borderRadius: 999, background: "var(--gold)" }} />
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.6)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 6, marginTop: 36 }}>
          {TESTIMONIALS.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} aria-label={"Testimonio " + (i + 1)}
              style={{
                width: i === idx ? 32 : 8, height: 4, borderRadius: 999,
                background: i === idx ? "var(--cream)" : "rgba(255,255,255,.25)",
                border: 0, cursor: "pointer", transition: "all .3s ease"
              }} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 760px){
          .testi-grid{grid-template-columns: 1fr !important; gap: 20px !important; text-align: center}
          .testi-grid > div:first-child{justify-self: center; width: 140px !important; height: 140px !important; font-size: 64px !important}
        }
      `}</style>
    </section>
  );
};
