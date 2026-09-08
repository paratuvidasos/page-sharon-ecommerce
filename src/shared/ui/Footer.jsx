import { useTranslation } from "react-i18next";
import { Icon } from "./Icon";

// Un ícono por link, posicional respecto al array de `footer.columns.<key>.links`
// en los locales (ver home.json) — si se agrega/quita/reordena un link ahí, hay que
// actualizar el array acá también para que sigan alineados.
const COLUMN_ICONS = {
  shop: ["grid", "drop", "layers", "spark", "sun", "box"],
  help: ["truck", "arrow", "search", "megaphone", "check"],
  brand: ["team", "leaf", "leaf-deco", "star", "pencil"],
};

const COLUMN_KEYS = ["shop", "help", "brand"];

const SOCIAL_LINKS = [
  ["ig", "Instagram"],
  ["tt", "TikTok"],
  ["pin", "Pinterest"],
  ["fb", "Facebook"],
];

export const Footer = () => {
  const { t } = useTranslation("home");
  const cols = COLUMN_KEYS.map((key) => ({
    key,
    title: t(`footer.columns.${key}.title`),
    links: t(`footer.columns.${key}.links`, { returnObjects: true }),
    icons: COLUMN_ICONS[key],
  }));

  // Footer de ancho completo, mismo tono oscuro que Testimonials como cierre de
  // página. Layout minimalista (referencia: "webtics") — columnas con ícono+texto
  // por link, línea punteada delgada y copyright chico, sin newsletter ni badges de
  // pago acá (la newsletter ya vive en OfferBanner vía NewsletterInline).
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
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr repeat(3, 1fr)", gap: 50 }} className="foot-grid">
          <div>
            <div className="script" style={{ fontSize: 40, lineHeight: 1, marginBottom: 14 }}>Sharon</div>
            <p style={{ color: "rgba(255,255,255,.6)", fontSize: 14, lineHeight: 1.6, maxWidth: 300, marginBottom: 16 }}>
              {t("footer.description")}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 13.5 }}>
              {SOCIAL_LINKS.map(([k, label], i) => (
                <span key={k} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <a
                    href="#"
                    style={{ color: "rgba(255,255,255,.75)", transition: "color .2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--botanic)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,.75)"; }}
                  >
                    {label}
                  </a>
                  {i < SOCIAL_LINKS.length - 1 && <span aria-hidden="true" style={{ color: "rgba(255,255,255,.35)" }}>·</span>}
                </span>
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.key}>
              <div className="eyebrow" style={{ color: "var(--gold-soft)", marginBottom: 16 }}>{c.title}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {c.links.map((l, i) => (
                  <li key={l}>
                    <a
                      href="#"
                      style={{ display: "inline-flex", alignItems: "center", gap: 9, color: "rgba(255,255,255,.72)", fontSize: 14, transition: "color .2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "var(--botanic)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,.72)"; }}
                    >
                      <Icon name={c.icons[i]} size={15} />
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="stitch" style={{ margin: "50px 0 24px", opacity: 0.3, filter: "invert(1)" }} />

        <div style={{ color: "rgba(255,255,255,.5)", fontSize: 12.5 }}>{t("footer.copyright")}</div>
      </div>

      <style>{`
        @media (max-width: 900px){
          .foot-grid{grid-template-columns: 1fr 1fr !important; gap: 36px !important}
        }
        @media (max-width: 560px){
          .foot-grid{grid-template-columns: 1fr !important}
        }
      `}</style>
    </footer>
  );
};
