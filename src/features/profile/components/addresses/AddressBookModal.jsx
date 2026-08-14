import { useState } from "react";
import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
import { Button } from "@ui/components/Button";
import { Modal } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { COUNTRIES } from "@shared/data/countries";
import { AddressCard } from "./AddressCard";
import { AddressFormModal } from "./AddressFormModal";

const generateId = () => `addr_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// Pantalla de gestión de direcciones, anidada dentro de ProfileModal (mismo patrón
// que CheckoutModal anidado en CartDrawer). Dueña de las reglas de negocio de la
// lista (única predeterminada, no borrar la última si tiene un pedido en curso,
// archivar/restaurar); AddressFormModal solo junta los campos de un formulario.
export const AddressBookModal = ({ open, onClose, addresses, setAddresses }) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const openAdd = () => {
    setEditingAddress(null);
    setFormOpen(true);
  };
  const openEdit = (address) => {
    setEditingAddress(address);
    setFormOpen(true);
  };

  const handleSaveAddress = (fields) => {
    setAddresses((prev) => {
      if (fields.id) return prev.map((a) => (a.id === fields.id ? fields : a));
      const isFirstActive = prev.filter((a) => !a.archived).length === 0;
      return [...prev, { ...fields, id: generateId(), isDefault: isFirstActive, archived: false, hasActiveOrder: false }];
    });
  };

  const handleSetDefault = (id) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
  };

  const handleArchive = (id) => {
    setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, archived: true, isDefault: false } : a)));
  };

  const handleRestore = (id) => {
    setAddresses((prev) => prev.map((a) => (a.id === id ? { ...a, archived: false } : a)));
  };

  const handleDelete = (id) => {
    setAddresses((prev) => {
      const target = prev.find((a) => a.id === id);
      const next = prev.filter((a) => a.id !== id);
      // Si borramos la predeterminada y quedan otras activas, promovemos la primera.
      if (target?.isDefault) {
        const idx = next.findIndex((a) => !a.archived);
        if (idx !== -1) next[idx] = { ...next[idx], isDefault: true };
      }
      return next;
    });
  };

  const activeCount = addresses.filter((a) => !a.archived).length;

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        zIndex={Z.addressBook}
        width="min(560px, 92vw)"
        labelledBy="address-book-title"
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
            padding: "22px 26px",
            borderBottom: "1px solid var(--line)",
            flexShrink: 0,
          }}
        >
          <div>
            <span className="eyebrow" style={{ fontSize: 10, letterSpacing: ".14em" }}>Envíos</span>
            <div id="address-book-title" className="display" style={{ fontSize: 24, marginTop: 6 }}>
              Direcciones guardadas
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 8, maxWidth: 380 }}>
              Agrega, edita o marca la dirección que usamos por defecto en tus pedidos.
            </p>
          </div>
          <IconButton icon="close" size={38} iconSize={20} onClick={onClose} aria-label="Cerrar" />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 26px" }}>
          {addresses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 8px", color: "var(--ink-soft)" }}>
              <Icon name="pin" size={26} />
              <p style={{ fontSize: 13, marginTop: 10 }}>Todavía no tienes direcciones guardadas.</p>
            </div>
          ) : (
            addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                country={COUNTRIES.find((c) => c.code === address.countryCode)}
                blockedByActiveOrder={!address.archived && address.hasActiveOrder && activeCount === 1}
                onEdit={() => openEdit(address)}
                onSetDefault={() => handleSetDefault(address.id)}
                onArchive={() => handleArchive(address.id)}
                onRestore={() => handleRestore(address.id)}
                onDelete={() => handleDelete(address.id)}
              />
            ))
          )}
        </div>

        <div style={{ padding: "16px 26px 22px", borderTop: "1px solid var(--line)", background: "#fff", flexShrink: 0 }}>
          <Button type="button" variant="ghost" onClick={openAdd} style={{ width: "100%", justifyContent: "center", gap: 8 }}>
            <Icon name="plus" size={16} /> Agregar dirección
          </Button>
        </div>
      </Modal>

      <AddressFormModal open={formOpen} onClose={() => setFormOpen(false)} address={editingAddress} onSave={handleSaveAddress} />
    </>
  );
};
