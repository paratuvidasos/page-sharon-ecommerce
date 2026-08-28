import { useEffect, useState } from "react";
import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
import { Button } from "@ui/components/Button";
import { Modal } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { COUNTRIES } from "@shared/data/countries";
import { useAuth } from "@shared/auth/AuthContext";
import { listAddresses, deleteAddress, setDefaultAddress, archiveAddress, restoreAddress, ApiError } from "@shared/api-client";
import { AddressCard } from "./AddressCard";
import { AddressFormModal } from "./AddressFormModal";

// hasActiveOrder es puramente local: el backend de direcciones no sabe nada de pedidos
// (ver CLAUDE.md — orders y addresses siguen siendo dos simulaciones independientes),
// así que toda dirección que viene de la API arranca en false. blockedByActiveOrder
// nunca se activa hoy contra datos reales; queda listo para cuando exista ese vínculo.
function withLocalFields(apiAddresses) {
  return apiAddresses.map((a) => ({ ...a, hasActiveOrder: false }));
}

// Pantalla de gestión de direcciones, anidada dentro de ProfileModal (ver la regla de
// modales anidados en CLAUDE.md). Dueña de las llamadas a la API de
// direcciones (listar/eliminar/default/archive/restore); crear/editar vive en
// AddressForm (mismo patrón que ProfileForm con updateProfile). Tras cualquier
// mutación se recarga la lista completa en vez de parchear el estado local a mano,
// para heredar gratis reglas de negocio que ya vive en el backend (primera activa =
// predeterminada, promoción automática de la predeterminada al borrarla, etc.).
export const AddressBookModal = ({ open, onClose, addresses, setAddresses }) => {
  const { getAccessToken } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [pendingId, setPendingId] = useState(null);

  const refresh = async () => {
    setLoading(true);
    setActionError("");
    try {
      const list = await listAddresses(getAccessToken());
      setAddresses(withLocalFields(list));
    } catch {
      setActionError("No pudimos cargar tus direcciones. Intenta de nuevo en unos segundos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const openAdd = () => {
    setEditingAddress(null);
    setFormOpen(true);
  };
  const openEdit = (address) => {
    setEditingAddress(address);
    setFormOpen(true);
  };

  const runAction = async (id, action) => {
    setPendingId(id);
    setActionError("");
    try {
      await action();
      await refresh();
    } catch (e) {
      setActionError(e instanceof ApiError && e.message ? e.message : "No pudimos completar la acción. Intenta de nuevo.");
    } finally {
      setPendingId(null);
    }
  };

  const handleSetDefault = (id) => runAction(id, () => setDefaultAddress(id, getAccessToken()));
  const handleArchive = (id) => runAction(id, () => archiveAddress(id, getAccessToken()));
  const handleRestore = (id) => runAction(id, () => restoreAddress(id, getAccessToken()));
  const handleDelete = (id) => runAction(id, () => deleteAddress(id, getAccessToken()));

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
          {actionError && (
            <div
              role="alert"
              style={{
                background: "rgba(156,74,74,.08)",
                border: "1px solid rgba(156,74,74,.3)",
                borderRadius: 14,
                padding: "12px 18px",
                marginBottom: 16,
                fontSize: 13,
                color: "#7A3535",
              }}
            >
              {actionError}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px 8px", color: "var(--ink-soft)", fontSize: 13 }}>
              Cargando tus direcciones…
            </div>
          ) : addresses.length === 0 ? (
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
                pending={pendingId === address.id}
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

      <AddressFormModal open={formOpen} onClose={() => setFormOpen(false)} address={editingAddress} onSave={refresh} />
    </>
  );
};
