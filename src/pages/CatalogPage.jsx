import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Reveal } from "@ui/Reveal";
import { Products } from "@features/catalog/components/Products";

// Página dedicada de catálogo ([0013]-[0022][BE]): antes esto vivía embebido como
// una sección más de la landing (App.jsx), pero al pasar de "página de aterrizaje"
// a tienda real necesita su propia URL, accesible desde el Nav — referencia de
// estructura: e-commerce tipo Undergold (breadcrumb + header simple, cuerpo con
// sidebar de filtros). El Nav es `position:sticky` (Nav.jsx), no fijo/overlay: ya
// ocupa su propio espacio en el flujo normal, así que este paddingTop es solo el
// aire extra deseado antes del breadcrumb, no una compensación por solaparse con él.
export const CatalogPage = ({ onWish, wishlistIds, onOpenProduct }) => {
  const { t } = useTranslation("catalog");
  return (
    <div style={{ paddingTop: 32, paddingBottom: 100, minHeight: "60vh" }}>
      <div className="wrap" style={{ marginBottom: 40 }}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <Link to="/" className="mono" style={{ fontSize: 11, letterSpacing: ".06em", color: "var(--ink-soft)", textDecoration: "none" }}>{t("page.breadcrumbHome")}</Link>
            <span style={{ color: "var(--ink-soft)", fontSize: 11 }}>/</span>
            <span className="mono" style={{ fontSize: 11, letterSpacing: ".06em", color: "var(--ink)" }}>{t("page.breadcrumbShop")}</span>
          </div>
          <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 56px)", margin: 0 }}>
            {t("page.title")}
          </h1>
        </Reveal>
      </div>

      <Products onWish={onWish} wishlistIds={wishlistIds} onOpenProduct={onOpenProduct} />
    </div>
  );
};
