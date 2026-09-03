import "@shared/i18n/i18n";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EmailVerificationModal } from "@features/auth/components/verify-email/EmailVerificationModal";
import { verifyEmail } from "@shared/api-client";

jest.mock("@shared/api-client", () => ({
  verifyEmail: jest.fn(),
}));

describe("EmailVerificationModal", () => {
  beforeEach(() => {
    verifyEmail.mockReset();
  });

  it("shows the checking state while verifyEmail is pending, then success", async () => {
    let resolveVerify;
    verifyEmail.mockReturnValue(new Promise((resolve) => (resolveVerify = resolve)));

    render(<EmailVerificationModal open token="tok_123" onClose={() => {}} onGoToLogin={() => {}} />);

    expect(screen.getByText("Verificando tu correo…")).toBeInTheDocument();
    expect(verifyEmail).toHaveBeenCalledWith("tok_123");

    resolveVerify({});
    await waitFor(() => {
      expect(screen.getByText("Correo verificado")).toBeInTheDocument();
    });
  });

  it("calls verifyEmail exactly once for the same token even if the effect re-runs", async () => {
    verifyEmail.mockResolvedValue({});
    const { rerender } = render(<EmailVerificationModal open token="tok_123" onClose={() => {}} onGoToLogin={() => {}} />);

    await waitFor(() => expect(screen.getByText("Correo verificado")).toBeInTheDocument());

    rerender(<EmailVerificationModal open token="tok_123" onClose={() => {}} onGoToLogin={() => {}} />);

    expect(verifyEmail).toHaveBeenCalledTimes(1);
  });

  it("shows the invalid-link state when verifyEmail rejects", async () => {
    verifyEmail.mockRejectedValue(new Error("token expired"));

    render(<EmailVerificationModal open token="tok_expired" onClose={() => {}} onGoToLogin={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText("No pudimos verificar tu correo")).toBeInTheDocument();
    });
  });

  it("shows the invalid-link state directly when there is no token", () => {
    render(<EmailVerificationModal open token={null} onClose={() => {}} onGoToLogin={() => {}} />);

    expect(screen.getByText("No pudimos verificar tu correo")).toBeInTheDocument();
    expect(verifyEmail).not.toHaveBeenCalled();
  });

  it("calls onGoToLogin from the success screen", async () => {
    verifyEmail.mockResolvedValue({});
    const onGoToLogin = jest.fn();
    const user = userEvent.setup();
    render(<EmailVerificationModal open token="tok_123" onClose={() => {}} onGoToLogin={onGoToLogin} />);

    await waitFor(() => screen.getByText("Correo verificado"));
    await user.click(screen.getByText("Iniciar sesión"));

    expect(onGoToLogin).toHaveBeenCalledTimes(1);
  });
});
