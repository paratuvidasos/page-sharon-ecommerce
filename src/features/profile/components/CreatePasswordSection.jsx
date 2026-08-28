import { forwardRef, useState } from "react";
import { Button } from "@ui/components/Button";
import { setPassword as setPasswordRequest, ApiError } from "@shared/api-client";
import { useAuth } from "@shared/auth/AuthContext";

const PASSWORD_RE = /(?=.*[A-Za-z])(?=.*\d).{8,}/;

const inputStyle = (invalid) => ({
  width: "100%",
  padding: "14px 18px",
  border: `.5px solid ${invalid ? "#9C4A4A" : "var(--line)"}`,
  borderRadius: 999,
  background: "#fff",
  fontSize: 14,
  fontFamily: "var(--sans)",
  outline: 0,
  boxSizing: "border-box",
});

// Cuentas creadas solo por Google (ver ClerkGoogleBridge en App.jsx) llegan sin
// contraseña propia (hasPassword: false en GET /accounts/me) — esta sección las deja
// definir la primera sin pedir la actual (no existe ninguna), a diferencia del cambio
// de contraseña normal. Se muestra en ProfileModal y también es el destino al que
// apunta el bloqueo de "Eliminar mi cuenta" (DELETE /accounts/me exige password).
export const CreatePasswordSection = forwardRef(({ onCreated }, ref) => {
  const { getAccessToken, markPasswordCreated } = useAuth();
  const [password, setPasswordValue] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = (field, value, nextPassword = password) => {
    if (field === "password") {
      if (!value) return "Elige una contraseña.";
      if (!PASSWORD_RE.test(value)) return "Necesita al menos 8 caracteres, con una letra y un número.";
      return "";
    }
    if (field === "confirmPassword") {
      if (!value) return "Confirma tu contraseña.";
      if (value !== nextPassword) return "Las contraseñas no coinciden todavía.";
      return "";
    }
    return "";
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPasswordValue(value);
    setErrors((prev) => ({
      ...prev,
      password: touched.password ? validate("password", value) : prev.password,
      confirmPassword: touched.confirmPassword ? validate("confirmPassword", confirmPassword, value) : prev.confirmPassword,
    }));
  };

  const handleConfirmChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    setErrors((prev) => ({
      ...prev,
      confirmPassword: touched.confirmPassword ? validate("confirmPassword", value) : prev.confirmPassword,
    }));
  };

  const handleBlur = (field) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validate(field, field === "password" ? password : confirmPassword) }));
  };

  const handleSubmit = async () => {
    const nextErrors = { password: validate("password", password), confirmPassword: validate("confirmPassword", confirmPassword) };
    setErrors(nextErrors);
    setTouched({ password: true, confirmPassword: true });
    if (nextErrors.password || nextErrors.confirmPassword) return;

    setServerError("");
    setSubmitting(true);
    try {
      await setPasswordRequest({ newPassword: password, accessToken: getAccessToken() });
      markPasswordCreated();
      setSuccess(true);
      setPasswordValue("");
      setConfirmPassword("");
      setTouched({});
      onCreated?.();
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        // Ya tenía contraseña (ej. otra pestaña la creó primero) — markPasswordCreated
        // igual deja el estado local consistente sin que el usuario tenga que recargar.
        markPasswordCreated();
        setSuccess(true);
      } else {
        setServerError("No pudimos crear tu contraseña. Intenta de nuevo en unos segundos.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div ref={ref}>
      <span className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>Seguridad</span>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 12, lineHeight: 1.5 }}>
        Tu cuenta llegó a través de Google y todavía no tiene una contraseña propia. Crea una
        para poder iniciar sesión con tu correo o eliminar tu cuenta más adelante.
      </p>

      {success ? (
        <p style={{ fontSize: 12.5, color: "var(--botanic-deep)" }}>Contraseña creada correctamente.</p>
      ) : (
        <>
          {serverError && (
            <div role="alert" style={{ fontSize: 12.5, color: "#7A3535", marginBottom: 10 }}>
              {serverError}
            </div>
          )}
          <div style={{ display: "grid", gap: 10 }}>
            <div>
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                onBlur={handleBlur("password")}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                aria-invalid={touched.password && errors.password ? "true" : undefined}
                style={inputStyle(touched.password && errors.password)}
              />
              <div style={{ minHeight: 16, marginTop: 4 }}>
                {touched.password && errors.password && (
                  <span role="alert" style={{ fontSize: 11, color: "#9C4A4A" }}>{errors.password}</span>
                )}
              </div>
            </div>
            <div>
              <input
                type="password"
                value={confirmPassword}
                onChange={handleConfirmChange}
                onBlur={handleBlur("confirmPassword")}
                placeholder="Repite la contraseña"
                autoComplete="new-password"
                aria-invalid={touched.confirmPassword && errors.confirmPassword ? "true" : undefined}
                style={inputStyle(touched.confirmPassword && errors.confirmPassword)}
              />
              <div style={{ minHeight: 16, marginTop: 4 }}>
                {touched.confirmPassword && errors.confirmPassword && (
                  <span role="alert" style={{ fontSize: 11, color: "#9C4A4A" }}>{errors.confirmPassword}</span>
                )}
              </div>
            </div>
          </div>
          <Button type="button" size="sm" onClick={handleSubmit} disabled={submitting} style={{ marginTop: 4 }}>
            {submitting ? "Creando…" : "Crear contraseña"}
          </Button>
        </>
      )}
    </div>
  );
});

CreatePasswordSection.displayName = "CreatePasswordSection";
