import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@ui/components/Button";
import { retryPayment, ApiError } from "@shared/api-client";
import { useAuth } from "@shared/auth/AuthContext";
import { PaymentMethodStep } from "../PaymentMethodStep";
import { CheckoutErrorBanner } from "../CheckoutErrorBanner";
import { BoldPaymentPanel } from "./BoldPaymentPanel";

// Reintento de pago tras un rechazo ([0040]): el carrito y los datos ya ingresados se
// conservan (es criterio de aceptación) — este panel solo deja elegir de nuevo el
// método de pago y llama POST /orders/{orderNumber}/retry-payment, que devuelve una
// sesión de Bold nueva con el mismo orderNumber.
export const RetryPaymentPanel = ({ order, countryCode, currency, email }) => {
  const { t } = useTranslation("checkout");
  const { getAccessToken } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [retryResult, setRetryResult] = useState(null);

  if (retryResult) {
    return <BoldPaymentPanel payment={retryResult.payment} orderNumber={order.orderNumber} email={email} />;
  }

  const handleRetry = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await retryPayment(
        order.orderNumber,
        {
          paymentMethod: paymentMethod.method,
          paymentMethodLabel: paymentMethod.label,
          email: email || undefined,
        },
        getAccessToken()
      );
      setRetryResult(res);
    } catch (e) {
      setError({
        code: e instanceof ApiError ? e.code : null,
        message: e instanceof ApiError ? e.message : t("retryPaymentPanel.genericError"),
        lines: e instanceof ApiError ? e.lines : undefined,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <CheckoutErrorBanner error={error} onRefreshCart={() => {}} onRemoveCoupon={() => {}} />
      <PaymentMethodStep countryCode={countryCode} currency={currency} value={paymentMethod} onSelect={setPaymentMethod} allowWhatsApp={false} />
      <Button
        type="button"
        onClick={handleRetry}
        disabled={submitting || !paymentMethod}
        style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
      >
        {submitting ? t("retryPaymentPanel.retrying") : t("retryPaymentPanel.retryButton")}
      </Button>
    </div>
  );
};
