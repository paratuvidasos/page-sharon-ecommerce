import "@shared/i18n/i18n";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthField } from "@features/auth/components/AuthField";

const textConfig = {
  name: "email",
  label: "Correo electrónico",
  type: "email",
  placeholder: "tucorreo@ejemplo.com",
};

const passwordConfig = {
  name: "password",
  label: "Contraseña",
  type: "password",
  placeholder: "Tu contraseña",
  helper: "Mínimo 8 caracteres.",
};

describe("AuthField", () => {
  it("renders the label, placeholder and current value", () => {
    render(
      <AuthField
        config={textConfig}
        value="hola@sharon.com"
        error=""
        touched={false}
        onChange={() => {}}
        onBlur={() => {}}
        idPrefix="test"
      />
    );

    expect(screen.getByText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("tucorreo@ejemplo.com")).toHaveValue("hola@sharon.com");
  });

  it("shows the helper text when there is no error", () => {
    render(
      <AuthField
        config={passwordConfig}
        value=""
        error=""
        touched={false}
        onChange={() => {}}
        onBlur={() => {}}
        idPrefix="test"
      />
    );

    expect(screen.getByText("Mínimo 8 caracteres.")).toBeInTheDocument();
  });

  it("shows the error message instead of the helper once touched", () => {
    render(
      <AuthField
        config={passwordConfig}
        value=""
        error="Elige una contraseña para tu cuenta."
        touched
        onChange={() => {}}
        onBlur={() => {}}
        idPrefix="test"
      />
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Elige una contraseña para tu cuenta.");
    expect(screen.queryByText("Mínimo 8 caracteres.")).not.toBeInTheDocument();
  });

  it("toggles a password field between hidden and visible", async () => {
    const user = userEvent.setup();
    render(
      <AuthField
        config={passwordConfig}
        value="secreto123"
        error=""
        touched={false}
        onChange={() => {}}
        onBlur={() => {}}
        idPrefix="test"
      />
    );

    const input = screen.getByPlaceholderText("Tu contraseña");
    expect(input).toHaveAttribute("type", "password");

    await user.click(screen.getByLabelText("Mostrar contraseña"));
    expect(input).toHaveAttribute("type", "text");

    await user.click(screen.getByLabelText("Ocultar contraseña"));
    expect(input).toHaveAttribute("type", "password");
  });
});
