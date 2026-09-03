import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
import { Button } from "@ui/components/Button";
import { Modal } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { ResetPasswordForm } from "./ResetPasswordForm";

function getStatusCopy(t) {
  return {
    invalid: { eyebrow: t("resetPasswordModal.invalidEyebrow"), title: t("resetPasswordModal.invalidTitle"), subtitle: t("resetPasswordModal.invalidSubtitle") },
    ready: { eyebrow: t("resetPasswordModal.readyEyebrow"), title: t("resetPasswordModal.readyTitle"), subtitle: t("resetPasswordModal.readySubtitle") },
  };
}

// Modal de aterrizaje del enlace de recuperación (sharon.com/reset-password?token=...).
// Independiente de AuthModal: se abre directo desde App.jsx según la URL. El backend
// no expone forma de "pre-chequear" el token sin consumirlo (es de un solo uso), así
// que se muestra el formulario directamente si hay token en la URL; si el POST real
// responde PASSWORD_RESET_TOKEN_INVALID, ahí sí se cae al estado de enlace inválido/vencido.
export const ResetPasswordModal = ({ open, onClose, token, onRequestNewLink, onGoToLogin }) => {
  const { t } = useTranslation("auth");
  const STATUS_COPY = getStatusCopy(t);
  const [status, setStatus] = useState("ready");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const formRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setStatus(token ? "ready" : "invalid");
    setSuccess(false);
    setFormKey((k) => k + 1);
  }, [open, token]);

  const handleSubmit = async () => {
    if (!formRef.current) return;
    setSubmitting(true);
    const result = await formRef.current.submit();
    setSubmitting(false);
    if (result?.ok) setSuccess(true);
    else if (result?.tokenInvalid) setStatus("invalid");
  };

  const copy = success
    ? { eyebrow: t("resetPasswordModal.successEyebrow"), title: t("resetPasswordModal.successTitle") }
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
        <IconButton icon="close" size={38} iconSize={20} onClick={onClose} aria-label={t("resetPasswordModal.closeAria")} />
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
              {t("resetPasswordModal.successBody")}
            </p>
            <Button onClick={onGoToLogin} style={{ marginTop: 22 }}>
              {t("resetPasswordModal.goToLogin")}
            </Button>
          </div>
        ) : status === "invalid" ? (
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
            <Button onClick={onRequestNewLink}>{t("resetPasswordModal.requestNewLink")}</Button>
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
            {submitting ? t("resetPasswordModal.saving") : <>{t("resetPasswordModal.saveButton")} <Icon name="arrow" size={16} /></>}
          </Button>
        </div>
      )}
    </Modal>
  );
};
