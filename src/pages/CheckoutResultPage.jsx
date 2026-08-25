import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Icon } from "@ui/Icon";
import { Button } from "@ui/components/Button";
import { getOrder, ApiError } from "@shared/api-client";
import { useAuth } from "@shared/auth/AuthContext";
import { useCart } from "@shared/cart/CartContext";
import { formatCurrency } from "@shared/i18n/currency";
import { readLastOrderFromSession } from "@features/checkout/components/payment/BoldPaymentPanel";
import { RetryPaymentPanel } from "@features/checkout/components/payment/RetryPaymentPanel";

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 30000;

// Aterrizaje del retorno de Bold ([0039][0040]): bold-order-id/bold-tx-status vienen
// del navegador y solo sirven de pista de UI — el estado real se confirma contra el
// backend con polling corto sobre GET /orders/:orderNumber, tal como pide el handoff.
export const CheckoutResultPage = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order");
  const boldTxStatus = searchParams.get("bold-tx-status");
  const { user, getAccessToken } = useAuth();
  const { clear } = useCart();
  const cartClearedRef = useRef(false);

  const lastOrder = readLastOrderFromSession();
  const email = searchParams.get("email") || (lastOrder?.orderNumber === orderNumber ? lastOrder.email : null);

  const [status, setStatus] = useState("loading"); // loading | pending | paid | failed | not_found | timeout
  const [order, setOrder] = useState(null);
  // "Comprobar de nuevo" (tras timeout) necesita reiniciar el useEffect de abajo aunque
  // orderNumber/email no hayan cambiado — sin este token el intervalo ya cancelado del
  // primer poll nunca se recrea y el botón se queda sin hacer nada.
  const [pollToken, setPollToken] = useState(0);

  useEffect(() => {
    if (!orderNumber) {
      setStatus("not_found");
      return;
    }
    let cancelled = false;
    let interval;
    const startedAt = Date.now();

    const poll = async () => {
      try {
        const res = await getOrder(orderNumber, { email }, getAccessToken());
        if (cancelled) return;
        setOrder(res);
        if (res.status === "PAID") {
          setStatus("paid");
          clearInterval(interval);
        } else if (res.status === "PAYMENT_FAILED") {
          setStatus("failed");
          clearInterval(interval);
        } else if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
          setStatus("timeout");
          clearInterval(interval);
        } else {
          setStatus("pending");
        }
      } catch (e) {
        if (cancelled) return;
        if (e instanceof ApiError && e.status === 404) {
          setStatus("not_found");
        } else {
          setStatus("pending");
        }
      }
    };

    poll();
    interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderNumber, email, pollToken]);

  // El backend vacía el carrito solo para cuentas logueadas (vía el webhook de Bold);
  // como invitado, la cookie de carrito solo la puede leer el propio navegador, así
  // que se limpia acá al confirmar el pago.
  useEffect(() => {
    if (status === "paid" && !user && !cartClearedRef.current) {
      cartClearedRef.current = true;
      clear();
    }
  }, [status, user, clear]);

  const handleRetryPoll = () => {
    setStatus("loading");
    setPollToken((t) => t + 1);
  };

  return (
    <div style={{ paddingTop: 150, paddingBottom: 100, minHeight: "70vh" }}>
      <div className="wrap" style={{ maxWidth: 560 }}>
        {(status === "loading" || status === "pending") && (
          <StatusBlock
            icon="spark"
            title="Estamos confirmando tu pago…"
            description="Esto puede tardar unos segundos. No cierres esta ventana."
          />
        )}

        {status === "timeout" && (
          <StatusBlock
            icon="spark"
            title="Tu pago puede tardar unos minutos más"
            description="Te avisamos por correo apenas se confirme, o puedes comprobar de nuevo."
          >
            <Button onClick={handleRetryPoll} style={{ marginTop: 20 }}>Comprobar de nuevo</Button>
          </StatusBlock>
        )}

        {status === "not_found" && (
          <StatusBlock
            icon="close"
            title="No encontramos ese pedido"
            description="Revisa el enlace o contáctanos si el problema persiste."
          >
            <Link to="/tienda"><Button style={{ marginTop: 20 }}>Ir a la tienda</Button></Link>
          </StatusBlock>
        )}

        {status === "paid" && order && (
          <StatusBlock
            icon="leaf"
            title="¡Pedido confirmado!"
            description={
              <>
                Tu pedido <strong>{order.orderNumber}</strong> quedó registrado por{" "}
                <strong>{formatCurrency(order.total)}</strong>. Te avisamos por correo cuando cambie de estado.
              </>
            }
          >
            <Link to="/tienda"><Button style={{ marginTop: 20 }}>Seguir comprando</Button></Link>
          </StatusBlock>
        )}

        {status === "failed" && order && (
          <div>
            <StatusBlock
              icon="close"
              title="No pudimos procesar tu pago"
              description={order.paymentFailureMessage || "Intenta con otro método de pago."}
            />
            <div style={{ marginTop: 24 }}>
              <RetryPaymentPanel
                order={order}
                countryCode={order.shippingAddress?.countryCode || "CO"}
                currency={order.currency || "COP"}
                email={email}
              />
            </div>
          </div>
        )}

        {boldTxStatus && status === "loading" && (
          <p style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 12 }}>
            Bold reportó: {boldTxStatus}. Confirmando con nuestro servidor…
          </p>
        )}
      </div>
    </div>
  );
};

const StatusBlock = ({ icon, title, description, children }) => (
  <div style={{ textAlign: "center", padding: "40px 8px" }}>
    <div
      style={{
        width: 72, height: 72, borderRadius: "50%", background: "var(--botanic-muted)",
        display: "grid", placeItems: "center", margin: "0 auto 24px",
      }}
    >
      <Icon name={icon} size={32} color="var(--botanic-deep)" />
    </div>
    <h1 className="display" style={{ fontSize: 26, marginBottom: 10 }}>{title}</h1>
    <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6 }}>{description}</p>
    {children}
  </div>
);
