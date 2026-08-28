import { useEffect, useRef, useState } from "react";
import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
import { Button } from "@ui/components/Button";
import { Modal, MODAL_CLOSE_MS } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { ProfileForm } from "./ProfileForm";
import { CreatePasswordSection } from "./CreatePasswordSection";
import { AddressBookModal } from "./addresses/AddressBookModal";

const SAVED_BANNER_MS = 3000;

const linkBtnStyle = {
  background: "none",
  border: 0,
  padding: 0,
  fontSize: 12.5,
  color: "var(--ink)",
  textDecoration: "underline",
  cursor: "pointer",
};

// Modal de "editar perfil": envuelve ProfileForm con el shell (header, cuerpo con
// scroll, footer con el botón de guardar), igual que AuthModal/ResetPasswordModal.
// Al guardar, avisa al padre vía onSave para que el estado de sesión (App.jsx) se
// actualice de inmediato, y muestra un banner de confirmación breve sin cerrar el modal.
// También aloja la entrada a AddressBookModal (direcciones), anidada como hermana del
// Modal principal (mismo patrón que el diálogo de Google dentro de AuthModal) para
// que su propio overlay/panel no quede atrapado por el `transform` del panel de este
// Modal. El historial de pedidos ya no vive acá: se abre directo desde el menú
// desplegable de la cuenta (ver AccountMenu.jsx / App.jsx), no hace falta pasar por
// "Editar perfil" para verlo.
export const ProfileModal = ({ open, onClose, user, profileReady, hasPassword, onSave, addresses, setAddresses, onLogout, onLogoutAll, onOpenDeleteAccount }) => {
  const [submitting, setSubmitting] = useState(false);
  const [savedAt, setSavedAt] = useState(0);
  const [formKey, setFormKey] = useState(0);
  const [addressBookOpen, setAddressBookOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [loggingOutAll, setLoggingOutAll] = useState(false);
  const [confirmingLogoutAll, setConfirmingLogoutAll] = useState(false);
  const formRef = useRef(null);
  const savedTimeoutRef = useRef(null);
  const createPasswordRef = useRef(null);

  // `if (!user) return null` más abajo hace que este componente nunca se desmonte de
  // verdad al cerrar sesión (React conserva el mismo fiber, solo deja de renderizar
  // hijos) — así que loggingOut/loggingOutAll/confirmingLogoutAll sobreviven al
  // logout y reaparecen tal cual en el próximo login si no se resetean acá mismo,
  // sin depender de que el modal siga "vivo" cuando la llamada resuelve.
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await onLogout();
    } finally {
      setLoggingOut(false);
    }
  };

  const handleLogoutAll = async () => {
    setLoggingOutAll(true);
    try {
      await onLogoutAll();
    } finally {
      setLoggingOutAll(false);
      setConfirmingLogoutAll(false);
    }
  };

  const close = () => {
    onClose();
    setSavedAt(0);
    setTimeout(() => setFormKey((k) => k + 1), MODAL_CLOSE_MS);
  };

  const scrollToCreatePassword = () => {
    createPasswordRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
    <>
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
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--terracotta)" }} />
              <span className="eyebrow" style={{ fontSize: 10, letterSpacing: ".14em", color: "var(--terracotta-deep)" }}>Tu cuenta</span>
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
          {profileReady ? (
            <ProfileForm key={`profile-${formKey}`} ref={formRef} initialValues={user} />
          ) : (
            <div style={{ padding: "30px 0", textAlign: "center", fontSize: 13, color: "var(--ink-soft)" }}>
              Cargando tu perfil…
            </div>
          )}

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <div>
                <span className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 4 }}>Envíos</span>
                <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
                  {addresses.length === 0
                    ? "Sin direcciones guardadas"
                    : `${addresses.length} ${addresses.length === 1 ? "dirección guardada" : "direcciones guardadas"}`}
                </div>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => setAddressBookOpen(true)}>
                Gestionar direcciones
              </Button>
            </div>
          </div>

          {hasPassword === false && (
            <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
              <CreatePasswordSection ref={createPasswordRef} />
            </div>
          )}

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
            <span className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 10 }}>Sesión</span>
            {confirmingLogoutAll ? (
              <div
                style={{
                  padding: "10px 12px",
                  background: "rgba(156,74,74,.08)",
                  border: "1px solid rgba(156,74,74,.3)",
                  borderRadius: 12,
                }}
              >
                <p style={{ fontSize: 12.5, color: "#7A3535" }}>
                  ¿Cerrar sesión en todos tus dispositivos? Tendrás que iniciar sesión de nuevo en cada uno.
                </p>
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <Button type="button" size="sm" onClick={handleLogoutAll} disabled={loggingOutAll}>
                    {loggingOutAll ? "Cerrando…" : "Sí, cerrar todas"}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmingLogoutAll(false)}
                    disabled={loggingOutAll}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                <button type="button" onClick={handleLogout} disabled={loggingOut} style={linkBtnStyle}>
                  {loggingOut ? "Cerrando…" : "Cerrar sesión"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingLogoutAll(true)}
                  disabled={loggingOut}
                  style={{ ...linkBtnStyle, color: "#9C4A4A" }}
                >
                  Cerrar sesión en todos los dispositivos
                </button>
              </div>
            )}
          </div>

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
            <span className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 10, color: "#9C4A4A" }}>
              Zona de peligro
            </span>
            {hasPassword === false ? (
              <>
                <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 8, lineHeight: 1.5 }}>
                  Necesitas crear una contraseña antes de poder eliminar tu cuenta (tu cuenta llegó
                  por Google y hoy no tiene ninguna con la que confirmar el borrado).
                </p>
                <button type="button" onClick={scrollToCreatePassword} style={{ ...linkBtnStyle, color: "#9C4A4A" }}>
                  Crear contraseña
                </button>
              </>
            ) : (
              <button type="button" onClick={onOpenDeleteAccount} style={{ ...linkBtnStyle, color: "#9C4A4A" }}>
                Eliminar mi cuenta
              </button>
            )}
          </div>
        </div>

        <div style={{ padding: "18px 26px 24px", borderTop: "1px solid var(--line)", background: "#fff", flexShrink: 0 }}>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !profileReady}
            style={{
              width: "100%",
              justifyContent: "center",
              opacity: submitting || !profileReady ? 0.6 : 1,
              cursor: submitting || !profileReady ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Guardando…" : <>Guardar cambios <Icon name="arrow" size={16} /></>}
          </Button>
        </div>
      </Modal>

      <AddressBookModal
        open={addressBookOpen}
        onClose={() => setAddressBookOpen(false)}
        addresses={addresses}
        setAddresses={setAddresses}
      />
    </>
  );
};
