import { useEffect, useRef, useState } from "react";
import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
import { Button } from "@ui/components/Button";
import { Modal } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { verifyEmail } from "@shared/api-client";

const STATUS_COPY = {
  checking: { eyebrow: "Verificando", title: "Un momento…", subtitle: "Estamos confirmando tu correo." },
  invalid: { eyebrow: "Enlace no válido", title: "No pudimos verificar tu correo", subtitle: "El enlace puede estar incompleto, vencido o ya haberse usado." },
  ready: { eyebrow: "Listo", title: "Correo verificado" },
};

// Modal de aterrizaje del enlace de verificación de correo (ej. sharon.com/?token=...).
// Independiente de AuthModal: se abre directo desde App.jsx según la URL, llama a
// verifyEmail(token) contra el backend real y muestra éxito o error. Mismo patrón que
// ResetPasswordModal, pero sin formulario propio: el token no requiere ningún input.
export const EmailVerificationModal = ({ open, onClose, token, onGoToLogin }) => {
  const [status, setStatus] = useState("checking");
  // El token es de un solo uso en el backend: si el efecto corre dos veces para el
  // mismo token (StrictMode en dev remonta el componente), la segunda llamada real
  // fallaría con 400 aunque la primera ya haya verificado la cuenta, pisando el éxito
  // con un falso "enlace no válido". Este ref evita disparar verifyEmail() dos veces
  // para el mismo token — a diferencia de un flag "cancelled" atado al cleanup del
  // efecto, no descarta la respuesta de la llamada real cuando StrictMode ejecuta
  // cleanup+efecto de nuevo antes de que esa llamada resuelva.
  const calledForToken = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    // En dev, StrictMode corre mount→cleanup→mount una vez de más: si el cleanup solo
    // pone mountedRef en false, queda en false para siempre porque nada lo vuelve a
    // poner en true. Por eso el efecto también lo reafirma en true al correr.
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    if (!token) {
      setStatus("invalid");
      return;
    }
    if (calledForToken.current === token) return;
    calledForToken.current = token;
    setStatus("checking");
    verifyEmail(token)
      .then(() => {
        if (mountedRef.current) setStatus("ready");
      })
      .catch(() => {
        if (mountedRef.current) setStatus("invalid");
      });
  }, [open, token]);

  const copy = STATUS_COPY[status];

  return (
    <Modal
      open={open}
      onClose={onClose}
      zIndex={Z.verifyEmail}
      width="min(440px, 92vw)"
      labelledBy="verify-email-modal-title"
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
          <div id="verify-email-modal-title" className="display" style={{ fontSize: 24, lineHeight: 1.15 }}>
            {copy.title}
          </div>
          {copy.subtitle && (
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 8, maxWidth: 340 }}>{copy.subtitle}</p>
          )}
        </div>
        <IconButton icon="close" size={38} iconSize={20} onClick={onClose} aria-label="Cerrar" />
      </div>

      <div style={{ padding: "24px 26px 28px" }}>
        {status === "checking" ? (
          <div style={{ textAlign: "center", padding: "20px 8px", fontSize: 13, color: "var(--ink-soft)" }}>
            Verificando tu correo…
          </div>
        ) : status === "invalid" ? (
          <div style={{ textAlign: "center", padding: "4px 8px 8px" }}>
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
            <Button onClick={onClose}>Entendido</Button>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "4px 8px 8px" }}>
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
              Ya puedes iniciar sesión con tu cuenta.
            </p>
            <Button onClick={onGoToLogin} style={{ marginTop: 22 }}>
              Iniciar sesión
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
