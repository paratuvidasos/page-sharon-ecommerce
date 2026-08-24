import { Link } from "react-router-dom";
import { Reveal } from "@ui/Reveal";
import { Products } from "@features/catalog/components/Products";

// Página dedicada de catálogo ([0013]-[0022][BE]): antes esto vivía embebido como
// una sección más de la landing (App.jsx), pero al pasar de "página de aterrizaje"
// a tienda real necesita su propia URL, accesible desde el Nav — referencia de
// estructura: e-commerce tipo Undergold (breadcrumb + header simple, cuerpo con
// sidebar de filtros). El paddingTop despeja el Nav fijo (no hay Hero encima acá).
export const CatalogPage = ({ onWish, wishlistIds, onOpenProduct }) => (
  <div style={{ paddingTop: 150, paddingBottom: 100, minHeight: "60vh" }}>
    <div className="wrap" style={{ marginBottom: 40 }}>
      <Reveal>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <Link to="/" className="mono" style={{ fontSize: 11, letterSpacing: ".06em", color: "var(--ink-soft)", textDecoration: "none" }}>Inicio</Link>
          <span style={{ color: "var(--ink-soft)", fontSize: 11 }}>/</span>
          <span className="mono" style={{ fontSize: 11, letterSpacing: ".06em", color: "var(--ink)" }}>Tienda</span>
        </div>
        <h1 className="display" style={{ fontSize: "clamp(36px, 5vw, 56px)", margin: 0 }}>
          Catálogo completo
        </h1>
      </Reveal>
    </div>

    <Products onWish={onWish} wishlistIds={wishlistIds} onOpenProduct={onOpenProduct} />
  </div>
);
