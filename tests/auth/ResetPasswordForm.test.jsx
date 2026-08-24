import { createRef } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordForm } from "@features/auth/components/reset-password/ResetPasswordForm";
import { resetPassword, ApiError } from "@shared/api-client";

jest.mock("@shared/api-client", () => {
  class ApiError extends Error {
    constructor(status, body) {
      super(body?.message || "Error de la API");
      this.status = status;
      this.code = body?.error;
    }
  }
  return {
    ApiError,
    resetPassword: jest.fn(),
  };
});

// submit() dispara un setState cuyo efecto de foco (useEffect sobre summaryToken/serverError)
// se agenda para después de que el await se resuelve; el tick extra le da a React margen
// para flushearlo dentro de act() y evita el warning "not wrapped in act(...)".
async function submit(ref) {
  let result;
  await act(async () => {
    result = await ref.current.submit();
    await Promise.resolve();
  });
  return result;
}

describe("ResetPasswordForm", () => {
  beforeEach(() => {
    resetPassword.mockReset();
  });

  it("blocks submit when the password is weak or the confirmation does not match", async () => {
    const user = userEvent.setup();
    const ref = createRef();
    render(<ResetPasswordForm ref={ref} token="tok_123" />);

    await user.type(screen.getByPlaceholderText("Mínimo 8 caracteres"), "short");
    await user.type(screen.getByPlaceholderText("Repite tu nueva contraseña"), "other");
    const result = await submit(ref);

    expect(result).toEqual({ ok: false });
    expect(resetPassword).not.toHaveBeenCalled();
    expect(screen.getByText("Hay campos por revisar")).toBeInTheDocument();
  });

  it("calls resetPassword with the token and new password on success", async () => {
    resetPassword.mockResolvedValue({});
    const user = userEvent.setup();
    const ref = createRef();
    render(<ResetPasswordForm ref={ref} token="tok_123" />);

    await user.type(screen.getByPlaceholderText("Mínimo 8 caracteres"), "clave1234");
    await user.type(screen.getByPlaceholderText("Repite tu nueva contraseña"), "clave1234");
    const result = await submit(ref);

    expect(resetPassword).toHaveBeenCalledWith({ token: "tok_123", newPassword: "clave1234", confirmPassword: "clave1234" });
    expect(result).toEqual({ ok: true });
  });

  it("reports tokenInvalid when the backend rejects the reset token", async () => {
    resetPassword.mockRejectedValue(new ApiError(400, { message: "Token inválido.", error: "PASSWORD_RESET_TOKEN_INVALID" }));
    const user = userEvent.setup();
    const ref = createRef();
    render(<ResetPasswordForm ref={ref} token="tok_expired" />);

    await user.type(screen.getByPlaceholderText("Mínimo 8 caracteres"), "clave1234");
    await user.type(screen.getByPlaceholderText("Repite tu nueva contraseña"), "clave1234");
    const result = await submit(ref);

    expect(result).toEqual({ ok: false, tokenInvalid: true });
  });

  it("shows a generic server error for any other failure", async () => {
    resetPassword.mockRejectedValue(new Error("network down"));
    const user = userEvent.setup();
    const ref = createRef();
    render(<ResetPasswordForm ref={ref} token="tok_123" />);

    await user.type(screen.getByPlaceholderText("Mínimo 8 caracteres"), "clave1234");
    await user.type(screen.getByPlaceholderText("Repite tu nueva contraseña"), "clave1234");
    const result = await submit(ref);

    expect(result).toEqual({ ok: false });
    await waitFor(() => {
      expect(screen.getByText("No pudimos actualizar tu contraseña. Intenta de nuevo en unos segundos.")).toBeInTheDocument();
    });
  });
});
