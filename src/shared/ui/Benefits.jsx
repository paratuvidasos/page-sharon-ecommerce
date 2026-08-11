import { Reveal } from "./Reveal";
import { Icon } from "./Icon";
import { BENEFITS } from "./data/benefits";

export const Benefits = () => {
  return (
    <section id="beneficios" data-screen-label="Beneficios" style={{
      padding: "100px 0",
      background: "linear-gradient(180deg, var(--cream) 0%, var(--cream-2) 100%)",
      position: "relative", overflow: "hidden"
    }}>
      <svg className="leaves" style={{ top: 40, left: 40, width: 70, height: 140, transform: "rotate(-20deg)" }} viewBox="0 0 100 200" aria-hidden="true">
        <path fill="var(--botanic)" opacity=".25" d="M50 5C30 30 18 70 26 110c6 30 22 50 24 80 0-30 14-50 24-78 12-40 0-80-24-107z"/>
      </svg>
      <svg className="leaves" style={{ bottom: 40, right: 40, width: 70, height: 140, transform: "rotate(160deg)" }} viewBox="0 0 100 200" aria-hidden="true">
        <path fill="var(--botanic)" opacity=".3" d="M50 5C30 30 18 70 26 110c6 30 22 50 24 80 0-30 14-50 24-78 12-40 0-80-24-107z"/>
      </svg>

      <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="eyebrow">Por qué Sharon</div>
            <h2 className="display" style={{ fontSize: "clamp(40px, 5vw, 64px)", margin: "10px 0 0" }}>
              Una promesa para tu <span className="script" style={{ color: "var(--botanic-deep)" }}>cabello</span>
            </h2>
          </div>
        </Reveal>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 16
        }}>
          {BENEFITS.map((b, i) => (
            <Reveal key={b.id} delay={i * 100}>
              <div style={{
                background: "rgba(255,255,255,.7)",
                backdropFilter: "blur(14px)",
                border: ".5px solid rgba(255,255,255,.7)",
                borderRadius: 20,
                padding: "30px 24px",
                height: "100%",
                transition: "transform .35s ease, box-shadow .35s ease",
                cursor: "default"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: "var(--cream)",
                  display: "grid", placeItems: "center",
                  color: "var(--botanic-deep)",
                  marginBottom: 18,
                  border: "1px solid var(--line)"
                }}>
                  <Icon name={b.icon} size={24} stroke={1.4} />
                </div>
                <div className="display" style={{ fontSize: 22, fontWeight: 500, marginBottom: 6 }}>{b.title}</div>
                <div style={{ color: "var(--ink-soft)", fontSize: 13, lineHeight: 1.55 }}>{b.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
