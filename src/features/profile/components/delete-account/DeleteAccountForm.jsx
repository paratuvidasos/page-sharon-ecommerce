import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { IconButton } from "@ui/components/IconButton";
import { useAuth } from "@shared/auth/AuthContext";
import { ApiError } from "@shared/api-client";

const REASON_MAX = 500;

// Formulario de confirmación para eliminar la cuenta: pide la contraseña actual
// (obligatoria, la valida el backend contra la cuenta) y un motivo opcional de hasta
// 500 caracteres. El envío real y la limpieza de la sesión viven en AuthContext.deleteAccount
// (mismo patrón que logout/logoutAll: el accessToken en memoria se maneja en un solo lugar),
// así que este formulario solo junta los campos y expone submit() al modal que lo aloja.
export const DeleteAccountForm = forwardRef((_props, ref) => {
  const { deleteAccount } = useAuth();
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const errorRef = useRef(null);

  useEffect(() => {
    if (error && errorRef.current) errorRef.current.focus();
  }, [error]);

  useImperativeHandle(ref, () => ({
    submit: async () => {
      if (!password) {
        setError("Ingresa tu contraseña para confirmar.");
        return { ok: false };
      }
      setError("");
      setSubmitting(true);
      try {
        await deleteAccount({ password, reason: reason.trim() || undefined });
        return { ok: true };
      } catch (e) {
        if (e instanceof ApiError && e.code === "INVALID_CREDENTIALS") {
          setError("El correo o la contraseña son incorrectos.");
        } else if (e instanceof ApiError && e.code === "VALIDATION_ERROR") {
          setError(e.message || "Revisa los datos ingresados.");
        } else {
          setError("No pudimos eliminar tu cuenta. Intenta de nuevo en unos segundos.");
        }
        return { ok: false };
      } finally {
        setSubmitting(false);
      }
    },
  }));

  return (
    <div>
      {error && (
        <div
          ref={errorRef}
          role="alert"
          tabIndex={-1}
          style={{
            background: "rgba(156,74,74,.08)",
            border: "1px solid rgba(156,74,74,.3)",
            borderRadius: 14,
            padding: "12px 18px",
            marginBottom: 18,
            fontSize: 13,
            color: "#7A3535",
            outline: "none",
          }}
        >
          {error}
        </div>
      )}

      <div>
        <label htmlFor="delete-account-password" className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
          Contraseña actual
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="delete-account-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError("");
            }}
            type={visible ? "text" : "password"}
            placeholder="Confirma tu contraseña"
            autoComplete="current-password"
            disabled={submitting}
            aria-invalid={error ? "true" : undefined}
            style={{
              width: "100%",
              padding: "14px 46px 14px 18px",
              border: `.5px solid ${error ? "#9C4A4A" : "var(--line)"}`,
              borderRadius: 999,
              background: "#fff",
              fontSize: 14,
              fontFamily: "var(--sans)",
              outline: 0,
              opacity: submitting ? 0.6 : 1,
              transition: "border-color .25s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
          />
          <IconButton
            type="button"
            icon={visible ? "eye-slash" : "eye"}
            size={32}
            iconSize={16}
            disabled={submitting}
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
            style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)" }}
          />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <label htmlFor="delete-account-reason" className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
          Motivo (opcional)
        </label>
        <textarea
          id="delete-account-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value.slice(0, REASON_MAX))}
          placeholder="Cuéntanos por qué te vas, nos ayuda a mejorar"
          disabled={submitting}
          rows={3}
          style={{
            width: "100%",
            padding: "14px 18px",
            border: ".5px solid var(--line)",
            borderRadius: 18,
            background: "#fff",
            fontSize: 14,
            fontFamily: "var(--sans)",
            outline: 0,
            resize: "vertical",
            opacity: submitting ? 0.6 : 1,
          }}
          onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
        />
        <div style={{ textAlign: "right", fontSize: 11, color: "var(--ink-soft)", marginTop: 4 }}>
          {reason.length}/{REASON_MAX}
        </div>
      </div>
    </div>
  );
});

DeleteAccountForm.displayName = "DeleteAccountForm";
