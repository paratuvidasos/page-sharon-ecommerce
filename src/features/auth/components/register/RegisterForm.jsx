import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { AuthField } from "../AuthField";

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

// Formulario de registro autocontenido: dueño de sus propios campos, validación
// y llamada simulada. AuthModal solo dispara submit() y decide qué hacer con el resultado.
export const RegisterForm = forwardRef((_props, ref) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [summaryToken, setSummaryToken] = useState(0);
  const summaryRef = useRef(null);
  const [serverError, setServerError] = useState("");
  const serverErrorRef = useRef(null);

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

  const invalidFields = FIELDS.filter(({ name }) => errors[name]);

  useImperativeHandle(ref, () => ({
    submit: async () => {
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
        return { ok: false };
      }

      setShowSummary(false);
      setServerError("");
      try {
        await registerUser(form);
        return { ok: true, info: { method: "email", mode: "register", email: form.email } };
      } catch {
        setServerError("No pudimos crear tu cuenta. Intenta de nuevo en unos segundos.");
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
            idPrefix="register"
            value={form[f.name]}
            error={errors[f.name]}
            touched={touched[f.name]}
            onChange={handleChange(f.name)}
            onBlur={handleBlur(f.name)}
          />
        ))}
      </div>
    </div>
  );
});

RegisterForm.displayName = "RegisterForm";
