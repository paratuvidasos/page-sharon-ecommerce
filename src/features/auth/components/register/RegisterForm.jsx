import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthField } from "../AuthField";
import { registerAccount, ApiError } from "@shared/api-client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /(?=.*[A-Za-z])(?=.*\d).{8,}/;

const INITIAL_FORM = { firstName: "", lastName: "", email: "", password: "", confirmPassword: "" };

function getFields(t) {
  return [
    { name: "firstName", label: t("registerForm.firstNameLabel"), type: "text", placeholder: t("registerForm.firstNamePlaceholder"), autoComplete: "given-name" },
    { name: "lastName", label: t("registerForm.lastNameLabel"), type: "text", placeholder: t("registerForm.lastNamePlaceholder"), autoComplete: "family-name" },
    { name: "email", label: t("registerForm.emailLabel"), type: "email", placeholder: t("registerForm.emailPlaceholder"), autoComplete: "email", full: true },
    { name: "password", label: t("registerForm.passwordLabel"), type: "password", placeholder: t("registerForm.passwordPlaceholder"), autoComplete: "new-password", helper: t("registerForm.passwordHelper") },
    { name: "confirmPassword", label: t("registerForm.confirmPasswordLabel"), type: "password", placeholder: t("registerForm.confirmPasswordPlaceholder"), autoComplete: "new-password" },
  ];
}

function validateField(field, value, form, t) {
  switch (field) {
    case "firstName":
      if (!value.trim()) return t("registerForm.firstNameRequired");
      return "";
    case "lastName":
      if (!value.trim()) return t("registerForm.lastNameRequired");
      return "";
    case "email":
      if (!value.trim()) return t("registerForm.emailRequired");
      if (!EMAIL_RE.test(value.trim())) return t("registerForm.emailInvalid");
      return "";
    case "password":
      if (!value) return t("registerForm.passwordRequired");
      if (!PASSWORD_RE.test(value)) return t("registerForm.passwordInvalid");
      return "";
    case "confirmPassword":
      if (!value) return t("registerForm.confirmPasswordRequired");
      if (value !== form.password) return t("registerForm.confirmPasswordMismatch");
      return "";
    default:
      return "";
  }
}

async function registerUser(data) {
  return registerAccount({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: data.password,
    confirmPassword: data.confirmPassword,
  });
}

// Formulario de registro autocontenido: dueño de sus propios campos, validación
// y llamada simulada. AuthModal solo dispara submit() y decide qué hacer con el resultado.
export const RegisterForm = forwardRef((_props, ref) => {
  const { t } = useTranslation("auth");
  const FIELDS = getFields(t);
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
      if (touched[field]) next[field] = validateField(field, value, nextForm, t);
      if (field === "password" && touched.confirmPassword) {
        next.confirmPassword = validateField("confirmPassword", nextForm.confirmPassword, nextForm, t);
      }
      return next;
    });
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field], form, t) }));
  };

  const invalidFields = FIELDS.filter(({ name }) => errors[name]);

  useImperativeHandle(ref, () => ({
    submit: async () => {
      const nextErrors = {};
      FIELDS.forEach(({ name }) => {
        nextErrors[name] = validateField(name, form[name], form, t);
      });
      setErrors(nextErrors);
      setTouched(Object.fromEntries(FIELDS.map(({ name }) => [name, true])));

      const hasErrors = FIELDS.some(({ name }) => nextErrors[name]);
      if (hasErrors) {
        setShowSummary(true);
        setSummaryToken((prev) => prev + 1);
        return { ok: false };
      }

      setShowSummary(false);
      setServerError("");
      try {
        await registerUser(form);
        return {
          ok: true,
          info: { method: "email", mode: "register", email: form.email, name: `${form.firstName} ${form.lastName}`.trim(), loggedIn: false },
        };
      } catch (err) {
        if (err instanceof ApiError && err.status === 400) {
          setServerError(err.message || t("registerForm.badRequestFallback"));
        } else {
          setServerError(t("registerForm.genericError"));
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
            {t("registerForm.summaryTitle")}
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
