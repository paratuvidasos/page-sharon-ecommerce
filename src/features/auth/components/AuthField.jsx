import { useState } from "react";
import { IconButton } from "@ui/components/IconButton";

// Campo de texto/contraseña reutilizado por RegisterForm y LoginForm: label +
// input + (si es contraseña) toggle de mostrar/ocultar propio + mensaje de error o ayuda.
export const AuthField = ({ config, value, error, touched, onChange, onBlur, idPrefix, disabled = false }) => {
  const { name, label, type, placeholder, autoComplete, helper, full } = config;
  const [visible, setVisible] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField ? (visible ? "text" : "password") : type;
  const hasError = Boolean(touched && error);
  const inputId = `${idPrefix}-${name}`;
  const errorId = `${inputId}-error`;

  return (
    <div style={full ? { gridColumn: "1 / -1" } : undefined}>
      <label htmlFor={inputId} className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={inputId}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          type={inputType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
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
            opacity: disabled ? 0.6 : 1,
            transition: "border-color .25s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
        />
        {isPasswordField && (
          <IconButton
            type="button"
            icon={visible ? "eye-slash" : "eye"}
            size={32}
            iconSize={16}
            disabled={disabled}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)" }}
          />
        )}
      </div>
      <div style={{ minHeight: 18, marginTop: 4 }}>
        {hasError ? (
          <span id={errorId} role="alert" style={{ fontSize: 11, color: "#9C4A4A" }}>
            {error}
          </span>
        ) : helper ? (
          <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>{helper}</span>
        ) : null}
      </div>
    </div>
  );
};
