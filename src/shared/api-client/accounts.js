import { request } from "./http";

export function registerAccount({ firstName, lastName, email, password, confirmPassword }) {
  return request("/accounts/register", {
    method: "POST",
    body: { firstName, lastName, email, password, confirmPassword },
  });
}

export function verifyEmail(token) {
  return request(`/accounts/verify-email?token=${encodeURIComponent(token)}`);
}

export function resendVerificationEmail(email) {
  return request("/accounts/resend-verification-email", {
    method: "POST",
    body: { email },
  });
}

export function loginAccount({ email, password, rememberMe }) {
  return request("/accounts/login", {
    method: "POST",
    body: { email, password, rememberMe },
  });
}

// El sessionToken viene de Clerk (getToken() de useAuth()/useSession()) tras completar
// "Continuar con Google" — el backend lo verifica server-side y vincula por email o crea
// la cuenta. Responde con el mismo shape que loginAccount (accessToken + refresh_token
// como cookie httpOnly), así que del lado del cliente se trata exactamente como un login.
export function loginWithGoogle({ sessionToken, rememberMe }) {
  return request("/accounts/oauth/google", {
    method: "POST",
    body: { sessionToken, rememberMe },
  });
}

export function refreshToken() {
  return request("/accounts/refresh-token", { method: "POST" });
}

export function requestPasswordReset(email) {
  return request("/accounts/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export function resetPassword({ token, newPassword, confirmPassword }) {
  return request("/accounts/reset-password", {
    method: "POST",
    body: { token, newPassword, confirmPassword },
  });
}

export function getMyProfile(accessToken) {
  return request("/accounts/me", { token: accessToken });
}

export function logoutAccount() {
  return request("/accounts/logout", { method: "POST" });
}

export function logoutAllAccounts(accessToken) {
  return request("/accounts/logout-all", { method: "POST", token: accessToken });
}

// Solo válido para cuentas sin contraseña propia (hasPassword === false en GET /accounts/me,
// ej. cuentas creadas solo por Google) — el backend responde 409 si la cuenta ya tenía una.
export function setPassword({ newPassword, accessToken }) {
  return request("/accounts/set-password", {
    method: "POST",
    body: { newPassword },
    token: accessToken,
  });
}

export function deleteAccount({ password, reason, accessToken }) {
  return request("/accounts/me", {
    method: "DELETE",
    body: reason ? { password, reason } : { password },
    token: accessToken,
  });
}

export function updateProfile({ firstName, lastName, phone, phoneCountryCode, avatarFile, accessToken }) {
  const formData = new FormData();
  formData.append("firstName", firstName);
  formData.append("lastName", lastName);
  formData.append("phone", phone);
  formData.append("phoneCountryCode", phoneCountryCode);
  if (avatarFile) formData.append("avatar", avatarFile);

  return request("/accounts/me", {
    method: "PATCH",
    body: formData,
    token: accessToken,
  });
}
