import { createRef } from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegisterForm } from "@features/auth/components/register/RegisterForm";
import { registerAccount, ApiError } from "@shared/api-client";

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
    registerAccount: jest.fn(),
  };
});

async function fillValidForm(user) {
  await user.type(screen.getByPlaceholderText("Tu nombre"), "Sharon");
  await user.type(screen.getByPlaceholderText("Tu apellido"), "Rojas");
  await user.type(screen.getByPlaceholderText("tucorreo@ejemplo.com"), "sharon@ejemplo.com");
  await user.type(screen.getByPlaceholderText("Mínimo 8 caracteres"), "clave1234");
  await user.type(screen.getByPlaceholderText("Repite tu contraseña"), "clave1234");
}

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

describe("RegisterForm", () => {
  beforeEach(() => {
    registerAccount.mockReset();
  });

  it("blocks submit and shows a validation summary when fields are empty", async () => {
    const ref = createRef();
    render(<RegisterForm ref={ref} />);

    const result = await submit(ref);

    expect(result).toEqual({ ok: false });
    expect(registerAccount).not.toHaveBeenCalled();
    expect(screen.getByText("Hay campos por revisar")).toBeInTheDocument();
  });

  it("rejects a password that does not meet the policy and a mismatched confirmation", async () => {
    const user = userEvent.setup();
    const ref = createRef();
    render(<RegisterForm ref={ref} />);

    await user.type(screen.getByPlaceholderText("Tu nombre"), "Sharon");
    await user.type(screen.getByPlaceholderText("Tu apellido"), "Rojas");
    await user.type(screen.getByPlaceholderText("tucorreo@ejemplo.com"), "sharon@ejemplo.com");
    await user.type(screen.getByPlaceholderText("Mínimo 8 caracteres"), "short");
    await user.type(screen.getByPlaceholderText("Repite tu contraseña"), "different");

    const result = await submit(ref);

    expect(result).toEqual({ ok: false });
    expect(registerAccount).not.toHaveBeenCalled();
  });

  it("calls registerAccount with the form data and reports success without logging in", async () => {
    registerAccount.mockResolvedValue({ id: "acc_1" });
    const user = userEvent.setup();
    const ref = createRef();
    render(<RegisterForm ref={ref} />);

    await fillValidForm(user);
    const result = await submit(ref);

    expect(registerAccount).toHaveBeenCalledWith({
      firstName: "Sharon",
      lastName: "Rojas",
      email: "sharon@ejemplo.com",
      password: "clave1234",
      confirmPassword: "clave1234",
    });
    expect(result).toEqual({
      ok: true,
      info: { method: "email", mode: "register", email: "sharon@ejemplo.com", name: "Sharon Rojas", loggedIn: false },
    });
  });

  it("shows the backend message on a 400 ApiError", async () => {
    registerAccount.mockRejectedValue(new ApiError(400, { message: "Ese correo ya está registrado." }));
    const user = userEvent.setup();
    const ref = createRef();
    render(<RegisterForm ref={ref} />);

    await fillValidForm(user);
    const result = await submit(ref);

    expect(result).toEqual({ ok: false });
    await waitFor(() => {
      expect(screen.getByText("Ese correo ya está registrado.")).toBeInTheDocument();
    });
  });

  it("shows a generic message on a non-ApiError failure", async () => {
    registerAccount.mockRejectedValue(new Error("network down"));
    const user = userEvent.setup();
    const ref = createRef();
    render(<RegisterForm ref={ref} />);

    await fillValidForm(user);
    const result = await submit(ref);

    expect(result).toEqual({ ok: false });
    await waitFor(() => {
      expect(screen.getByText("No pudimos crear tu cuenta. Intenta de nuevo en unos segundos.")).toBeInTheDocument();
    });
  });
});
