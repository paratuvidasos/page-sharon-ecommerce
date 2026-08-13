import { useEffect, useRef, useState } from "react";
import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
import { Button } from "@ui/components/Button";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /(?=.*[A-Za-z])(?=.*\d).{8,}/;

const INITIAL_FORM = { name: "", email: "", password: "", confirmPassword: "", address: "" };

const FIELDS = [
  { name: "name", label: "Nombre completo", type: "text", placeholder: "Tu nombre completo", autoComplete: "name" },
  { name: "email", label: "Correo electrónico", type: "email", placeholder: "tucorreo@ejemplo.com", autoComplete: "email" },
  { name: "password", label: "Contraseña", type: "password", placeholder: "Mínimo 8 caracteres", autoComplete: "new-password", helper: "Mínimo 8 caracteres, con una letra y un número." },
  { name: "confirmPassword", label: "Confirmar contraseña", type: "password", placeholder: "Repite tu contraseña", autoComplete: "new-password" },
  { name: "address", label: "Dirección", type: "text", placeholder: "Dirección de entrega", autoComplete: "street-address", full: true },
];

function validateField(field, value, form) {
  switch (field) {
    case "name":
      if (!value.trim()) return "Necesitamos tu nombre para crear la cuenta.";
      if (value.trim().length < 2) return "Cuéntanos tu nombre completo.";
      return "";
    case "email":
      if (!value.trim()) return "Necesitamos tu correo para crear la cuenta.";
      if (!EMAIL_RE.test(value.trim())) return "Ese correo no parece válido, revisa el formato.";
      return "";
    case "password":
      if (!value) return "Elige una contraseña para tu cuenta.";
      if (!PASSWORD_RE.test(value)) return "Necesita al menos 8 caracteres, con una letra y un número.";
      return "";
    case "confirmPassword":
      if (!value) return "Confirma tu contraseña.";
      if (value !== form.password) return "Las contraseñas no coinciden todavía.";
      return "";
    case "address":
      if (!value.trim()) return "Necesitamos una dirección para tus envíos.";
      if (value.trim().length < 5) return "Agrega un poco más de detalle a la dirección.";
      return "";
    default:
      return "";
  }
}

async function registerUser(data) {
  // No hay backend todavía: simula la llamada. Reemplazar por la API real cuando exista.
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { ok: true, email: data.email };
}

