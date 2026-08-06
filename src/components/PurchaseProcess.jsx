import { Reveal } from "./Reveal";
import { Icon } from "./Icon";

const steps = [
  {
    icon: "cart",
    title: "Elige el producto que deseas",
    desc: "Explora nuestra tienda y selecciona los productos que mejor se adapten a tu tipo de cabello.",
  },
  {
    icon: "truck",
    title: "Realiza tu pago",
    desc: "Puedes pagar antes o después de comunicarte con nosotros. Te damos la flexibilidad de elegir.",
  },
];

const dataFields = ["Nombre", "Teléfono", "Dirección", "Barrio", "Productos"];

const bankFields = [
  { label: "Nombre", value: "Samuel Ortiz Bermudez" },
  { label: "Tipo de cuenta", value: "Ahorros" },
  { label: "Banco", value: "Bancolombia" },
  { label: "Cuenta bancaria", value: "009-000112-10" },
];

const msgPaid = encodeURIComponent(
  "Hola, realicé un pago previo y quisiera enviar mi comprobante. Mis datos son:\nNombre: \nTeléfono: \nDirección: \nBarrio: \nProductos:"
);
const msgInquiry = encodeURIComponent(
  "Hola, estoy interesado en adquirir uno de sus productos y quisiera recibir información sobre cómo realizar la compra."
);
const waBase = "https://api.whatsapp.com/send?phone=573103879555&text=";

