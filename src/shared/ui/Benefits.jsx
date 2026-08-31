import { useTranslation } from "react-i18next";
import { Reveal } from "./Reveal";
import { Icon } from "./Icon";
import { BENEFITS } from "./data/benefits";

export const Benefits = () => {
  const { t } = useTranslation("home");
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
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div className="eyebrow">{t("benefits.eyebrow")}</div>
            <h2 className="display" style={{ fontSize: "clamp(40px, 5vw, 64px)", margin: "10px 0 0" }}>
              {t("benefits.title")} <span className="script" style={{ color: "var(--botanic-deep)" }}>{t("benefits.titleScript")}</span>
            </h2>
          </div>
        </Reveal>

        <div style={{ background: "var(--cream)", borderRadius: 24, overflow: "hidden" }}>
          {BENEFITS.map((b, i) => (
            <Reveal key={b.id} delay={i * 80}>
              <div
                className="benefit-row"
                style={{
                  display: "flex", alignItems: "center", gap: 24,
                  padding: "24px 28px",
                  borderTop: "1px dashed rgba(27,24,21,.16)",
                  borderBottom: i === BENEFITS.length - 1 ? "1px dashed rgba(27,24,21,.16)" : "none",
                  flexWrap: "wrap",
                }}
              >
                <span className="mono" style={{ fontSize: 14, color: "var(--gold)", minWidth: 26 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--botanic-muted)", display: "grid", placeItems: "center", flexShrink: 0, color: "var(--botanic-deep)" }}>
                  <Icon name={b.icon} size={20} stroke={1.5} />
                </span>
                <span className="display" style={{ fontSize: 22, fontWeight: 600, minWidth: 220 }}>{t(`benefits.items.${b.id}.title`)}</span>
                <span style={{ color: "var(--ink-soft)", fontSize: 14, flex: 1 }}>{t(`benefits.items.${b.id}.desc`)}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`.benefit-row:hover{background:var(--cream-2)}`}</style>
    </section>
  );
};
