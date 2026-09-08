import "@shared/i18n/i18n";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { WelcomeBannerModal, WELCOME_BANNER_STORAGE_KEY } from "@ui/WelcomeBannerModal";
import { listPublicBanners } from "@shared/api-client";

jest.mock("@shared/api-client", () => ({
  listPublicBanners: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

function renderModal() {
  return render(
    <MemoryRouter>
      <WelcomeBannerModal />
    </MemoryRouter>
  );
}

const banner = (overrides = {}) => ({
  id: "b1",
  imageUrl: "https://cdn.example.com/b1.jpg",
  linkUrl: null,
  title: "Kit de otoño",
  category: "KIT",
  actionType: "MAS_INFORMACION",
  placements: ["WELCOME_MODAL"],
  ...overrides,
});

describe("WelcomeBannerModal", () => {
  beforeEach(() => {
    listPublicBanners.mockReset();
    window.localStorage.clear();
  });

  it("renders nothing (not even the reopen button) when there are no welcome banners", async () => {
    listPublicBanners.mockResolvedValue({ items: [] });
    renderModal();
    await waitFor(() => expect(listPublicBanners).toHaveBeenCalledWith("WELCOME_MODAL"));
    expect(screen.queryByTestId("welcome-banner-modal")).not.toBeInTheDocument();
    expect(screen.queryByTestId("welcome-banner-fab")).not.toBeInTheDocument();
  });

  it("opens automatically with the banner image when not shown today", async () => {
    listPublicBanners.mockResolvedValue({ items: [banner()] });
    renderModal();
    expect(await screen.findByAltText("Kit de otoño")).toBeInTheDocument();
    expect(window.localStorage.getItem(WELCOME_BANNER_STORAGE_KEY)).toBe(
      new Date().toISOString().slice(0, 10)
    );
  });

  it("does not open again if already shown today, but keeps the reopen button available", async () => {
    window.localStorage.setItem(WELCOME_BANNER_STORAGE_KEY, new Date().toISOString().slice(0, 10));
    listPublicBanners.mockResolvedValue({ items: [banner()] });
    renderModal();
    await waitFor(() => expect(listPublicBanners).toHaveBeenCalled());
    expect(screen.queryByAltText("Kit de otoño")).not.toBeInTheDocument();
    expect(await screen.findByTestId("welcome-banner-fab")).toBeInTheDocument();
  });

  it("closes when the close button is clicked", async () => {
    listPublicBanners.mockResolvedValue({ items: [banner()] });
    const user = userEvent.setup();
    renderModal();
    await screen.findByAltText("Kit de otoño");
    await user.click(screen.getByLabelText("Cerrar"));
    await waitFor(() => expect(screen.queryByAltText("Kit de otoño")).not.toBeInTheDocument());
  });

  it("reopens the modal from the floating button after it was auto-shown and closed", async () => {
    listPublicBanners.mockResolvedValue({ items: [banner()] });
    const user = userEvent.setup();
    renderModal();
    await screen.findByAltText("Kit de otoño");
    await user.click(screen.getByLabelText("Cerrar"));
    await waitFor(() => expect(screen.queryByAltText("Kit de otoño")).not.toBeInTheDocument());

    await user.click(screen.getByTestId("welcome-banner-fab"));
    expect(await screen.findByAltText("Kit de otoño")).toBeInTheDocument();
  });

  it("reopens the modal from the floating button even when it never auto-opened (already shown today)", async () => {
    window.localStorage.setItem(WELCOME_BANNER_STORAGE_KEY, new Date().toISOString().slice(0, 10));
    listPublicBanners.mockResolvedValue({ items: [banner()] });
    const user = userEvent.setup();
    renderModal();
    const fab = await screen.findByTestId("welcome-banner-fab");
    await user.click(fab);
    expect(await screen.findByAltText("Kit de otoño")).toBeInTheDocument();
  });

  it.each(["EVENTO", "GENERAL"])(
    "does nothing when the banner category is %s, even with a linkUrl set",
    async (category) => {
      mockNavigate.mockClear();
      listPublicBanners.mockResolvedValue({
        items: [banner({ category, linkUrl: "https://sharon.test/promo" })],
      });
      const user = userEvent.setup();
      renderModal();
      await user.click(await screen.findByAltText("Kit de otoño"));
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(screen.getByAltText("Kit de otoño")).toBeInTheDocument();
    }
  );

  it.each(["KIT", "PROMOCION", "LANZAMIENTO", "COLECCION"])(
    "navigates to /tienda and closes when the banner category is %s, ignoring linkUrl",
    async (category) => {
      mockNavigate.mockClear();
      listPublicBanners.mockResolvedValue({
        items: [banner({ category, linkUrl: "https://sharon.test/promo" })],
      });
      const user = userEvent.setup();
      renderModal();
      await user.click(await screen.findByAltText("Kit de otoño"));
      expect(mockNavigate).toHaveBeenCalledWith("/tienda");
      await waitFor(() => expect(screen.queryByAltText("Kit de otoño")).not.toBeInTheDocument());
    }
  );

  it("shows dot navigation for multiple banners and switches slides", async () => {
    listPublicBanners.mockResolvedValue({
      items: [banner({ id: "b1", title: "Primero" }), banner({ id: "b2", title: "Segundo" })],
    });
    const user = userEvent.setup();
    renderModal();
    await screen.findByAltText("Primero");
    await user.click(screen.getByLabelText("Ir a la promoción 2"));
    expect(await screen.findByAltText("Segundo")).toBeInTheDocument();
  });
});
