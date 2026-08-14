import { useEffect, useRef, useState } from "react";
import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
import { Button } from "@ui/components/Button";
import { Modal } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { ResetPasswordForm } from "./ResetPasswordForm";

const CHECK_DELAY_MS = 500;

// No hay backend todavía: simula la verificación del token del enlace de recuperación.
// Sin token → enlace incompleto/inválido. token "expired" → demuestra el estado de
// enlace vencido (los reales expiran a los 30 min). Cualquier otro token → válido.
// Reemplazar por la verificación real del token contra la API cuando exista.
function checkResetToken(token) {
  if (!token) return "invalid";
  if (token.trim().toLowerCase() === "expired") return "expired";
  return "ready";
}

const STATUS_COPY = {
  checking: { eyebrow: "Verificando", title: "Un momento…", subtitle: "Estamos validando tu enlace de recuperación." },
  invalid: { eyebrow: "Enlace no válido", title: "Este enlace no es válido", subtitle: "Puede estar incompleto o ya haberse usado." },
  expired: { eyebrow: "Enlace vencido", title: "Este enlace venció", subtitle: "Por seguridad, los enlaces de recuperación expiran a los 30 minutos." },
  ready: { eyebrow: "Nueva contraseña", title: "Define tu nueva contraseña", subtitle: "Elige una contraseña segura para tu cuenta." },
};

// Modal de aterrizaje del enlace de recuperación (ej. sharon.com/?resetToken=...).
// Independiente de AuthModal: se abre directo desde App.jsx según la URL, valida
// el token, muestra ResetPasswordForm si es utilizable, y ofrece salidas hacia
// AuthModal (pedir nuevo enlace / iniciar sesión) vía las props de callback.
export const ResetPasswordModal = ({ open, onClose, token, onRequestNewLink, onGoToLogin }) => {
  const [status, setStatus] = useState("checking");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const formRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setStatus("checking");
    setSuccess(false);
    setFormKey((k) => k + 1);
    const timeout = setTimeout(() => setStatus(checkResetToken(token)), CHECK_DELAY_MS);
    return () => clearTimeout(timeout);
  }, [open, token]);

  const handleSubmit = async () => {
    if (!formRef.current) return;
    setSubmitting(true);
    const result = await formRef.current.submit();
    setSubmitting(false);
    if (result?.ok) setSuccess(true);
  };

  const copy = success
    ? { eyebrow: "Listo", title: "Contraseña actualizada" }
    : STATUS_COPY[status];

  return (
    <Modal
      open={open}
      onClose={onClose}
      zIndex={Z.resetPassword}
      width="min(480px, 92vw)"
      labelledBy="reset-modal-title"
      panelStyle={{
        background: "var(--cream)",
        borderRadius: 24,
        boxShadow: "0 32px 80px rgba(27,24,21,.3)",
        border: ".5px solid var(--line)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        maxHeight: "90vh",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "22px 26px",
          borderBottom: "1px solid var(--line)",
          flexShrink: 0,
        }}
      >
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--botanic-deep)" }} />
            <span className="eyebrow" style={{ fontSize: 10, letterSpacing: ".14em" }}>{copy.eyebrow}</span>
          </div>
          <div id="reset-modal-title" className="display" style={{ fontSize: 24, lineHeight: 1.15 }}>
            {copy.title}
          </div>
          {!success && copy.subtitle && (
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 8, maxWidth: 360 }}>{copy.subtitle}</p>
          )}
        </div>
        <IconButton icon="close" size={38} iconSize={20} onClick={onClose} aria-label="Cerrar" />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 26px" }}>
        {success ? (
          <div style={{ textAlign: "center", padding: "12px 8px 24px" }}>
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
            <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6 }}>
              Por tu seguridad, cerramos todas tus sesiones activas. Inicia sesión con tu nueva contraseña.
            </p>
            <Button onClick={onGoToLogin} style={{ marginTop: 22 }}>
              Iniciar sesión
            </Button>
          </div>
        ) : status === "checking" ? (
          <div style={{ textAlign: "center", padding: "32px 8px", fontSize: 13, color: "var(--ink-soft)" }}>
            Verificando tu enlace…
          </div>
        ) : status === "invalid" || status === "expired" ? (
          <div style={{ textAlign: "center", padding: "12px 8px 24px" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(156,74,74,.1)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 20px",
              }}
            >
              <Icon name="close" size={26} color="#9C4A4A" />
            </div>
            <Button onClick={onRequestNewLink}>Solicitar nuevo enlace</Button>
          </div>
        ) : (
          <ResetPasswordForm key={`reset-${formKey}`} ref={formRef} token={token} />
        )}
      </div>

      {status === "ready" && !success && (
        <div style={{ padding: "18px 26px 24px", borderTop: "1px solid var(--line)", background: "#fff", flexShrink: 0 }}>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ width: "100%", justifyContent: "center", opacity: submitting ? 0.6 : 1, cursor: submitting ? "not-allowed" : "pointer" }}
          >
            {submitting ? "Guardando…" : <>Guardar nueva contraseña <Icon name="arrow" size={16} /></>}
          </Button>
        </div>
      )}
    </Modal>
  );
};
