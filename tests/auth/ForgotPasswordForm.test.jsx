import "@shared/i18n/i18n";
import { createRef } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ForgotPasswordForm } from "@features/auth/components/forgot-password/ForgotPasswordForm";
import { requestPasswordReset } from "@shared/api-client";

jest.mock("@shared/api-client", () => ({
  requestPasswordReset: jest.fn(),
}));

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

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    requestPasswordReset.mockReset();
  });

  it("blocks submit when the email is empty", async () => {
    const ref = createRef();
    render(<ForgotPasswordForm ref={ref} />);

    const result = await submit(ref);

    expect(result).toEqual({ ok: false });
    expect(requestPasswordReset).not.toHaveBeenCalled();
    expect(screen.getByText("Hay campos por revisar")).toBeInTheDocument();
  });

  it("blocks submit when the email is malformed", async () => {
    const user = userEvent.setup();
    const ref = createRef();
    render(<ForgotPasswordForm ref={ref} />);

    await user.type(screen.getByPlaceholderText("tucorreo@ejemplo.com"), "not-an-email");
    const result = await submit(ref);

    expect(result).toEqual({ ok: false });
    expect(requestPasswordReset).not.toHaveBeenCalled();
  });

  it("requests a reset link and returns the email on success", async () => {
    requestPasswordReset.mockResolvedValue({});
    const user = userEvent.setup();
    const ref = createRef();
    render(<ForgotPasswordForm ref={ref} />);

    await user.type(screen.getByPlaceholderText("tucorreo@ejemplo.com"), "sharon@ejemplo.com");
    const result = await submit(ref);

    expect(requestPasswordReset).toHaveBeenCalledWith("sharon@ejemplo.com");
    expect(result).toEqual({ ok: true, info: { email: "sharon@ejemplo.com" } });
  });

  it("shows a generic error message when the request fails", async () => {
    requestPasswordReset.mockRejectedValue(new Error("network down"));
    const user = userEvent.setup();
    const ref = createRef();
    render(<ForgotPasswordForm ref={ref} />);

    await user.type(screen.getByPlaceholderText("tucorreo@ejemplo.com"), "sharon@ejemplo.com");
    const result = await submit(ref);

    expect(result).toEqual({ ok: false });
    await waitFor(() => {
      expect(screen.getByText("No pudimos enviar el enlace. Intenta de nuevo en unos segundos.")).toBeInTheDocument();
    });
  });
});
