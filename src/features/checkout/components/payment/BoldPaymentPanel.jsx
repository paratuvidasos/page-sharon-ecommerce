import { useEffect, useRef } from "react";
import { SimulatedPaymentPanel } from "./SimulatedPaymentPanel";

const LAST_ORDER_KEY = "checkout:lastOrder";

// Monta el Botón de Pagos de Bold pasando exactamente los data-* que devolvió el
// backend (nunca se recalcula el monto ni la firma en el cliente — la firma la firma
// el backend con la llave secreta, que nunca sale de ahí). Vuelve a montar cuando
// cambia payment.referenceId (reintento de pago tras un rechazo, ver RetryPaymentPanel).
export const BoldPaymentPanel = ({ payment, orderNumber, email }) => {
  const containerRef = useRef(null);
  const session = payment.session;

  useEffect(() => {
    sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify({ orderNumber, email: email || null }));
  }, [orderNumber, email]);

  useEffect(() => {
    if (!session.scriptUrl) return;
    const container = containerRef.current;
    if (!container) return;
    container.innerHTML = "";

    const el = document.createElement("script");
    el.src = session.scriptUrl;
    el.setAttribute("data-bold-button", "dark-L");
    el.setAttribute("data-api-key", session.apiKey);
    el.setAttribute("data-order-id", session.referenceId);
    el.setAttribute("data-amount", session.amount);
    el.setAttribute("data-currency", session.currency);
    el.setAttribute("data-integrity-signature", session.integritySignature);
    el.setAttribute("data-description", session.description);
    el.setAttribute("data-redirection-url", session.redirectionUrl);
    el.setAttribute("data-expiration-date", session.expirationDate);
    el.setAttribute("data-customer-data", session.customerData);
    el.setAttribute("data-billing-address", session.billingAddress);
    el.setAttribute("data-render-mode", session.renderMode || "embedded");
    container.appendChild(el);

    return () => {
      container.innerHTML = "";
    };
  }, [session]);

  if (!session.scriptUrl) {
    if (import.meta.env.DEV) {
      return <SimulatedPaymentPanel orderNumber={orderNumber} referenceId={session.referenceId} email={email} />;
    }
    return (
      <div role="alert" style={{ background: "rgba(156,74,74,.08)", border: "1px solid rgba(156,74,74,.3)", borderRadius: 14, padding: "14px 18px", fontSize: 13, color: "#7A3535" }}>
        La pasarela de pago no está disponible en este momento. Escríbenos para completar tu pedido.
      </div>
    );
  }

  return <div ref={containerRef} />;
};

export function readLastOrderFromSession() {
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
