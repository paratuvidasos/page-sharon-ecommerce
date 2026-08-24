import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Hero } from "@ui/Hero";
import { Benefits } from "@ui/Benefits";
import { BeforeAfter } from "@ui/BeforeAfter";
import { Testimonials } from "@ui/Testimonials";
import { PurchaseProcess } from "@ui/PurchaseProcess";
import { OfferBanner } from "@ui/OfferBanner";
import { Newsletter } from "@ui/Newsletter";
import { FeaturedProducts } from "@features/catalog/components/FeaturedProducts";

// Landing/home: ya no incluye el grid completo del catálogo (eso vive en /tienda,
// ver CatalogPage) — el "Comprar ahora" del Hero y el listado de FeaturedProducts
// son la puerta de entrada a la tienda real, no un scroll-anchor dentro de esta
// misma página como antes.
export const HomePage = ({ onAdd, onWish, wishlistIds, onOpenProduct }) => {
  const navigate = useNavigate();

  // Cuando se llega a Home con un hash en la URL (ej. Nav en /tienda mandando a
  // "/#beneficios" para volver a una sección de la landing), hace el scroll acá
  // porque react-router no lo hace solo — a diferencia del anchor <a href="#..."> de
  // toda la vida, que el navegador ya resuelve cuando ya se está en esta página.
  useEffect(() => {
    if (!window.location.hash) return;
    const el = document.querySelector(window.location.hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <>
      <Hero onShop={() => navigate("/tienda")} />
      <Benefits />
      <BeforeAfter />
      <PurchaseProcess />
      <Testimonials />
      <FeaturedProducts onAdd={onAdd} onWish={onWish} wishlistIds={wishlistIds} onOpenProduct={onOpenProduct} />
      <OfferBanner />
      <Newsletter />
    </>
  );
};
