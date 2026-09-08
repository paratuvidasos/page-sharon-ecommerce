import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AuthField } from "../AuthField";
import { resetPassword, ApiError } from "@shared/api-client";

const PASSWORD_RE = /(?=.*[A-Za-z])(?=.*\d).{8,}/;

const INITIAL_FORM = { password: "", confirmPassword: "" };

function getFields(t) {
  return [
    { name: "password", label: t("resetPasswordForm.passwordLabel"), type: "password", placeholder: t("resetPasswordForm.passwordPlaceholder"), autoComplete: "new-password", full: true, helper: t("resetPasswordForm.passwordHelper") },
    { name: "confirmPassword", label: t("resetPasswordForm.confirmPasswordLabel"), type: "password", placeholder: t("resetPasswordForm.confirmPasswordPlaceholder"), autoComplete: "new-password", full: true },
  ];
}

function validateField(field, value, form, t) {
  switch (field) {
    case "password":
      if (!value) return t("resetPasswordForm.passwordRequired");
      if (!PASSWORD_RE.test(value)) return t("resetPasswordForm.passwordInvalid");
      return "";
    case "confirmPassword":
      if (!value) return t("resetPasswordForm.confirmPasswordRequired");
      if (value !== form.password) return t("resetPasswordForm.confirmPasswordMismatch");
      return "";
    default:
      return "";
  }
}

// Formulario de restablecimiento: nueva contraseña + confirmación, con la misma
// política de seguridad que RegisterForm. Se monta solo cuando ResetPasswordModal
// ya validó que el token del enlace es utilizable.
export const ResetPasswordForm = forwardRef(({ token }, ref) => {
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
        await resetPassword({ token, newPassword: form.password, confirmPassword: form.confirmPassword });
        return { ok: true };
      } catch (e) {
        if (e instanceof ApiError && e.code === "PASSWORD_RESET_TOKEN_INVALID") {
          return { ok: false, tokenInvalid: true };
        }
        setServerError(t("resetPasswordForm.genericError"));
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
            {t("resetPasswordForm.summaryTitle")}
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
            {invalidFields.map(({ name, label }) => (
              <li key={name} style={{ fontSize: 12.5, color: "#7A3535" }}>
                <a href={`#reset-${name}`} style={{ textDecoration: "underline" }}>
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
            idPrefix="reset"
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

ResetPasswordForm.displayName = "ResetPasswordForm";
