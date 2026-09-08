import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useSignIn } from "@clerk/react/legacy";
import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
import { Button } from "@ui/components/Button";
import { Modal, MODAL_CLOSE_MS } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { RegisterForm } from "./register/RegisterForm";
import { LoginForm } from "./login/LoginForm";
import { ForgotPasswordForm } from "./forgot-password/ForgotPasswordForm";
import { resendVerificationEmail } from "@shared/api-client";
import FotoRegistro from "@assets/img/sharon_img_2_square.jpg";
import FotoLogin from "@assets/img/sharon_img_4.jpg";

const RESEND_COOLDOWN_S = 45;

function getSuccessCopy(info, t) {
  if (!info) return { title: "", body: null };
  if (info.mode === "forgot") {
    return {
      title: t("authModal.success.forgotTitle"),
      body: (
        <Trans t={t} i18nKey="authModal.success.forgotBody" values={{ email: info.email }} components={{ strong: <strong /> }} />
      ),
    };
  }
  if (info.mode === "register") {
    return {
      title: t("authModal.success.registerTitle"),
      body: (
        <Trans t={t} i18nKey="authModal.success.registerBody" values={{ email: info.email }} components={{ strong: <strong /> }} />
      ),
    };
  }
  return {
    title: t("authModal.success.loginTitle"),
    body: t("authModal.success.loginBody"),
  };
}

// Contenido del panel de foto: distinto para registro y login (mismo shell de dos
// paneles, ver diseño 3a/4b — "4b repite la estructura de dos paneles del registro
// para que la pareja se lea como un solo sistema").
function getPhotoPanel(t) {
  return {
    register: {
      src: FotoRegistro,
      alt: t("authModal.photoPanel.register.alt"),
      tagline: t("authModal.photoPanel.register.tagline"),
      bullets: t("authModal.photoPanel.register.bullets", { returnObjects: true }),
    },
    login: {
      src: FotoLogin,
      alt: t("authModal.photoPanel.login.alt"),
      tagline: t("authModal.photoPanel.login.tagline"),
      bullets: [],
    },
  };
}

const AuthPhotoPanel = ({ mode }) => {
  const { t } = useTranslation("auth");
  const panel = getPhotoPanel(t)[mode];
  return (
    <div style={{ position: "relative", background: "var(--botanic-muted)", minHeight: 480 }} className="auth-photo">
      <img src={panel.src} alt={panel.alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(27,24,21,.35) 0%, rgba(27,24,21,.15) 40%, rgba(27,24,21,.82) 100%)",
      }} />
      <div style={{ position: "absolute", left: 26, top: 24, fontFamily: "var(--mono)", fontSize: 10, letterSpacing: ".2em", textTransform: "uppercase", color: "var(--cream)" }}>
        Sharon
      </div>
      <div style={{ position: "absolute", left: 26, right: 26, bottom: 26, color: "var(--cream)", display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="script" style={{ fontFamily: "var(--serif)", fontSize: 26, lineHeight: 1.15, fontStyle: "italic" }}>
          {panel.tagline}
        </div>
        {panel.bullets.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 12.5, color: "rgba(251,247,242,.86)" }}>
            {panel.bullets.map((b) => <span key={b}>✦ {b}</span>)}
          </div>
        )}
      </div>
    </div>
  );
};