export const PurchaseProcess = () => {
  return (
    <section id="proceso-compra" data-screen-label="Proceso de compra" style={{
      padding: "120px 0",
      background: "linear-gradient(180deg, var(--cream) 0%, var(--cream-2) 100%)",
      position: "relative", overflow: "hidden"
    }}>
      <svg className="leaves" style={{ top: 60, right: 40, width: 80, height: 160, transform: "rotate(30deg)" }} viewBox="0 0 100 200" aria-hidden="true">
        <path fill="var(--botanic)" opacity=".3" d="M50 5C30 30 18 70 26 110c6 30 22 50 24 80 0-30 14-50 24-78 12-40 0-80-24-107z"/>
      </svg>
      <svg className="leaves" style={{ bottom: 40, left: 40, width: 70, height: 140, transform: "rotate(-160deg)" }} viewBox="0 0 100 200" aria-hidden="true">
        <path fill="var(--botanic)" opacity=".2" d="M50 5C30 30 18 70 26 110c6 30 22 50 24 80 0-30 14-50 24-78 12-40 0-80-24-107z"/>
      </svg>

      <div className="wrap" style={{ position: "relative", zIndex: 2 }}>
        <Reveal>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="eyebrow">Guía de compra</div>
            <h2 className="display" style={{ fontSize: "clamp(40px, 5vw, 64px)", margin: "10px 0 0" }}>
              Proceso de <span className="script" style={{ color: "var(--botanic-deep)" }}>compra</span>
            </h2>
          </div>
        </Reveal>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 24, marginBottom: 50
        }}>
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 120}>
              <div style={{
                background: "rgba(255,255,255,.7)",
                backdropFilter: "blur(14px)",
                border: ".5px solid rgba(255,255,255,.7)",
                borderRadius: 20,
                padding: "36px 28px",
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
                  <Icon name={s.icon} size={22} stroke={1.4} />
                </div>
                <div className="display" style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
                  Paso {i + 1}
                </div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{s.title}</div>
                <div style={{ color: "var(--ink-soft)", fontSize: 13, lineHeight: 1.55 }}>{s.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          <div className="bank-card" style={{
            background: "rgba(255,255,255,.7)",
            backdropFilter: "blur(14px)",
            border: ".5px solid rgba(255,255,255,.7)",
            borderRadius: 24,
            padding: "clamp(32px, 4vw, 56px)",
            marginBottom: 32,
            position: "relative", overflow: "hidden"
          }}>
            <div aria-hidden="true" style={{
              position: "absolute", top: -60, left: -60, width: 200, height: 200, borderRadius: "50%",
              background: "radial-gradient(closest-side, rgba(201,168,118,.25), transparent 70%)"
            }} />

            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "var(--gold)", color: "#fff",
                  display: "grid", placeItems: "center"
                }}>
                  <Icon name="sun" size={18} stroke={1.6} />
                </div>
                <div className="display" style={{ fontSize: "clamp(22px, 3vw, 30px)" }}>
                  Datos bancarios para pago previo
                </div>
              </div>
              <p style={{ color: "var(--ink-soft)", fontSize: 14, lineHeight: 1.6, marginBottom: 24, maxWidth: 600 }}>
                Si deseas pagar antes de comunicarte con nosotros, puedes hacer tu
                transferencia a la siguiente cuenta:
              </p>
              <div className="bank-grid" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12
              }}>
                {bankFields.map(f => (
                  <div key={f.label} style={{
                    background: "rgba(255,255,255,.7)",
                    border: "1px solid var(--line)",
                    borderRadius: 14,
                    padding: "16px 18px",
                    display: "flex", flexDirection: "column", gap: 4
                  }}>
                    <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--ink-soft)" }}>
                      {f.label}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)" }}>
                      {f.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={280}>
          <div style={{
            background: "rgba(255,255,255,.7)",
            backdropFilter: "blur(14px)",
            border: ".5px solid rgba(255,255,255,.7)",
            borderRadius: 24,
            padding: "clamp(32px, 4vw, 56px)",
            marginBottom: 32,
            position: "relative", overflow: "hidden"
          }}>
            <div aria-hidden="true" style={{
              position: "absolute", top: -80, right: -80, width: 240, height: 240, borderRadius: "50%",
              background: "radial-gradient(closest-side, rgba(156,178,155,.4), transparent 70%)"
            }} />

            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: "var(--botanic-deep)", color: "#fff",
                  display: "grid", placeItems: "center", fontSize: 18, fontWeight: 600
                }}>
                  <Icon name="heart" size={18} stroke={1.6} />
                </div>
                <div className="display" style={{ fontSize: "clamp(22px, 3vw, 30px)" }}>
                  Si ya realizaste tu pago
                </div>
              </div>
              <p style={{ color: "var(--ink-soft)", fontSize: 14, lineHeight: 1.6, marginBottom: 24, maxWidth: 600 }}>
                Envíanos el comprobante de pago junto con los siguientes datos para procesar tu pedido:
              </p>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: 12, marginBottom: 28
              }} className="data-grid">
                {dataFields.map(f => (
                  <div key={f} style={{
                    background: "rgba(255,255,255,.7)",
                    border: "1px solid var(--line)",
                    borderRadius: 12,
                    padding: "14px 16px",
                    display: "flex", alignItems: "center", gap: 10
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: 999,
                      background: "var(--botanic-deep)", flexShrink: 0
                    }} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{f}</span>
                  </div>
                ))}
              </div>
              <div style={{
                display: "flex", flexWrap: "wrap", alignItems: "center",
                gap: 16, padding: "18px 22px",
                background: "rgba(94,120,96,.08)",
                borderRadius: 14,
                border: "1px solid rgba(94,120,96,.15)"
              }}>
                <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>
                  Envía todo a nuestro WhatsApp:
                </span>
                <a href={waBase + msgPaid} target="_blank" rel="noopener noreferrer"
                  className="btn btn-rose btn-sm" style={{ gap: 8 }}>
                  <Icon name="wp" size={14} stroke={1.6} />
                  +57 310 3879555
                </a>
              </div>

              <div style={{
                marginTop: 28,
                padding: "20px 24px",
                borderRadius: 16,
                background: "linear-gradient(120deg, var(--botanic) 0%, var(--botanic-muted) 60%, var(--cream-2) 100%)",
                border: "1px solid rgba(94,120,96,.2)",
                display: "flex", alignItems: "center", gap: 14
              }}>
                <span style={{ fontSize: 24 }}>✦</span>
                <div>
                  <div className="script" style={{ fontSize: "clamp(20px, 2.4vw, 28px)", color: "var(--botanic-deep)" }}>
                    Gracias por tu compra
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>
                    Te confirmaremos tu pedido en menos de 24 horas.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={300}>
          <div style={{
            background: "rgba(255,255,255,.7)",
            backdropFilter: "blur(14px)",
            border: ".5px solid rgba(255,255,255,.7)",
            borderRadius: 24,
            padding: "clamp(32px, 4vw, 56px)",
            position: "relative", overflow: "hidden"
          }}>
            <div aria-hidden="true" style={{
              position: "absolute", bottom: -80, left: -80, width: 240, height: 240, borderRadius: "50%",
              background: "radial-gradient(closest-side, rgba(156,178,155,.3), transparent 70%)"
            }} />

            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: "var(--botanic)", color: "#fff",
                display: "grid", placeItems: "center", flexShrink: 0
              }}>
                <Icon name="spark" size={22} stroke={1.6} />
              </div>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div className="display" style={{ fontSize: "clamp(20px, 2.6vw, 28px)", marginBottom: 6 }}>
                  ¿Aún no has pagado?
                </div>
                <p style={{ color: "var(--ink-soft)", fontSize: 14, lineHeight: 1.6, maxWidth: 500 }}>
                  No hay problema. Escríbenos primero y gestionamos tu pedido juntos.
                  Te asesoraremos sin compromiso.
                </p>
              </div>
              <a href={waBase + msgInquiry} target="_blank" rel="noopener noreferrer"
                className="btn btn-dark" style={{ flexShrink: 0, gap: 8 }}>
                <Icon name="wp" size={15} stroke={1.6} />
                Escríbenos ahora
              </a>
            </div>
          </div>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 700px){
          .data-grid{grid-template-columns: 1fr 1fr !important}
        }
        @media (max-width: 480px){
          .data-grid{grid-template-columns: 1fr !important}
        }
      `}</style>
    </section>
  );
};