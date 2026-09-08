import "@shared/i18n/i18n";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminBanners } from "@features/admin/components/banners/AdminBanners";
import { listBanners, createBanner, updateBanner, uploadBannerImage } from "@shared/api-client";

jest.mock("@shared/api-client", () => ({
  listBanners: jest.fn(),
  createBanner: jest.fn(),
  updateBanner: jest.fn(),
  deleteBanner: jest.fn(),
  reorderBanners: jest.fn(),
  uploadBannerImage: jest.fn(),
}));

jest.mock("@shared/auth/AuthContext", () => ({
  useAuth: () => ({ getAccessToken: () => "token_123" }),
}));

const banner = (overrides = {}) => ({
  id: "b1",
  imageUrl: "https://cdn.example.com/b1.jpg",
  linkUrl: null,
  title: "Kit de otoño",
  category: "KIT",
  actionType: "COMPRAR",
  placements: ["HOME_SECTION"],
  startsAt: null,
  endsAt: null,
  isActive: true,
  ...overrides,
});

describe("AdminBanners", () => {
  beforeEach(() => {
    listBanners.mockReset();
    createBanner.mockReset();
    updateBanner.mockReset();
    listBanners.mockResolvedValue({ items: [] });
  });

  it("shows category and placement badges in the banner list", async () => {
    listBanners.mockResolvedValue({ items: [banner({ placements: ["WELCOME_MODAL", "HOME_SECTION"] })] });
    render(<AdminBanners />);
    await screen.findByText("Kit de otoño");
    expect(screen.getByText("Kit")).toBeInTheDocument();
    expect(screen.getByText("Modal de bienvenida")).toBeInTheDocument();
    expect(screen.getByText("Sección del home")).toBeInTheDocument();
  });

  it("blocks saving a new banner when no placement is checked", async () => {
    uploadBannerImage.mockResolvedValue({ url: "https://cdn.example.com/new.jpg" });
    const user = userEvent.setup();
    const { container } = render(<AdminBanners />);
    await user.click(screen.getByText("Nuevo banner"));
    await user.type(screen.getByLabelText("Título"), "Nueva promo");

    const file = new File(["img-bytes"], "banner.jpg", { type: "image/jpeg" });
    const fileInput = container.querySelector('input[type="file"]');
    await user.upload(fileInput, file);
    await waitFor(() => expect(uploadBannerImage).toHaveBeenCalled());

    await user.click(screen.getByText("Guardar banner"));
    expect(await screen.findByText("Selecciona al menos una ubicación.")).toBeInTheDocument();
    expect(createBanner).not.toHaveBeenCalled();
  });

  it("prefills category, actionType and placements when editing an existing banner", async () => {
    listBanners.mockResolvedValue({
      items: [banner({ category: "EVENTO", actionType: "INSCRIPCION", placements: ["WELCOME_MODAL"] })],
    });
    const user = userEvent.setup();
    render(<AdminBanners />);
    await user.click(await screen.findByLabelText("Editar banner"));

    expect(screen.getByLabelText("Categoría")).toHaveValue("EVENTO");
    expect(screen.getByLabelText("Tipo de acción")).toHaveValue("INSCRIPCION");
    expect(screen.getByLabelText("Modal de bienvenida (aparece al entrar al sitio)")).toBeChecked();
    expect(screen.getByLabelText("Sección del home (carrusel permanente)")).not.toBeChecked();
  });

  it("sends category, actionType and placements on update", async () => {
    listBanners.mockResolvedValue({
      items: [banner({ category: "KIT", actionType: "COMPRAR", placements: ["HOME_SECTION"] })],
    });
    updateBanner.mockResolvedValue({});
    const user = userEvent.setup();
    render(<AdminBanners />);
    await user.click(await screen.findByLabelText("Editar banner"));

    await user.selectOptions(screen.getByLabelText("Categoría"), "PROMOCION");
    await user.click(screen.getByLabelText("Modal de bienvenida (aparece al entrar al sitio)"));
    await user.click(screen.getByText("Guardar banner"));

    await waitFor(() => expect(updateBanner).toHaveBeenCalled());
    const [, payload] = updateBanner.mock.calls[0];
    expect(payload.category).toBe("PROMOCION");
    expect(payload.actionType).toBe("COMPRAR");
    expect(payload.placements.sort()).toEqual(["HOME_SECTION", "WELCOME_MODAL"]);
  });
});
