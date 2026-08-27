import { useState } from "react";
import { Reveal } from "./Reveal";
import { Icon } from "./Icon";
import { Button } from "./components/Button";

// "Envío" siempre simulado del lado del cliente (no hay endpoint de newsletter,
// ver CLAUDE.md) — mismo patrón mínimo (guarda, confirma 4s, limpia) en la tarjeta
// completa de abajo y en esta fila compacta del footer, solo que la compacta pide
// únicamente correo (sin nombre), a propósito para caber en una sola línea.
const useEmailSubscribe = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setSent(true);
      setTimeout(() => setSent(false), 4000);
      setEmail("");
    }
  };

  return { email, setEmail, sent, submit };
};

// Fila compacta para el footer (rebrand: "Join the studio" del mockup de referencia)
// — un solo campo visible (correo) y estilos para fondo oscuro.
const NewsletterInline = () => {
  const { email, setEmail, sent, submit } = useEmailSubscribe();

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }} className="nl-inline">
      <h2 className="display" style={{ fontSize: "clamp(28px, 3.4vw, 40px)", color: "var(--cream)", margin: 0 }}>
        Únete al <span className="script" style={{ color: "var(--botanic)" }}>ritual</span>
      </h2>
      <form onSubmit={submit} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Tu correo"
          required
          style={{
            padding: "14px 20px", border: "1px solid rgba(255,255,255,.18)", borderRadius: 999,
            background: "rgba(255,255,255,.08)", color: "var(--cream)", fontSize: 14,
            fontFamily: "var(--sans)", outline: 0, minWidth: 220,
          }}
        />
        <Button type="submit" style={{ whiteSpace: "nowrap" }}>
          {sent ? "¡Listo! ✧" : "Suscribirme"}
        </Button>
      </form>
    </div>
  );
};

export const Newsletter = ({ compact = false }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (email && email.includes("@")) {
      setSent(true);
      setTimeout(() => setSent(false), 4000);
      setName(""); setEmail("");
    }
  };

  if (compact) return <NewsletterInline />;

  return (
    <section style={{ padding: "60px 0 120px" }}>
      <div className="wrap">
        <Reveal>
          <div style={{
            background: "var(--cream-2)",
            borderRadius: 32, padding: "clamp(40px, 5vw, 70px)",
            display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 50, alignItems: "center",
            position: "relative", overflow: "hidden"
          }} className="nl-grid">
            <div aria-hidden="true" style={{
              position: "absolute", bottom: -100, left: -100, width: 320, height: 320, borderRadius: "50%",
              background: "radial-gradient(closest-side, rgba(156,178,155,.5), transparent 70%)"
            }} />

            <div style={{ position: "relative" }}>
              <div className="eyebrow">Comunidad Sharon</div>
              <h2 className="display" style={{ fontSize: "clamp(36px, 4.5vw, 54px)", margin: "10px 0 16px" }}>
                Recibe hábitos y un<br />
                <span className="script" style={{ color: "var(--botanic-deep)" }}>-10%</span> en tu primera orden
              </h2>
              <p style={{ color: "var(--ink-soft)", fontSize: 15, lineHeight: 1.65, maxWidth: 440 }}>
                Una vez al mes, sin spam. Solo lanzamientos, guías y descuentos para nuestra comunidad.
              </p>
            </div>

            <form onSubmit={submit} style={{ position: "relative", display: "flex", flexDirection: "column", gap: 14 }}>
              <label style={{ display: "block" }}>
                <span className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 8 }}>Nombre</span>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre"
                  style={{
                    width: "100%", padding: "16px 20px", border: ".5px solid var(--line)",
                    borderRadius: 999, background: "#fff", fontSize: 15, fontFamily: "var(--sans)",
                    outline: 0, transition: "border-color .25s"
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--ink)"}
                  onBlur={e => e.target.style.borderColor = "var(--line)"} />
              </label>
              <label style={{ display: "block" }}>
                <span className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 8 }}>Correo</span>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="tu@email.com" required
                  style={{
                    width: "100%", padding: "16px 20px", border: ".5px solid var(--line)",
                    borderRadius: 999, background: "#fff", fontSize: 15, fontFamily: "var(--sans)",
                    outline: 0, transition: "border-color .25s"
                  }}
                  onFocus={e => e.target.style.borderColor = "var(--ink)"}
                  onBlur={e => e.target.style.borderColor = "var(--line)"} />
              </label>
              <Button type="submit" style={{ justifyContent: "center", marginTop: 6 }}>
                {sent ? "¡Suscripción confirmada ✦" : "Quiero mi -10%"} <Icon name="arrow" size={16} />
              </Button>
              <div style={{ fontSize: 11, color: "var(--ink-soft)", textAlign: "center", marginTop: 4 }}>
                Al suscribirte aceptas nuestra política de privacidad.
              </div>
            </form>
          </div>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 800px){
          .nl-grid{grid-template-columns: 1fr !important; gap: 24px !important}
        }
      `}</style>
    </section>
  );
};
