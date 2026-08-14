import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { AuthField } from "../AuthField";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM = { email: "", password: "" };

const FIELDS = [
  { name: "email", label: "Correo electrónico", type: "email", placeholder: "tucorreo@ejemplo.com", autoComplete: "email", full: true },
  { name: "password", label: "Contraseña", type: "password", placeholder: "Tu contraseña", autoComplete: "current-password", full: true },
];

// Sin base de datos real: esta es la única cuenta que "existe" para poder demostrar
// tanto el login exitoso como el mensaje genérico de credenciales inválidas.
const DEMO_ACCOUNT = { email: "demo.sharon@gmail.com", password: "Ritual2024" };
const REMEMBERED_EMAIL_KEY = "sharon:rememberedEmail";
// Umbral y ventana de bloqueo son solo para demostrar la UX en cliente — la protección
// real contra fuerza bruta debe vivir en el backend.
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_MS = 60_000;

function validateField(field, value) {
  switch (field) {
    case "email":
      if (!value.trim()) return "Necesitamos tu correo para continuar.";
      if (!EMAIL_RE.test(value.trim())) return "Ese correo no parece válido, revisa el formato.";
      return "";
    case "password":
      if (!value) return "Ingresa tu contraseña.";
      return "";
    default:
      return "";
  }
}

async function loginUser(data) {
  // No hay backend todavía: simula la llamada contra la única cuenta de prueba que existe.
  // Reemplazar por la API real (y su propia validación) cuando exista.
  await new Promise((resolve) => setTimeout(resolve, 700));
  const matches =
    data.email.trim().toLowerCase() === DEMO_ACCOUNT.email && data.password === DEMO_ACCOUNT.password;
  if (!matches) throw new Error("invalid_credentials");
  return { ok: true, email: data.email };
}

// Formulario de login autocontenido: campos, validación, "recordarme" y el bloqueo
// simulado por intentos fallidos. Notifica a AuthModal solo cuando el bloqueo cambia
// (onLockChange), para que el botón compartido del footer también refleje el estado.
export const LoginForm = forwardRef(({ onLockChange, onForgotPassword }, ref) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [summaryToken, setSummaryToken] = useState(0);
  const summaryRef = useRef(null);
  const [serverError, setServerError] = useState("");
  const serverErrorRef = useRef(null);
  const [rememberMe, setRememberMe] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const lockoutTimeoutRef = useRef(null);

  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (remembered) {
      setForm((prev) => ({ ...prev, email: remembered }));
      setRememberMe(true);
    }
    return () => {
      if (lockoutTimeoutRef.current) clearTimeout(lockoutTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (summaryToken > 0 && summaryRef.current) summaryRef.current.focus();
  }, [summaryToken]);

  useEffect(() => {
    if (serverError && serverErrorRef.current) serverErrorRef.current.focus();
  }, [serverError]);

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    const nextForm = { ...form, [field]: value };
    setForm(nextForm);
    setErrors((prev) => (touched[field] ? { ...prev, [field]: validateField(field, value) } : prev));
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field]) }));
  };

  const invalidFields = FIELDS.filter(({ name }) => errors[name]);

  useImperativeHandle(ref, () => ({
    submit: async () => {
      if (isLocked) return { ok: false };

      const nextErrors = {};
      FIELDS.forEach(({ name }) => {
        nextErrors[name] = validateField(name, form[name]);
      });
      setErrors(nextErrors);
      setTouched(Object.fromEntries(FIELDS.map(({ name }) => [name, true])));

      const hasErrors = FIELDS.some(({ name }) => nextErrors[name]);
      if (hasErrors) {
        setShowSummary(true);
        setSummaryToken((t) => t + 1);
        return { ok: false };
      }

      setShowSummary(false);
      setServerError("");
      try {
        await loginUser(form);
        setFailedAttempts(0);
        if (rememberMe) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, form.email);
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
        return { ok: true, info: { method: "email", mode: "login", email: form.email } };
      } catch (e) {
        if (e.message === "invalid_credentials") {
          const attempts = failedAttempts + 1;
          setFailedAttempts(attempts);
          if (attempts >= LOCKOUT_THRESHOLD) {
            setIsLocked(true);
            onLockChange?.(true);
            setServerError("Demasiados intentos. Tu cuenta quedó bloqueada temporalmente, intenta de nuevo en 1 minuto.");
            lockoutTimeoutRef.current = setTimeout(() => {
              setIsLocked(false);
              setFailedAttempts(0);
              onLockChange?.(false);
            }, LOCKOUT_MS);
          } else {
            // Mensaje genérico a propósito: no se indica si falló el correo o la contraseña.
            setServerError("Correo o contraseña incorrectos.");
          }
        } else {
          setServerError("No pudimos iniciar tu sesión. Intenta de nuevo en unos segundos.");
        }
        return { ok: false };
      }
    },
  }));

  return (
    <div>
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
                <a href={`#login-${name}`} style={{ textDecoration: "underline" }}>
                  {label}: {errors[name]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {serverError && (
        <div
          ref={serverErrorRef}
          role="alert"
          tabIndex={-1}
          style={{
            background: "rgba(156,74,74,.08)",
            border: "1px solid rgba(156,74,74,.3)",
            borderRadius: 14,
            padding: "12px 18px",
            marginBottom: 20,
            fontSize: 13,
            color: "#7A3535",
            outline: "none",
          }}
        >
          {serverError}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="auth-form">
        {FIELDS.map((f) => (
          <AuthField
            key={f.name}
            config={f}
            idPrefix="login"
            value={form[f.name]}
            error={errors[f.name]}
            touched={touched[f.name]}
            onChange={handleChange(f.name)}
            onBlur={handleBlur(f.name)}
            disabled={isLocked}
          />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--ink-soft)",
            opacity: isLocked ? 0.6 : 1,
          }}
        >
          <input
            type="checkbox"
            checked={rememberMe}
            disabled={isLocked}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ accentColor: "var(--botanic-deep)", width: 16, height: 16 }}
          />
          Recordarme en este dispositivo
        </label>

        <button
          type="button"
          onClick={onForgotPassword}
          disabled={isLocked}
          style={{
            background: "none",
            border: 0,
            padding: 0,
            fontSize: 12.5,
            color: "var(--ink-soft)",
            textDecoration: "underline",
            cursor: isLocked ? "not-allowed" : "pointer",
            opacity: isLocked ? 0.6 : 1,
          }}
        >
          ¿Olvidaste tu contraseña?
        </button>
      </div>
    </div>
  );
});

LoginForm.displayName = "LoginForm";
