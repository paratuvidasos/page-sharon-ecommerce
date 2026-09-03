import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
import { Button } from "@ui/components/Button";
import { Modal } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { DeleteAccountForm } from "./DeleteAccountForm";

// Modal de "eliminar mi cuenta" ([0010][BE]): pide confirmación explícita + contraseña
// antes de llamar al backend, y muestra una pantalla de éxito propia una vez la cuenta
// se elimina. Se renderiza como top-level en App.jsx (no anidado dentro de ProfileModal)
// a propósito — ver el comentario de `Z.deleteAccount` en shared/ui/zIndex.js: ProfileModal
// se auto-oculta apenas `user` pasa a null, y esta pantalla de éxito necesita sobrevivir
// justo ese momento. `onDeleted` avisa a App.jsx apenas el backend confirma el borrado,
// para que oculte ProfileModal por detrás sin esperar a que este modal se cierre.
export const DeleteAccountModal = ({ open, onClose, onDeleted }) => {
  const { t } = useTranslation("profile");
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const formRef = useRef(null);

  useEffect(() => {
    if (open) {
      setSuccess(false);
      setFormKey((k) => k + 1);
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!formRef.current) return;
    setSubmitting(true);
    const result = await formRef.current.submit();
    setSubmitting(false);
    if (result?.ok) {
      setSuccess(true);
      onDeleted?.();
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      zIndex={Z.deleteAccount}
      width="min(480px, 92vw)"
      labelledBy="delete-account-modal-title"
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
            <span style={{ width: 6, height: 6, borderRadius: 999, background: success ? "var(--botanic-deep)" : "#9C4A4A" }} />
            <span className="eyebrow" style={{ fontSize: 10, letterSpacing: ".14em" }}>
              {success ? t("deleteAccount.modal.eyebrowSuccess") : t("deleteAccount.modal.eyebrowDefault")}
            </span>
          </div>
          <div id="delete-account-modal-title" className="display" style={{ fontSize: 24, lineHeight: 1.15 }}>
            {success ? t("deleteAccount.modal.titleSuccess") : t("deleteAccount.modal.title")}
          </div>
          {!success && (
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 8, maxWidth: 360 }}>
              {t("deleteAccount.modal.subtitle")}
            </p>
          )}
        </div>
        <IconButton icon="close" size={38} iconSize={20} onClick={onClose} aria-label={t("deleteAccount.modal.close")} />
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
              {t("deleteAccount.modal.successMessage")}
            </p>
            <Button onClick={onClose} style={{ marginTop: 22 }}>
              {t("deleteAccount.modal.successOk")}
            </Button>
          </div>
        ) : (
          <DeleteAccountForm key={`delete-account-${formKey}`} ref={formRef} />
        )}
      </div>

      {!success && (
        <div style={{ padding: "18px 26px 24px", borderTop: "1px solid var(--line)", background: "#fff", flexShrink: 0 }}>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              width: "100%",
              justifyContent: "center",
              background: "#9C4A4A",
              opacity: submitting ? 0.6 : 1,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? t("deleteAccount.modal.submitting") : t("deleteAccount.modal.submit")}
          </Button>
        </div>
      )}
    </Modal>
  );
};
