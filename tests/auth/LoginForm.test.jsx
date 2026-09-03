import "@shared/i18n/i18n";
import { createRef } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@features/auth/components/login/LoginForm";
import { loginAccount, ApiError } from "@shared/api-client";

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
    loginAccount: jest.fn(),
  };
});

const REMEMBERED_EMAIL_KEY = "sharon:rememberedEmail";

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

describe("LoginForm", () => {
  beforeEach(() => {
    loginAccount.mockReset();
    localStorage.clear();
  });

  it("blocks submit and shows a validation summary when fields are empty", async () => {
    const ref = createRef();
    render(<LoginForm ref={ref} />);

    const result = await submit(ref);

    expect(result).toEqual({ ok: false });
    expect(loginAccount).not.toHaveBeenCalled();
    expect(screen.getByText("Hay campos por revisar")).toBeInTheDocument();
  });

  it("logs in and returns the user/token info on success", async () => {
    const apiUser = { firstName: "Sharon", lastName: "Rojas", email: "sharon@ejemplo.com" };
    loginAccount.mockResolvedValue({ user: apiUser, accessToken: "token-abc" });
    const user = userEvent.setup();
    const ref = createRef();
    render(<LoginForm ref={ref} />);

    await user.type(screen.getByPlaceholderText("tucorreo@ejemplo.com"), "sharon@ejemplo.com");
    await user.type(screen.getByPlaceholderText("Tu contraseña"), "clave1234");
    const result = await submit(ref);

    expect(loginAccount).toHaveBeenCalledWith({ email: "sharon@ejemplo.com", password: "clave1234" });
    expect(result).toEqual({
      ok: true,
      info: {
        method: "email",
        mode: "login",
        email: "sharon@ejemplo.com",
        name: "Sharon Rojas",
        apiUser,
        accessToken: "token-abc",
      },
    });
  });

  it("stores the remembered email when rememberMe is checked", async () => {
    loginAccount.mockResolvedValue({ user: { firstName: "S", lastName: "R", email: "sharon@ejemplo.com" }, accessToken: "t" });
    const user = userEvent.setup();
    const ref = createRef();
    render(<LoginForm ref={ref} />);

    await user.type(screen.getByPlaceholderText("tucorreo@ejemplo.com"), "sharon@ejemplo.com");
    await user.type(screen.getByPlaceholderText("Tu contraseña"), "clave1234");
    await user.click(screen.getByRole("checkbox"));
    await submit(ref);

    expect(localStorage.getItem(REMEMBERED_EMAIL_KEY)).toBe("sharon@ejemplo.com");
  });

  it("clears the remembered email when rememberMe is unchecked", async () => {
    localStorage.setItem(REMEMBERED_EMAIL_KEY, "old@ejemplo.com");
    loginAccount.mockResolvedValue({ user: { firstName: "S", lastName: "R", email: "sharon@ejemplo.com" }, accessToken: "t" });
    const user = userEvent.setup();
    const ref = createRef();
    render(<LoginForm ref={ref} />);

    // El componente precarga el email recordado y marca "recordarme" en un efecto;
    // lo desmarcamos antes de reenviar el formulario con otro correo.
    await user.click(screen.getByRole("checkbox"));
    const emailInput = screen.getByPlaceholderText("tucorreo@ejemplo.com");
    await user.clear(emailInput);
    await user.type(emailInput, "sharon@ejemplo.com");
    await user.type(screen.getByPlaceholderText("Tu contraseña"), "clave1234");
    await submit(ref);

    expect(localStorage.getItem(REMEMBERED_EMAIL_KEY)).toBeNull();
  });

  it("locks the account and notifies the parent on ACCOUNT_LOCKED", async () => {
    loginAccount.mockRejectedValue(new ApiError(423, { message: "Cuenta bloqueada temporalmente.", error: "ACCOUNT_LOCKED" }));
    const onLockChange = jest.fn();
    const user = userEvent.setup();
    const ref = createRef();
    render(<LoginForm ref={ref} onLockChange={onLockChange} />);

    await user.type(screen.getByPlaceholderText("tucorreo@ejemplo.com"), "sharon@ejemplo.com");
    await user.type(screen.getByPlaceholderText("Tu contraseña"), "clave1234");
    const result = await submit(ref);

    expect(result).toEqual({ ok: false });
    expect(onLockChange).toHaveBeenCalledWith(true);
    await waitFor(() => {
      expect(screen.getByText("Cuenta bloqueada temporalmente.")).toBeInTheDocument();
    });
  });

  it("shows the backend message on INVALID_CREDENTIALS", async () => {
    loginAccount.mockRejectedValue(new ApiError(401, { message: "Correo o contraseña incorrectos.", error: "INVALID_CREDENTIALS" }));
    const user = userEvent.setup();
    const ref = createRef();
    render(<LoginForm ref={ref} />);

    await user.type(screen.getByPlaceholderText("tucorreo@ejemplo.com"), "sharon@ejemplo.com");
    await user.type(screen.getByPlaceholderText("Tu contraseña"), "clave1234");
    await submit(ref);

    await waitFor(() => {
      expect(screen.getByText("Correo o contraseña incorrectos.")).toBeInTheDocument();
    });
  });

  it("shows a generic message on a non-ApiError failure", async () => {
    loginAccount.mockRejectedValue(new Error("network down"));
    const user = userEvent.setup();
    const ref = createRef();
    render(<LoginForm ref={ref} />);

    await user.type(screen.getByPlaceholderText("tucorreo@ejemplo.com"), "sharon@ejemplo.com");
    await user.type(screen.getByPlaceholderText("Tu contraseña"), "clave1234");
    await submit(ref);

    await waitFor(() => {
      expect(screen.getByText("No pudimos iniciar tu sesión. Intenta de nuevo en unos segundos.")).toBeInTheDocument();
    });
  });

  it("calls onForgotPassword when the link is clicked", async () => {
    const onForgotPassword = jest.fn();
    const user = userEvent.setup();
    render(<LoginForm onForgotPassword={onForgotPassword} />);

    await user.click(screen.getByText("¿Olvidaste tu contraseña?"));

    expect(onForgotPassword).toHaveBeenCalledTimes(1);
  });
});
