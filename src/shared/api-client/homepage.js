import { request } from "./http";

// Endpoints públicos de la home (sin auth, para el storefront — no el panel admin).
// Agregados junto con la integración del panel admin porque comparten backend con
// /admin/banners y /admin/homepage/featured-config, pero todavía no se conectan a
// ningún componente de la landing: eso no se pidió en esta tarea.

export function listPublicBanners(placement) {
  const query = placement ? `?placement=${encodeURIComponent(placement)}` : "";
  return request(`/banners${query}`);
}

export function listPublicFeaturedProducts() {
  return request("/homepage/featured-products");
}
