import { useLocation } from "react-router-dom";
import { AuthenticateWithRedirectCallback } from "@clerk/react";

// Punto de aterrizaje del redirect de OAuth (Google) que arma Clerk desde
// AuthModal.handleGoogleContinue. No renderiza nada visible: solo completa el
// intercambio del código de Clerk y navega a "/" cuando termina. El login local
// real (AuthContext) lo completa ClerkGoogleBridge en App.jsx al detectar la
// sesión de Clerk activa, no este componente.
export const SsoCallbackHandler = () => {
  const location = useLocation();
  if (location.pathname !== "/sso-callback") return null;
  return <AuthenticateWithRedirectCallback signInFallbackRedirectUrl="/" signUpFallbackRedirectUrl="/" />;
};