export const AuthModal = ({ open, onClose, initialMode = "register", onAuthSuccess }) => {
  const { t } = useTranslation("auth");
  const { signIn, isLoaded: clerkLoaded } = useSignIn();
  const [mode, setMode] = useState(initialMode);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);
  const [loginLocked, setLoginLocked] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const [resendStatus, setResendStatus] = useState("idle"); // idle | sending | sent | error
  const [resendCooldown, setResendCooldown] = useState(0);
  const resendTimerRef = useRef(null);

  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const googleButtonRef = useRef(null);

  const registerFormRef = useRef(null);
  const loginFormRef = useRef(null);
  const forgotFormRef = useRef(null);

  const reset = () => {
    setMode(initialMode);
    setSubmitting(false);
    setSuccess(false);
    setSuccessInfo(null);
    setLoginLocked(false);
    setGoogleLoading(false);
    setGoogleError("");
    setResendStatus("idle");
    setResendCooldown(0);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    // RegisterForm/LoginForm/ForgotPasswordForm se remontan limpios (su propio estado interno se descarta).
    setFormKey((k) => k + 1);
  };

  const close = () => {
    onClose();
    setTimeout(reset, MODAL_CLOSE_MS);
  };

  useEffect(() => () => clearInterval(resendTimerRef.current), []);

  useEffect(() => {
    if (resendStatus === "sent" && resendCooldown === 0) setResendStatus("idle");
  }, [resendStatus, resendCooldown]);

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
      // El registro por correo ya no loguea automáticamente: el backend solo crea la
      // cuenta y envía el correo de verificación, sin devolver sesión (no hay endpoint
      // de login todavía). Login y Google sí siguen abriendo sesión localmente.
      if (mode === "login") {
        onAuthSuccess?.({
          name: result.info.name,
          email: result.info.email,
          apiUser: result.info.apiUser,
          accessToken: result.info.accessToken,
        });
      }
    }
  };

  const startResendCooldown = () => {
    setResendCooldown(RESEND_COOLDOWN_S);
    clearInterval(resendTimerRef.current);
    resendTimerRef.current = setInterval(() => {
      setResendCooldown((s) => {
        if (s <= 1) {
          clearInterval(resendTimerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  };

  const handleResendVerification = async () => {
    if (!successInfo?.email || resendStatus === "sending" || resendCooldown > 0) return;
    setResendStatus("sending");
    try {
      await resendVerificationEmail(successInfo.email);
      setResendStatus("sent");
      startResendCooldown();
    } catch {
      setResendStatus("error");
    }
  };

  // Continuar con Google navega fuera de la SPA (redirect real de OAuth vía Clerk) y
  // vuelve a "/sso-callback"; ClerkGoogleBridge (montado en App.jsx) es quien completa
  // el login local cuando la sesión de Clerk queda activa — este modal ya no sigue vivo
  // para recibirlo.
  const handleGoogleContinue = async () => {
    if (!clerkLoaded || googleLoading) return;
    setGoogleError("");
    setGoogleLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch {
      setGoogleError(t("authModal.googleGenericError"));
      setGoogleLoading(false);
    }
  };

  const busy = submitting || googleLoading || (mode === "login" && loginLocked);
  const successCopy = success ? getSuccessCopy(successInfo, t) : null;

  // Registro y login comparten el shell de dos paneles (diseño 3a/4b, ver
  // "Sharon Mejoras"): foto de marca a la izquierda + formulario a la derecha, con
  // tabs, CTA y Google resueltos dentro del mismo panel de formulario. "Olvidé mi
  // contraseña" y la pantalla de éxito quedan fuera de ese rediseño (no estaban en
  // alcance) y siguen usando el shell centrado de un solo panel de siempre.
  const twoPanel = !success && (mode === "register" || mode === "login");

  const ctaAndGoogle = () => (
    <>
      <Button
        onClick={handleSubmit}
        disabled={busy}
        style={{
          marginTop: 20, width: "100%", justifyContent: "center",
          opacity: busy ? 0.6 : 1, cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        {submitting
          ? mode === "register" ? t("authModal.creatingAccount") : t("authModal.signingIn")
          : <>{mode === "register" ? t("authModal.createAccountCta") : t("authModal.signInCta")} <Icon name="arrow" size={16} /></>}
      </Button>

      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
        <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
        <span className="eyebrow" style={{ fontSize: 9.5 }}>{t("authModal.or")}</span>
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
        disabled={busy || !clerkLoaded}
        onClick={handleGoogleContinue}
        style={{
          width: "100%", justifyContent: "center", gap: 10,
          opacity: busy ? 0.6 : 1, cursor: busy ? "not-allowed" : "pointer",
        }}
      >
        <Icon name="google" size={18} /> {googleLoading ? t("authModal.connectingGoogle") : t("authModal.continueWithGoogle")}
      </Button>

      <div style={{ fontSize: 11, color: "var(--ink-soft)", textAlign: "center", marginTop: 12 }}>
        <Trans
          t={t}
          i18nKey={mode === "register" ? "authModal.registerTermsNotice" : "authModal.loginTermsNotice"}
          components={{ link: <a href="#terminos" /> }}
        />
      </div>
    </>
  );

  return (
    <>
      <Modal
        open={open}
        onClose={close}
        zIndex={Z.auth}
        width={twoPanel ? "min(812px, 94vw)" : "min(560px, 92vw)"}
        labelledBy="auth-modal-title"
        panelStyle={{
          maxHeight: "90vh",
          background: "var(--cream)",
          borderRadius: 24,
          boxShadow: "0 32px 80px rgba(27,24,21,.3)",
          border: ".5px solid var(--line)",
          overflow: "hidden",
        }}
      >
        {twoPanel ? (
          <div style={{ display: "grid", gridTemplateColumns: ".78fr 1fr", maxHeight: "90vh", overflowY: "auto" }} className="auth-panels">
            <AuthPhotoPanel mode={mode} />

            <div style={{ position: "relative", padding: "32px 34px 30px", display: "flex", flexDirection: "column" }}>
              <IconButton
                icon="close"
                size={36}
                iconSize={16}
                onClick={close}
                aria-label={t("authModal.closeAria")}
                style={{ position: "absolute", right: 22, top: 22, background: "var(--cream-2)" }}
              />

              <div className="eyebrow" style={{ color: "var(--botanic-deep)" }}>
                {mode === "register" ? t("authModal.createAccountEyebrow") : t("authModal.signInEyebrow")}
              </div>
              <div id="auth-modal-title" className="display" style={{ fontSize: 30, lineHeight: 1.08, margin: "8px 0 0" }}>
                <Trans
                  t={t}
                  i18nKey={mode === "register" ? "authModal.startHabitsHeading" : "authModal.backToHabitsHeading"}
                  components={{ accent: <span className="script" style={{ color: "var(--botanic-deep)" }} /> }}
                />
              </div>

              <div style={{ display: "flex", gap: 24, margin: "18px 0 20px", borderBottom: "1px solid var(--line)" }} role="group" aria-label={t("authModal.modeGroupAria")}>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setMode("register")}
                  aria-pressed={mode === "register"}
                  style={{
                    background: "none", border: 0, padding: "0 0 11px", cursor: "pointer",
                    fontSize: 13.5, fontWeight: mode === "register" ? 600 : 500,
                    color: mode === "register" ? "var(--ink)" : "var(--ink-soft)",
                    borderBottom: mode === "register" ? "2px solid var(--ink)" : "2px solid transparent",
                    marginBottom: -1,
                  }}
                >
                  {t("authModal.createAccountTab")}
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setMode("login")}
                  aria-pressed={mode === "login"}
                  style={{
                    background: "none", border: 0, padding: "0 0 11px", cursor: "pointer",
                    fontSize: 13.5, fontWeight: mode === "login" ? 600 : 500,
                    color: mode === "login" ? "var(--ink)" : "var(--ink-soft)",
                    borderBottom: mode === "login" ? "2px solid var(--ink)" : "2px solid transparent",
                    marginBottom: -1,
                  }}
                >
                  {t("authModal.signInTab")}
                </button>
              </div>

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

              {ctaAndGoogle()}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", maxHeight: "90vh" }}>
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
                    <Icon name="chev-l" size={14} /> {t("authModal.backToLogin")}
                  </button>
                )}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--botanic-deep)" }} />
                  <span className="eyebrow" style={{ fontSize: 10, letterSpacing: ".14em" }}>
                    {success ? "" : t("authModal.recoverAccess")}
                  </span>
                </div>
                <div id="auth-modal-title" className="display" style={{ fontSize: 26, lineHeight: 1.1 }}>
                  {success ? successCopy.title : (
                    <Trans t={t} i18nKey="authModal.recoverAccessHeading" components={{ accent: <span className="script" style={{ color: "var(--botanic-deep)" }} /> }} />
                  )}
                </div>
                {!success && (
                  <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 8, maxWidth: 380 }}>
                    {t("authModal.forgotDescription")}
                  </p>
                )}
              </div>
              <IconButton icon="close" size={38} iconSize={20} onClick={close} aria-label={t("authModal.closeAria")} />
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
                  <p style={{ fontSize: 14, color: "var(--ink-soft)", marginTop: 12, lineHeight: 1.6 }}>
                    {successCopy.body}
                  </p>

                  {successInfo?.mode === "register" && (
                    <div style={{ marginTop: 14 }}>
                      {resendStatus === "sent" ? (
                        <p style={{ fontSize: 12.5, color: "var(--botanic-deep)" }}>
                          {t("authModal.resendEmailResent")}
                          {resendCooldown > 0 && t("authModal.resendEmailCooldownSuffix", { seconds: resendCooldown })}
                        </p>
                      ) : (
                        <>
                          {resendStatus === "error" && (
                            <p role="alert" style={{ fontSize: 12.5, color: "#7A3535", marginBottom: 6 }}>
                              {t("authModal.resendEmailError")}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={handleResendVerification}
                            disabled={resendStatus === "sending" || resendCooldown > 0}
                            style={{
                              background: "none",
                              border: 0,
                              padding: 0,
                              fontSize: 12.5,
                              color: "var(--ink-soft)",
                              textDecoration: "underline",
                              cursor: resendStatus === "sending" || resendCooldown > 0 ? "not-allowed" : "pointer",
                              opacity: resendStatus === "sending" || resendCooldown > 0 ? 0.6 : 1,
                            }}
                          >
                            {resendStatus === "sending"
                              ? t("authModal.resendEmailSending")
                              : resendCooldown > 0
                                ? t("authModal.resendEmailWithCooldown", { seconds: resendCooldown })
                                : t("authModal.resendEmail")}
                          </button>
                        </>
                      )}
                      <p style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 8 }}>
                        {t("authModal.linkExpires")}
                      </p>
                    </div>
                  )}

                  <Button onClick={close} style={{ marginTop: 22 }}>
                    {t("authModal.done")}
                  </Button>
                </div>
              ) : (
                <ForgotPasswordForm key={`forgot-${formKey}`} ref={forgotFormRef} />
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
                  {submitting ? t("authModal.sendingLink") : <>{t("authModal.sendLink")} <Icon name="arrow" size={16} /></>}
                </Button>
                <div style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: 11, marginTop: 10 }}>
                  {t("authModal.sendLinkNotice")}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <style>{`
        @media (max-width: 720px) {
          .auth-panels {
            grid-template-columns: 1fr !important;
          }
          .auth-photo {
            display: none;
          }
        }
        @media (max-width: 560px) {
          .auth-form {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </>
  );
};
