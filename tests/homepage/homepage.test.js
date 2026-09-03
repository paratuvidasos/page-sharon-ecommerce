import { listPublicBanners } from "@shared/api-client/homepage";
import { request } from "@shared/api-client/http";

jest.mock("@shared/api-client/http", () => ({
  request: jest.fn(),
}));

describe("listPublicBanners", () => {
  beforeEach(() => {
    request.mockReset();
    request.mockResolvedValue({ items: [] });
  });

  it("calls /banners with no query when no placement is given", async () => {
    await listPublicBanners();
    expect(request).toHaveBeenCalledWith("/banners");
  });

  it("calls /banners?placement=WELCOME_MODAL when given that placement", async () => {
    await listPublicBanners("WELCOME_MODAL");
    expect(request).toHaveBeenCalledWith("/banners?placement=WELCOME_MODAL");
  });

  it("calls /banners?placement=HOME_SECTION when given that placement", async () => {
    await listPublicBanners("HOME_SECTION");
    expect(request).toHaveBeenCalledWith("/banners?placement=HOME_SECTION");
  });
});
