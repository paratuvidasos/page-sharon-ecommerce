import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthModal } from "@features/auth/components/AuthModal";
import { registerAccount, loginAccount, resendVerificationEmail } from "@shared/api-client";

jest.mock("@shared/api-client", () => ({
  ApiError: class ApiError extends Error {},
  registerAccount: jest.fn(),
  loginAccount: jest.fn(),
  resendVerificationEmail: jest.fn(),
}));

// RegisterForm/LoginForm/ForgotPasswordForm se quedan todos montados a la vez dentro de
// AuthModal (se ocultan con display:none, no se desmontan), así que los placeholders/labels
// se repiten entre formularios. Los campos son únicos por id (`${idPrefix}-${name}`), así
// que los resolvemos por id en vez de por placeholder/label para evitar ambigüedad.
function field(container, id) {
  const el = container.querySelector(`#${id}`);
  if (!el) throw new Error(`No se encontró el campo #${id}`);
  return el;
}

// El botón de tab ("Iniciar sesión") y el de submit del footer en modo login comparten
// el mismo nombre accesible; solo el de tab lleva aria-pressed.
function tabButton(name) {
  return screen.getAllByRole("button", { name }).find((b) => b.hasAttribute("aria-pressed"));
}

function submitButton(name) {
  return screen.getAllByRole("button", { name }).find((b) => !b.hasAttribute("aria-pressed"));
}

async function fillRegisterForm(container, user) {
  await user.type(field(container, "register-firstName"), "Sharon");
  await user.type(field(container, "register-lastName"), "Rojas");
  await user.type(field(container, "register-email"), "sharon@ejemplo.com");
  await user.type(field(container, "register-password"), "clave1234");
  await user.type(field(container, "register-confirmPassword"), "clave1234");
}

describe("AuthModal", () => {
  beforeEach(() => {
    registerAccount.mockReset();
    loginAccount.mockReset();
    resendVerificationEmail.mockReset();
    jest.useRealTimers();
  });

  it("switches between register, login and forgot-password tabs", async () => {
    const user = userEvent.setup();
    const { container } = render(<AuthModal open onClose={() => {}} initialMode="register" />);

    expect(field(container, "register-firstName")).toBeInTheDocument();

    await user.click(tabButton("Iniciar sesión"));
    expect(field(container, "login-password")).toBeInTheDocument();

    await user.click(screen.getByText("¿Olvidaste tu contraseña?"));
    expect(screen.getByText("Recupera tu acceso")).toBeInTheDocument();
    expect(field(container, "forgot-email")).toBeInTheDocument();
  });

  it("does not call onAuthSuccess after a successful registration", async () => {
    registerAccount.mockResolvedValue({ id: "acc_1" });
    const onAuthSuccess = jest.fn();
    const user = userEvent.setup();
    const { container } = render(<AuthModal open onClose={() => {}} initialMode="register" onAuthSuccess={onAuthSuccess} />);

    await fillRegisterForm(container, user);
    await user.click(submitButton("Crear cuenta"));

    await waitFor(() => {
      expect(screen.getByText("Revisa tu correo")).toBeInTheDocument();
    });
    expect(onAuthSuccess).not.toHaveBeenCalled();
  });

  it("calls onAuthSuccess with the session info after a successful login", async () => {
    const apiUser = { firstName: "Sharon", lastName: "Rojas", email: "sharon@ejemplo.com" };
    loginAccount.mockResolvedValue({ user: apiUser, accessToken: "token-abc" });
    const onAuthSuccess = jest.fn();
    const user = userEvent.setup();
    const { container } = render(<AuthModal open onClose={() => {}} initialMode="login" onAuthSuccess={onAuthSuccess} />);

    await user.type(field(container, "login-email"), "sharon@ejemplo.com");
    await user.type(field(container, "login-password"), "clave1234");
    await user.click(submitButton("Iniciar sesión"));

    await waitFor(() => {
      expect(onAuthSuccess).toHaveBeenCalledWith({
        name: "Sharon Rojas",
        email: "sharon@ejemplo.com",
        apiUser,
        accessToken: "token-abc",
      });
    });
  });

  it("logs in via the simulated Google flow without an access token, in either mode", async () => {
    const onAuthSuccess = jest.fn();
    const user = userEvent.setup();
    render(<AuthModal open onClose={() => {}} initialMode="register" onAuthSuccess={onAuthSuccess} />);

    await user.click(screen.getByText("Continuar con Google"));
    await user.click(screen.getByText("Cuenta demo de Google"));

    await waitFor(() => {
      expect(onAuthSuccess).toHaveBeenCalledWith({ name: "Cuenta demo de Google", email: "demo.sharon@gmail.com" });
    });
    expect(onAuthSuccess.mock.calls[0][0]).not.toHaveProperty("accessToken");
  });

  it("resends the verification email and shows confirmation after registering", async () => {
    registerAccount.mockResolvedValue({ id: "acc_1" });
    resendVerificationEmail.mockResolvedValue({});
    const user = userEvent.setup();
    const { container } = render(<AuthModal open onClose={() => {}} initialMode="register" />);

    await fillRegisterForm(container, user);
    await user.click(submitButton("Crear cuenta"));

    const resendButton = await screen.findByText("¿No te llegó el correo? Reenviar");
    await user.click(resendButton);

    await waitFor(() => {
      expect(resendVerificationEmail).toHaveBeenCalledWith("sharon@ejemplo.com");
    });
    await waitFor(() => {
      expect(screen.getByText(/Correo reenviado, revisa tu bandeja de entrada\./)).toBeInTheDocument();
    });
  });
});
