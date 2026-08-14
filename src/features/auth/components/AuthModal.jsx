import { useEffect, useRef, useState } from "react";
import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
import { Button } from "@ui/components/Button";
import { Modal, MODAL_CLOSE_MS } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { RegisterForm } from "./register/RegisterForm";
import { LoginForm } from "./login/LoginForm";
import { ForgotPasswordForm } from "./forgot-password/ForgotPasswordForm";

const DEMO_GOOGLE_ACCOUNT = { name: "Cuenta demo de Google", email: "demo.sharon@gmail.com" };

function getSuccessCopy(info) {
  if (!info) return { title: "", body: null };
  if (info.mode === "forgot") {
    return {
      title: "Revisa tu correo",
      body: (
        <>
          Si <strong>{info.email}</strong> tiene una cuenta con nosotros, te enviamos un enlace para definir una
          nueva contraseña. El enlace expira en 30 minutos.
        </>
      ),
    };
  }
  if (info.mode === "register") {
    if (info.method === "google") {
      return {
        title: "¡Bienvenida a Sharon!",
        body: <>Tu cuenta quedó vinculada a <strong>{info.email}</strong> a través de Google. Ya puedes comprar.</>,
      };
    }
    return {
      title: "¡Bienvenida a Sharon!",
      body: (
        <>
          Te enviamos un correo de verificación a <strong>{info.email}</strong>. Ya puedes usar tu cuenta,
          con acceso limitado hasta que la verifiques.
        </>
      ),
    };
  }
  if (info.method === "google") {
    return {
      title: "¡Hola de nuevo!",
      body: <>Iniciaste sesión con tu cuenta de Google (<strong>{info.email}</strong>).</>,
    };
  }
  return {
    title: "¡Hola de nuevo!",
    body: "Ya iniciaste sesión con tu cuenta de Sharon.",
  };
}

async function signInWithGoogle() {
  // Sin Google Client ID / backend todavía: simula el flujo con una cuenta de prueba.
  // Reemplazar por Google Identity Services real cuando haya backend para verificar el token.
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { ...DEMO_GOOGLE_ACCOUNT };
}

