import { useState, useEffect, useRef } from "react";
import { Reveal } from "./Reveal";
import FotoModeloAntes from "@assets/img/sharon_img_2.jpg";

export const BeforeAfter = () => {
  const [pos, setPos] = useState(50);
  const wrapRef = useRef(null);
  const dragging = useRef(false);

  const onMove = (clientX) => {
    if (!wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    const p = Math.max(2, Math.min(98, ((clientX - r.left) / r.width) * 100));
    setPos(p);
  };

  useEffect(() => {
    const mm = (e) => dragging.current && onMove(e.clientX);
    const tm = (e) => dragging.current && e.touches[0] && onMove(e.touches[0].clientX);
    const up = () => dragging.current = false;
    window.addEventListener("mousemove", mm);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", tm);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", mm);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", tm);
      window.removeEventListener("touchend", up);
    };
  }, []);

  return (
    <section id="antes-despues" data-screen-label="Antes y después" style={{ padding: "120px 0", position: "relative" }}>
      <div className="wrap">
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 60, alignItems: "center"
        }} className="ba-grid">
          <div>
            <Reveal>
              <div className="eyebrow">Resultados reales</div>
              <h2 className="display" style={{ fontSize: "clamp(40px, 5vw, 60px)", margin: "10px 0 22px" }}>
                Antes &<br /><span className="script" style={{ color: "var(--botanic-deep)" }}>después</span>
              </h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 16, lineHeight: 1.65, maxWidth: 460, marginBottom: 28 }}>
                4 semanas de ritual Sharon: tónico anti-caída, mascarilla reparadora y aceite de argán.
                Sin retoques, sin filtros, sin promesas vacías.
              </p>
            </Reveal>

            <Reveal delay={150}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  ["+38%", "más brillo medido en laboratorio"],
                  ["−72%", "rotura al cepillar"],
                  ["+24%", "densidad capilar percibida"],
                ].map(([k, v]) => (
                  <li key={k} style={{ display: "flex", alignItems: "baseline", gap: 16, paddingBottom: 12, borderBottom: "1px solid var(--line)" }}>
                    <span className="display" style={{ fontSize: 32, color: "var(--botanic-deep)", minWidth: 96 }}>{k}</span>
                    <span style={{ color: "var(--ink-soft)", fontSize: 14 }}>{v}</span>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={300}>
              <div style={{ marginTop: 28, fontSize: 11, letterSpacing: ".08em", color: "var(--ink-soft)", textTransform: "uppercase" }}>
                Arrastra el deslizador →
              </div>
            </Reveal>
          </div>

          <Reveal delay={150}>
            <div ref={wrapRef}
                 style={{
                   position: "relative", aspectRatio: "4/5", borderRadius: 24,
                   overflow: "hidden", boxShadow: "var(--shadow-lg)",
                   userSelect: "none", touchAction: "none"
                 }}>
              <div 
              // className="ph-hair" 
              style={{ position: "absolute", inset: 0 }}>
                <img src={FotoModeloAntes} alt="Foto modelo Antes" />
                <div style={{ position: "absolute", top: 20, right: 20, background: "rgba(27,24,21,.85)", color: "#fff", padding: "6px 14px", borderRadius: 999, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" }}>
                  Después · 4 semanas
                </div>
              </div>

              <div style={{
                position: "absolute", inset: 0, clipPath: `inset(0 ${100 - pos}% 0 0)`,
                background: "linear-gradient(135deg, #C7B9AA, #847566)",
                filter: "grayscale(.3) saturate(.7)"
              }}>
                <div style={{ position: "absolute", inset: 0,
                  // backgroundImage: "repeating-linear-gradient(95deg, rgba(27,24,21,.15) 0 1px, transparent 1px 4px)",
                  mixBlendMode: "multiply" }} />
                  <img src={FotoModeloAntes} alt="Foto modelo Antes" />
                <div style={{ position: "absolute", top: 20, left: 20, background: "rgba(255,255,255,.85)", color: "var(--ink)", padding: "6px 14px", borderRadius: 999, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase" }}>
                  Antes
                </div>
              </div>

              <div style={{
                position: "absolute", top: 0, bottom: 0, left: `${pos}%`,
                width: 2, background: "rgba(255,255,255,.9)",
                boxShadow: "0 0 20px rgba(0,0,0,.2)",
                transform: "translateX(-1px)"
              }}>
                <button
                  onMouseDown={() => dragging.current = true}
                  onTouchStart={() => dragging.current = true}
                  aria-label="Deslizar"
                  style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%,-50%)",
                    width: 56, height: 56, borderRadius: 999,
                    background: "rgba(255,255,255,.95)", backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,.8)",
                    boxShadow: "0 8px 24px rgba(27,24,21,.25)",
                    cursor: "ew-resize", display: "grid", placeItems: "center", color: "var(--ink)"
                  }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="m9 6-5 6 5 6M15 6l5 6-5 6"/>
                  </svg>
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px){
          .ba-grid{grid-template-columns: 1fr !important; gap: 40px !important}
        }
      `}</style>
    </section>
  );
};
