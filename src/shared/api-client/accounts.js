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
