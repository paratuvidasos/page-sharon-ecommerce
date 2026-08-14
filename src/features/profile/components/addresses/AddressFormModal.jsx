import { useRef, useState } from "react";
import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
import { Button } from "@ui/components/Button";
import { Modal, MODAL_CLOSE_MS } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { AddressForm } from "./AddressForm";

// Modal delgado de agregar/editar una dirección, anidado dentro de AddressBookModal
// (mismo patrón que el diálogo de Google anidado en AuthModal). No es dueño de la
// lista de direcciones: solo junta los campos y se los pasa a onSave.
export const AddressFormModal = ({ open, onClose, address, onSave }) => {
  const [submitting, setSubmitting] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const formRef = useRef(null);
  const isEditing = Boolean(address);

  const close = () => {
    onClose();
    setTimeout(() => setFormKey((k) => k + 1), MODAL_CLOSE_MS);
  };

  const handleSubmit = async () => {
    if (!formRef.current) return;
    setSubmitting(true);
    const result = await formRef.current.submit();
    setSubmitting(false);
    if (result?.ok) {
      onSave(isEditing ? { ...address, ...result.address } : result.address);
      close();
    }
  };

  return (
    <Modal
      open={open}
      onClose={close}
      zIndex={Z.addressForm}
      width="min(440px, 92vw)"
      labelledBy="address-form-modal-title"
      panelStyle={{
        maxHeight: "88vh",
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
          padding: "20px 24px",
          borderBottom: "1px solid var(--line)",
          flexShrink: 0,
        }}
      >
        <div>
          <span className="eyebrow" style={{ fontSize: 10, letterSpacing: ".14em" }}>Direcciones</span>
          <div id="address-form-modal-title" className="display" style={{ fontSize: 22, marginTop: 6 }}>
            {isEditing ? "Editar dirección" : "Agregar dirección"}
          </div>
        </div>
        <IconButton icon="close" size={36} iconSize={18} onClick={close} aria-label="Cerrar" />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px" }}>
        <AddressForm key={`address-form-${formKey}`} ref={formRef} initialValues={address} />
      </div>

      <div style={{ padding: "16px 24px 20px", borderTop: "1px solid var(--line)", background: "#fff", flexShrink: 0 }}>
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
          {submitting ? "Guardando…" : <>{isEditing ? "Guardar cambios" : "Agregar dirección"} <Icon name="arrow" size={16} /></>}
        </Button>
      </div>
    </Modal>
  );
};