export const AuthModal = ({ open, onClose, initialMode = "register", onAuthSuccess }) => {
  const [mode, setMode] = useState(initialMode);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [loginLocked, setLoginLocked] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const [googleDialogOpen, setGoogleDialogOpen] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const googleButtonRef = useRef(null);
  const googleDialogRef = useRef(null);

  const registerFormRef = useRef(null);
  const loginFormRef = useRef(null);
  const forgotFormRef = useRef(null);

  const reset = () => {
    setMode(initialMode);
    setSubmitting(false);
    setSuccess(false);
    setSuccessInfo(null);
    setLoginLocked(false);
    setGoogleDialogOpen(false);
    setGoogleLoading(false);
    setGoogleError("");
    // RegisterForm/LoginForm/ForgotPasswordForm se remontan limpios (su propio estado interno se descarta).
    setFormKey((k) => k + 1);
  };

  const close = () => {
    onClose();
    setTimeout(reset, MODAL_CLOSE_MS);
  };

  useEffect(() => {
    if (googleDialogOpen && googleDialogRef.current) googleDialogRef.current.focus();
  }, [googleDialogOpen]);

  // El padre puede pedir un tab de arranque distinto (ej. volver del flujo de
  // restablecimiento directo a "login"); esto sincroniza el tab cada vez que se abre.
  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  const handleSubmit = async () => {
    const formRef = mode === "register" ? registerFormRef : mode === "login" ? loginFormRef : forgotFormRef;
    if (!formRef.current) return;
    setSubmitting(true);
    const result = await formRef.current.submit();
    setSubmitting(false);
    if (result?.ok) {
      setSuccessInfo({ ...result.info, mode });
      setSuccess(true);
      if (mode !== "forgot") onAuthSuccess?.({ name: result.info.name, email: result.info.email });
    }
  };

  const handleGoogleCancel = () => {
    setGoogleDialogOpen(false);
    if (googleButtonRef.current) googleButtonRef.current.focus();
  };

  const handleGoogleContinue = async () => {
    setGoogleDialogOpen(false);
    setGoogleError("");
    setGoogleLoading(true);
    try {
      const profile = await signInWithGoogle();
      setSuccessInfo({ method: "google", mode, email: profile.email, name: profile.name });
      setSuccess(true);
      onAuthSuccess?.({ name: profile.name, email: profile.email });
    } catch {
      setGoogleError("No pudimos conectar con Google. Intenta de nuevo.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const busy = submitting || googleLoading || (mode === "login" && loginLocked);
  const successCopy = success ? getSuccessCopy(successInfo) : null;

  return (
    <>
      <Modal
        open={open}
        onClose={close}
        zIndex={Z.auth}
        width="min(560px, 92vw)"
        labelledBy="auth-modal-title"
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
            position: "relative",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            padding: "22px 26px",
            borderBottom: "1px solid var(--line)",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 100 200"
            style={{ position: "absolute", top: -40, right: -10, width: 90, height: 180, opacity: 0.06, pointerEvents: "none", color: "var(--botanic-deep)" }}
          >
            <path fill="currentColor" d="M50 5C30 30 18 70 26 110c6 30 22 50 24 80 0-30 14-50 24-78 12-40 0-80-24-107z" />
          </svg>
          <div style={{ position: "relative" }}>
            {mode === "forgot" && !success && (
              <button
                type="button"
                onClick={() => setMode("login")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  background: "none",
                  border: 0,
                  padding: 0,
                  marginBottom: 10,
                  fontSize: 12.5,
                  color: "var(--ink-soft)",
                  cursor: "pointer",
                }}
              >
                <Icon name="chev-l" size={14} /> Volver a iniciar sesión
              </button>
            )}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--botanic-deep)" }} />
              <span className="eyebrow" style={{ fontSize: 10, letterSpacing: ".14em" }}>
                {mode === "register" ? "Crea tu cuenta" : mode === "login" ? "Inicia sesión" : "Recupera tu acceso"}
              </span>
            </div>
            <div id="auth-modal-title" className="display" style={{ fontSize: 26, lineHeight: 1.1 }}>
              {mode === "register" ? (
                <>Empieza tus <span className="script" style={{ color: "var(--botanic-deep)" }}>hábitos</span></>
              ) : mode === "login" ? (
                <>Vuelve a tus <span className="script" style={{ color: "var(--botanic-deep)" }}>hábitos</span></>
              ) : (
                <>Recupera tu <span className="script" style={{ color: "var(--botanic-deep)" }}>acceso</span></>
              )}
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 8, maxWidth: 380 }}>
              {mode === "register"
                ? "Guarda tus datos, direcciones y el historial de tus pedidos en un solo lugar."
                : mode === "login"
                  ? "Ingresa con tu correo o continúa con Google."
                  : "Escribe tu correo y te enviaremos un enlace para definir una nueva contraseña. Expira en 30 minutos."}
            </p>
            {!success && mode !== "forgot" && (
              <div style={{ display: "inline-flex", gap: 8, marginTop: 16 }} role="group" aria-label="Elige registrarte o iniciar sesión">
                <Button type="button" size="sm" variant={mode === "register" ? "dark" : "ghost"} aria-pressed={mode === "register"} disabled={submitting} onClick={() => setMode("register")}>
                  Crear cuenta
                </Button>
                <Button type="button" size="sm" variant={mode === "login" ? "dark" : "ghost"} aria-pressed={mode === "login"} disabled={submitting} onClick={() => setMode("login")}>
                  Iniciar sesión
                </Button>
              </div>
            )}
          </div>
          <IconButton icon="close" size={38} iconSize={20} onClick={close} aria-label="Cerrar" />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 26px" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "24px 8px" }}>
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
              <div className="display" style={{ fontSize: 24 }}>{successCopy.title}</div>
              <p style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 12, lineHeight: 1.6 }}>
                {successCopy.body}
              </p>
              <Button onClick={close} style={{ marginTop: 22 }}>
                Listo
              </Button>
            </div>
          ) : (
            <>
              <div style={{ display: mode === "register" ? "block" : "none" }}>
                <RegisterForm key={`register-${formKey}`} ref={registerFormRef} />
              </div>
              <div style={{ display: mode === "login" ? "block" : "none" }}>
                <LoginForm
                  key={`login-${formKey}`}
                  ref={loginFormRef}
                  onLockChange={setLoginLocked}
                  onForgotPassword={() => setMode("forgot")}
                />
              </div>
              <div style={{ display: mode === "forgot" ? "block" : "none" }}>
                <ForgotPasswordForm key={`forgot-${formKey}`} ref={forgotFormRef} />
              </div>
            </>
          )}
        </div>

        {!success && (
          <div
            style={{
              padding: "18px 26px 24px",
              borderTop: "1px solid var(--line)",
              background: "#fff",
              flexShrink: 0,
            }}
          >
            <Button
              onClick={handleSubmit}
              disabled={busy}
              style={{
                width: "100%",
                justifyContent: "center",
                opacity: busy ? 0.6 : 1,
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              {submitting
                ? mode === "register" ? "Creando cuenta…" : mode === "login" ? "Iniciando sesión…" : "Enviando enlace…"
                : mode === "forgot"
                  ? <>Enviar enlace <Icon name="arrow" size={16} /></>
                  : <>{mode === "register" ? "Crear cuenta" : "Iniciar sesión"} <Icon name="arrow" size={16} /></>}
            </Button>

            {mode !== "forgot" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 0" }}>
                  <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
                  <span className="eyebrow" style={{ fontSize: 10 }}>o</span>
                  <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
                </div>

                {googleError && (
                  <div role="alert" style={{ fontSize: 12, color: "#7A3535", marginBottom: 10, textAlign: "center" }}>
                    {googleError}
                  </div>
                )}

                <Button
                  ref={googleButtonRef}
                  type="button"
                  variant="ghost"
                  disabled={busy}
                  onClick={() => setGoogleDialogOpen(true)}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    gap: 10,
                    opacity: busy ? 0.6 : 1,
                    cursor: busy ? "not-allowed" : "pointer",
                  }}
                >
                  <Icon name="google" size={18} /> {googleLoading ? "Conectando con Google…" : "Continuar con Google"}
                </Button>
              </>
            )}

            <div style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: 11, marginTop: 10 }}>
              {mode === "register"
                ? "Al crear tu cuenta aceptas nuestros términos y condiciones."
                : mode === "login"
                  ? "Al iniciar sesión aceptas nuestros términos y condiciones."
                  : "Te enviaremos un correo con las instrucciones para continuar."}
            </div>
          </div>
        )}
      </Modal>

      {/* Diálogo simulado de Google — sin backend/Client ID todavía, ver signInWithGoogle() arriba */}
      <Modal
        ref={googleDialogRef}
        open={googleDialogOpen}
        onClose={handleGoogleCancel}
        zIndex={Z.googleDialog}
        width="min(360px, 88vw)"
        speed="fast"
        closeOnEscape
        ariaLabel="Continuar con Google (simulación)"
        overlayStyle={{ background: "rgba(27,24,21,.55)", backdropFilter: "blur(4px)" }}
        panelStyle={{
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 24px 64px rgba(27,24,21,.35)",
          border: ".5px solid var(--line)",
          padding: "22px 22px 18px",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="google" size={16} />
          <span className="eyebrow" style={{ fontSize: 10 }}>Simulación · Google</span>
        </div>
        <p style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 8, lineHeight: 1.5 }}>
          Conectaremos tu cuenta de Google real cuando el backend esté listo. Por ahora, elige la cuenta de
          prueba para continuar.
        </p>

        <button
          type="button"
          onClick={handleGoogleContinue}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            marginTop: 16,
            border: ".5px solid var(--line)",
            borderRadius: 14,
            background: "#fff",
            cursor: "pointer",
            textAlign: "left",
            transition: "background .2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cream-2)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "var(--botanic-muted)",
              color: "var(--botanic-deep)",
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--serif)",
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            D
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{DEMO_GOOGLE_ACCOUNT.name}</div>
            <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{DEMO_GOOGLE_ACCOUNT.email}</div>
          </div>
        </button>

        <Button type="button" variant="ghost" size="sm" onClick={handleGoogleCancel} style={{ width: "100%", justifyContent: "center", marginTop: 12 }}>
          Cancelar
        </Button>
      </Modal>

      <style>{`
        @media (max-width: 560px) {
          .auth-form {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
};
