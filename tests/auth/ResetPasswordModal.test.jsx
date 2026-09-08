import "@shared/i18n/i18n";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ResetPasswordModal } from "@features/auth/components/reset-password/ResetPasswordModal";
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

describe("ResetPasswordModal", () => {
  beforeEach(() => {
    resetPassword.mockReset();
  });

  it("shows the invalid-link screen when there is no token", () => {
    const onRequestNewLink = jest.fn();
    render(<ResetPasswordModal open token={null} onClose={() => {}} onRequestNewLink={onRequestNewLink} />);

    expect(screen.getByText("Este enlace no es válido")).toBeInTheDocument();
    expect(screen.queryByPlaceholderText("Mínimo 8 caracteres")).not.toBeInTheDocument();
  });

  it("renders the password form when a token is present", () => {
    render(<ResetPasswordModal open token="tok_123" onClose={() => {}} />);

    expect(screen.getByText("Define tu nueva contraseña")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Mínimo 8 caracteres")).toBeInTheDocument();
  });

  it("shows the success screen after saving a new password", async () => {
    resetPassword.mockResolvedValue({});
    const user = userEvent.setup();
    render(<ResetPasswordModal open token="tok_123" onClose={() => {}} />);

    await user.type(screen.getByPlaceholderText("Mínimo 8 caracteres"), "clave1234");
    await user.type(screen.getByPlaceholderText("Repite tu nueva contraseña"), "clave1234");
    await user.click(screen.getByText("Guardar nueva contraseña"));

    await waitFor(() => {
      expect(screen.getByText("Contraseña actualizada")).toBeInTheDocument();
    });
  });

  it("falls back to the invalid-link screen when the token is rejected on submit", async () => {
    resetPassword.mockRejectedValue(new ApiError(400, { message: "Token inválido.", error: "PASSWORD_RESET_TOKEN_INVALID" }));
    const user = userEvent.setup();
    render(<ResetPasswordModal open token="tok_expired" onClose={() => {}} />);

    await user.type(screen.getByPlaceholderText("Mínimo 8 caracteres"), "clave1234");
    await user.type(screen.getByPlaceholderText("Repite tu nueva contraseña"), "clave1234");
    await user.click(screen.getByText("Guardar nueva contraseña"));

    await waitFor(() => {
      expect(screen.getByText("Este enlace no es válido")).toBeInTheDocument();
    });
    expect(screen.getByText("Solicitar nuevo enlace")).toBeInTheDocument();
  });
});
