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