export const RegisterModal = ({ open, onClose }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState({ password: false, confirmPassword: false });
  const [showSummary, setShowSummary] = useState(false);
  const [summaryToken, setSummaryToken] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const summaryRef = useRef(null);

  useEffect(() => {
    if (summaryToken > 0 && summaryRef.current) summaryRef.current.focus();
  }, [summaryToken]);

  const reset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setTouched({});
    setShowPassword({ password: false, confirmPassword: false });
    setShowSummary(false);
    setSubmitting(false);
    setServerError("");
    setSuccess(false);
  };

  const close = () => {
    onClose();
    setTimeout(reset, 320);
  };

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    setErrors((prev) => {
      const next = { ...prev };
      if (touched[field]) next[field] = validateField(field, value, nextForm);
      if (field === "password" && touched.confirmPassword) {
        next.confirmPassword = validateField("confirmPassword", nextForm.confirmPassword, nextForm);
      }
      return next;
    });
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field], form) }));
  };

  const handleSubmit = async () => {
    const nextErrors = {};
    FIELDS.forEach(({ name }) => {
      nextErrors[name] = validateField(name, form[name], form);
    });
    setErrors(nextErrors);
    setTouched(Object.fromEntries(FIELDS.map(({ name }) => [name, true])));

    const hasErrors = FIELDS.some(({ name }) => nextErrors[name]);
    if (hasErrors) {
      setShowSummary(true);
      setSummaryToken((t) => t + 1);
      return;
    }

    setShowSummary(false);
    setServerError("");
    setSubmitting(true);
    try {
      await registerUser(form);
      setSuccess(true);
    } catch {
      setServerError("No pudimos crear tu cuenta. Intenta de nuevo en unos segundos.");
    } finally {
      setSubmitting(false);
    }
  };

  const invalidFields = FIELDS.filter(({ name }) => errors[name]);

  const renderField = (config) => {
    const { name, label, type, placeholder, autoComplete, helper, full } = config;
    const isPasswordField = type === "password";
    const inputType = isPasswordField ? (showPassword[name] ? "text" : "password") : type;
    const hasError = Boolean(touched[name] && errors[name]);
    const inputId = `register-${name}`;
    const errorId = `${inputId}-error`;

    return (
      <div key={name} style={full ? { gridColumn: "1 / -1" } : undefined}>
        <label htmlFor={inputId} className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
          {label}
        </label>
        <div style={{ position: "relative" }}>
          <input
            id={inputId}
            value={form[name]}
            onChange={handleChange(name)}
            onBlur={handleBlur(name)}
            type={inputType}
            placeholder={placeholder}
            autoComplete={autoComplete}
            aria-describedby={hasError ? errorId : undefined}
            aria-invalid={hasError ? "true" : undefined}
            style={{
              width: "100%",
              padding: isPasswordField ? "14px 46px 14px 18px" : "14px 18px",
              border: `.5px solid ${hasError ? "#9C4A4A" : "var(--line)"}`,
              borderRadius: 999,
              background: "#fff",
              fontSize: 14,
              fontFamily: "var(--sans)",
              outline: 0,
              transition: "border-color .25s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
          />
          {isPasswordField && (
            <IconButton
              type="button"
              icon={showPassword[name] ? "eye-slash" : "eye"}
              size={32}
              iconSize={16}
              onClick={() => setShowPassword((prev) => ({ ...prev, [name]: !prev[name] }))}
              aria-label={showPassword[name] ? "Ocultar contraseña" : "Mostrar contraseña"}
              style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)" }}
            />
          )}
        </div>
        <div style={{ minHeight: 18, marginTop: 4 }}>
          {hasError ? (
            <span id={errorId} role="alert" style={{ fontSize: 11, color: "#9C4A4A" }}>
              {errors[name]}
            </span>
          ) : helper ? (
            <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>{helper}</span>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        onClick={close}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(27,24,21,.5)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .35s ease",
          zIndex: 92,
          backdropFilter: "blur(6px)",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -50%) ${open ? "scale(1)" : "scale(.96)"}`,
          width: "min(560px, 92vw)",
          maxHeight: "90vh",
          background: "var(--cream)",
          borderRadius: 24,
          zIndex: 93,
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity .3s ease, transform .35s cubic-bezier(.2,.7,.2,1)",
          boxShadow: "0 32px 80px rgba(27,24,21,.3)",
          border: ".5px solid var(--line)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "22px 26px",
            borderBottom: "1px solid var(--line)",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 100 200"
            style={{ position: "absolute", top: -40, right: -10, width: 90, height: 180, opacity: 0.06, pointerEvents: "none", color: "var(--botanic-deep)" }}
          >
            <path fill="currentColor" d="M50 5C30 30 18 70 26 110c6 30 22 50 24 80 0-30 14-50 24-78 12-40 0-80-24-107z" />
          </svg>
          <div style={{ position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--botanic-deep)" }} />
              <span className="eyebrow" style={{ fontSize: 10, letterSpacing: ".14em" }}>Crea tu cuenta</span>
            </div>
            <div className="display" style={{ fontSize: 26, lineHeight: 1.1 }}>
              Empieza tu <span className="script" style={{ color: "var(--botanic-deep)" }}>ritual</span>
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 8, maxWidth: 380 }}>
              Guarda tus datos, direcciones y el historial de tus pedidos en un solo lugar.
            </p>
          </div>
          <IconButton icon="close" size={38} iconSize={20} onClick={close} aria-label="Cerrar registro" />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 26px" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "24px 8px" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "var(--botanic-muted)",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 20px",
                }}
              >
                <Icon name="leaf" size={28} color="var(--botanic-deep)" />
              </div>
              <div className="display" style={{ fontSize: 24 }}>¡Bienvenida a Sharon!</div>
              <p style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 12, lineHeight: 1.6 }}>
                Te enviamos un correo de verificación a <strong>{form.email}</strong>. Ya puedes usar tu cuenta,
                con acceso limitado hasta que la verifiques.
              </p>
              <Button onClick={close} style={{ marginTop: 22 }}>
                Listo
              </Button>
            </div>
          ) : (
            <>
              {showSummary && invalidFields.length > 0 && (
                <div
                  ref={summaryRef}
                  role="alert"
                  tabIndex={-1}
                  style={{
                    background: "rgba(156,74,74,.08)",
                    border: "1px solid rgba(156,74,74,.3)",
                    borderRadius: 14,
                    padding: "14px 18px",
                    marginBottom: 20,
                    outline: "none",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13, color: "#7A3535", marginBottom: 8 }}>
                    Hay campos por revisar
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                    {invalidFields.map(({ name, label }) => (
                      <li key={name} style={{ fontSize: 12.5, color: "#7A3535" }}>
                        <a href={`#register-${name}`} style={{ textDecoration: "underline" }}>
                          {label}: {errors[name]}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {serverError && (
                <div
                  role="alert"
                  style={{
                    background: "rgba(156,74,74,.08)",
                    border: "1px solid rgba(156,74,74,.3)",
                    borderRadius: 14,
                    padding: "12px 18px",
                    marginBottom: 20,
                    fontSize: 13,
                    color: "#7A3535",
                  }}
                >
                  {serverError}
                </div>
              )}

              <div
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
                className="register-form"
              >
                {FIELDS.map(renderField)}
              </div>
            </>
          )}
        </div>

        {!success && (
          <div
            style={{
              padding: "18px 26px 24px",
              borderTop: "1px solid var(--line)",
              background: "#fff",
              flexShrink: 0,
            }}
          >
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                width: "100%",
                justifyContent: "center",
                opacity: submitting ? 0.6 : 1,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Creando cuenta…" : <>Crear cuenta <Icon name="arrow" size={16} /></>}
            </Button>
            <div style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: 11, marginTop: 8 }}>
              Al crear tu cuenta aceptas nuestros términos y condiciones.
            </div>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 560px) {
          .register-form {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
};
