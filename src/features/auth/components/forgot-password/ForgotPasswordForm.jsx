import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { AuthField } from "../AuthField";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM = { email: "" };

const FIELDS = [
  { name: "email", label: "Correo electrónico", type: "email", placeholder: "tucorreo@ejemplo.com", autoComplete: "email", full: true },
];

function validateField(field, value) {
  switch (field) {
    case "email":
      if (!value.trim()) return "Necesitamos tu correo para enviarte el enlace.";
      if (!EMAIL_RE.test(value.trim())) return "Ese correo no parece válido, revisa el formato.";
      return "";
    default:
      return "";
  }
}

async function requestPasswordReset(email) {
  // No hay backend todavía: simula el envío del enlace. Responde "ok" exista o no la cuenta,
  // para no filtrar qué correos están registrados. Reemplazar por la API real cuando exista.
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { ok: true, email };
}

// Formulario de "olvidé mi contraseña": un único campo de correo, autocontenido
// igual que RegisterForm/LoginForm (validación + submit() imperativo).
export const ForgotPasswordForm = forwardRef((_props, ref) => {
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
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => (touched[field] ? { ...prev, [field]: validateField(field, value) } : prev));
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field]) }));
  };

  const invalidFields = FIELDS.filter(({ name }) => errors[name]);

  useImperativeHandle(ref, () => ({
    submit: async () => {
      const nextErrors = { email: validateField("email", form.email) };
      setErrors(nextErrors);
      setTouched({ email: true });

      if (nextErrors.email) {
        setShowSummary(true);
        setSummaryToken((t) => t + 1);
        return { ok: false };
      }

      setShowSummary(false);
      setServerError("");
      try {
        const result = await requestPasswordReset(form.email);
        return { ok: true, info: { email: result.email } };
      } catch {
        setServerError("No pudimos enviar el enlace. Intenta de nuevo en unos segundos.");
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
                <a href={`#forgot-${name}`} style={{ textDecoration: "underline" }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        {FIELDS.map((f) => (
          <AuthField
            key={f.name}
            config={f}
            idPrefix="forgot"
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

ForgotPasswordForm.displayName = "ForgotPasswordForm";
