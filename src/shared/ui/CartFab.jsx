import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "./Icon";
import { useCart } from "@shared/cart/CartContext";

// Bolsa flotante persistente en móvil (mockup "Sharon Movil"): reemplaza al ícono de
// carrito del header, que en esa resolución ya no cabe en la barra superior (solo
// queda menú + logo + buscar, ver Nav.jsx .nav-icons-desktop). Oculta en /checkout
// (tiene su propia barra fija de Total + Pagar, ver CheckoutPage.jsx) y en /admin
// (tiene su propia nav inferior, ver AdminLayout.jsx) para no pisarlas.
export const CartFab = ({ onOpenCart }) => {
  const { t } = useTranslation("home");
  const { itemCount } = useCart();
  const location = useLocation();
  const hidden = location.pathname.startsWith("/checkout") || location.pathname.startsWith("/admin");

  if (hidden) return null;

  return (
    <>
      <button
        type="button"
        onClick={onOpenCart}
        aria-label={t("cartFab.ariaLabel")}
        className="cart-fab foc"
        style={{
          display: "none",
          position: "fixed",
          bottom: "calc(24px + env(safe-area-inset-bottom))",
          right: 22,
          width: 62,
          height: 62,
          borderRadius: "50%",
          background: "var(--ink)",
          border: 0,
          cursor: "pointer",
          placeItems: "center",
          boxShadow: "0 14px 34px rgba(27,24,21,.4)",
          zIndex: 40,
        }}
      >
        <Icon name="cart" size={24} color="var(--cream)" />
        {itemCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: -3,
              right: -3,
              minWidth: 24,
              height: 24,
              padding: "0 5px",
              borderRadius: 999,
              background: "var(--gold)",
              color: "var(--ink)",
              fontSize: 11.5,
              fontWeight: 700,
              display: "grid",
              placeItems: "center",
              border: "2.5px solid var(--cream)",
            }}
          >
            {itemCount}
          </span>
        )}
      </button>

      <style>{`
        @media (max-width: 900px){
          .cart-fab{display:grid !important}
        }
      `}</style>
    </>
  );
};
