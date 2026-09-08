import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthField } from "../AuthField";
import { loginAccount, ApiError } from "@shared/api-client";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM = { email: "", password: "" };

function getFields(t) {
  return [
    { name: "email", label: t("loginForm.emailLabel"), type: "email", placeholder: t("loginForm.emailPlaceholder"), autoComplete: "email", full: true },
    { name: "password", label: t("loginForm.passwordLabel"), type: "password", placeholder: t("loginForm.passwordPlaceholder"), autoComplete: "current-password", full: true },
  ];
}

const REMEMBERED_EMAIL_KEY = "sharon:rememberedEmail";

function validateField(field, value, t) {
  switch (field) {
    case "email":
      if (!value.trim()) return t("loginForm.emailRequired");
      if (!EMAIL_RE.test(value.trim())) return t("loginForm.emailInvalid");
      return "";
    case "password":
      if (!value) return t("loginForm.passwordRequired");
      return "";
    default:
      return "";
  }
}

// Formulario de login autocontenido: campos, validación y "recordarme". Notifica a
// AuthModal solo cuando el backend responde ACCOUNT_LOCKED (onLockChange), para que el
// botón compartido del footer también refleje el estado — sin timer propio: la duración
// real del bloqueo la controla el backend, el cliente solo se desbloquea si el usuario
// vuelve a editar el formulario para reintentar.
export const LoginForm = forwardRef(({ onLockChange, onForgotPassword }, ref) => {
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
  const [rememberMe, setRememberMe] = useState(false);
  const [accountLocked, setAccountLocked] = useState(false);

  useEffect(() => {
    const remembered = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (remembered) {
      setForm((prev) => ({ ...prev, email: remembered }));
      setRememberMe(true);
    }
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
    setErrors((prev) => (touched[field] ? { ...prev, [field]: validateField(field, value, t) } : prev));
    if (accountLocked) {
      setAccountLocked(false);
      onLockChange?.(false);
    }
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, form[field], t) }));
  };

  const invalidFields = FIELDS.filter(({ name }) => errors[name]);

  useImperativeHandle(ref, () => ({
    submit: async () => {
      if (accountLocked) return { ok: false };

      const nextErrors = {};
      FIELDS.forEach(({ name }) => {
        nextErrors[name] = validateField(name, form[name], t);
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
        const { user, accessToken } = await loginAccount(form);
        if (rememberMe) {
          localStorage.setItem(REMEMBERED_EMAIL_KEY, form.email);
        } else {
          localStorage.removeItem(REMEMBERED_EMAIL_KEY);
        }
        return {
          ok: true,
          info: {
            method: "email",
            mode: "login",
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            apiUser: user,
            accessToken,
          },
        };
      } catch (e) {
        if (e instanceof ApiError && e.code === "ACCOUNT_LOCKED") {
          setAccountLocked(true);
          onLockChange?.(true);
          setServerError(e.message);
        } else if (e instanceof ApiError && (e.code === "INVALID_CREDENTIALS" || e.code === "ACCOUNT_INACTIVE")) {
          setServerError(e.message);
        } else {
          setServerError(t("loginForm.genericError"));
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
            {t("loginForm.summaryTitle")}
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
          }}
        >
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            style={{ accentColor: "var(--botanic-deep)", width: 16, height: 16 }}
          />
          {t("loginForm.rememberMe")}
        </label>

        <button
          type="button"
          onClick={onForgotPassword}
          style={{
            background: "none",
            border: 0,
            padding: 0,
            fontSize: 12.5,
            color: "var(--ink-soft)",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          {t("loginForm.forgotPassword")}
        </button>
      </div>
    </div>
  );
});

LoginForm.displayName = "LoginForm";
