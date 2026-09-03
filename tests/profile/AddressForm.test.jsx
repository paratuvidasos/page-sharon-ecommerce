import "@shared/i18n/i18n";
import { createRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AddressForm } from "@features/profile/components/addresses/AddressForm";
import { listDepartments, listCitiesByDepartment } from "@shared/geo/colombiaLocations";

jest.mock("@shared/geo/colombiaLocations", () => ({
  listDepartments: jest.fn(),
  listCitiesByDepartment: jest.fn(),
}));

jest.mock("@shared/auth/AuthContext", () => ({
  useAuth: () => ({ getAccessToken: () => "token_123" }),
}));

jest.mock("@shared/api-client", () => ({
  ApiError: class ApiError extends Error {},
  createAddress: jest.fn(),
  updateAddress: jest.fn(),
}));

describe("AddressForm — Colombia department/city dropdowns", () => {
  beforeEach(() => {
    listDepartments.mockReset();
    listCitiesByDepartment.mockReset();
    listDepartments.mockResolvedValue([
      { id: 1, name: "Antioquia" },
      { id: 2, name: "Cundinamarca" },
    ]);
    listCitiesByDepartment.mockResolvedValue([
      { id: 10, name: "Medellín", postalCode: "050001" },
      { id: 11, name: "Envigado", postalCode: null },
    ]);
  });

  it("shows department and city as dropdowns when the country is Colombia (default)", async () => {
    render(<AddressForm ref={createRef()} />);
    await waitFor(() => expect(listDepartments).toHaveBeenCalled());

    expect(screen.getByRole("combobox", { name: "Departamento / estado" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Ciudad" })).toBeDisabled();
  });

  it("loads cities for the selected department and auto-fills the postal code when the city has one", async () => {
    const user = userEvent.setup();
    render(<AddressForm ref={createRef()} />);
    await waitFor(() => expect(listDepartments).toHaveBeenCalled());

    await user.selectOptions(screen.getByRole("combobox", { name: "Departamento / estado" }), "Antioquia");
    await waitFor(() => expect(listCitiesByDepartment).toHaveBeenCalledWith(1));

    const citySelect = await screen.findByRole("combobox", { name: "Ciudad" });
    expect(citySelect).not.toBeDisabled();
    await user.selectOptions(citySelect, "Medellín");

    expect(screen.getByPlaceholderText("110111")).toHaveValue("050001");
  });

  it("does not overwrite the postal code when the chosen city has none", async () => {
    const user = userEvent.setup();
    render(<AddressForm ref={createRef()} />);
    await waitFor(() => expect(listDepartments).toHaveBeenCalled());

    await user.selectOptions(screen.getByRole("combobox", { name: "Departamento / estado" }), "Antioquia");
    const citySelect = await screen.findByRole("combobox", { name: "Ciudad" });
    await user.type(screen.getByPlaceholderText("110111"), "999999");
    await user.selectOptions(citySelect, "Envigado");

    expect(screen.getByPlaceholderText("110111")).toHaveValue("999999");
  });

  it("falls back to free-text department/city inputs for a non-Colombia country", async () => {
    const user = userEvent.setup();
    render(<AddressForm ref={createRef()} />);
    await waitFor(() => expect(listDepartments).toHaveBeenCalled());

    await user.selectOptions(screen.getByRole("combobox", { name: "País" }), "México");

    expect(screen.queryByRole("combobox", { name: "Departamento / estado" })).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tu departamento o estado")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tu ciudad")).toBeInTheDocument();
  });

  it("falls back to free text when the departments API fails", async () => {
    listDepartments.mockReset();
    listDepartments.mockRejectedValue(new Error("network down"));
    render(<AddressForm ref={createRef()} />);

    expect(await screen.findByPlaceholderText("Tu departamento o estado")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Tu ciudad")).toBeInTheDocument();
  });
});
