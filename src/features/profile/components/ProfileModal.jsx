import { useEffect, useRef, useState } from "react";
import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
import { Button } from "@ui/components/Button";
import { Modal, MODAL_CLOSE_MS } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { ProfileForm } from "./ProfileForm";

const SAVED_BANNER_MS = 3000;

// Modal de "editar perfil": envuelve ProfileForm con el shell (header, cuerpo con
// scroll, footer con el botón de guardar), igual que AuthModal/ResetPasswordModal.
// Al guardar, avisa al padre vía onSave para que el estado de sesión (App.jsx) se
// actualice de inmediato, y muestra un banner de confirmación breve sin cerrar el modal.
export const ProfileModal = ({ open, onClose, user, onSave }) => {
  const [submitting, setSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const [formKey, setFormKey] = useState(0);
  const formRef = useRef(null);
  const savedTimeoutRef = useRef(null);

  const close = () => {
    onClose();
    setSavedAt(0);
    setTimeout(() => setFormKey((k) => k + 1), MODAL_CLOSE_MS);
  };

  useEffect(() => () => {
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
  }, []);

  const handleSubmit = async () => {
    if (!formRef.current) return;
    setSubmitting(true);
    const result = await formRef.current.submit();
    setSubmitting(false);
    if (result?.ok) {
      onSave(result.profile);
      setSavedAt(Date.now());
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
      savedTimeoutRef.current = setTimeout(() => setSavedAt(0), SAVED_BANNER_MS);
    }
  };

  if (!user) return null;

  return (
    <Modal
      open={open}
      onClose={close}
      zIndex={Z.profile}
      width="min(480px, 92vw)"
      labelledBy="profile-modal-title"
      panelStyle={{
        maxHeight: "90vh",
        background: "var(--cream)",
        borderRadius: 24,
        boxShadow: "0 32px 80px rgba(27,24,21,.3)",
        border: ".5px solid var(--line)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
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
            <span className="eyebrow" style={{ fontSize: 10, letterSpacing: ".14em" }}>Tu cuenta</span>
          </div>
          <div id="profile-modal-title" className="display" style={{ fontSize: 24, lineHeight: 1.15 }}>
            Editar perfil
          </div>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 8, maxWidth: 360 }}>
            Actualiza tus datos. Los cambios se guardan de inmediato en tu cuenta.
          </p>
        </div>
        <IconButton icon="close" size={38} iconSize={20} onClick={close} aria-label="Cerrar" />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 26px" }}>
        {savedAt > 0 && (
          <div
            role="status"
            style={{
              background: "rgba(94,120,96,.1)",
              border: "1px solid rgba(94,120,96,.35)",
              borderRadius: 14,
              padding: "12px 18px",
              marginBottom: 20,
              fontSize: 13,
              color: "var(--botanic-deep)",
            }}
          >
            Cambios guardados.
          </div>
        )}
        <ProfileForm key={`profile-${formKey}`} ref={formRef} initialValues={user} />
      </div>

      <div style={{ padding: "18px 26px 24px", borderTop: "1px solid var(--line)", background: "#fff", flexShrink: 0 }}>
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: "100%",
            justifyContent: "center",
            opacity: submitting ? 0.6 : 1,
            cursor: submitting ? "not-allowed" : "pointer",
          }}
        >
          {submitting ? "Guardando…" : <>Guardar cambios <Icon name="arrow" size={16} /></>}
        </Button>
      </div>
    </Modal>
  );
};
