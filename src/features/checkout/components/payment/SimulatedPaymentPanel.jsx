import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@ui/components/Button";
import { simulatePaymentStatus } from "@shared/api-client";

// Modo simulado (sin cuenta de Bold): el backend responde payment.session.scriptUrl
// vacío + sandbox:true. Solo visible en desarrollo (gateado por import.meta.env.DEV
// en BoldPaymentPanel) para poder probar [0038]-[0040] sin la pasarela real.
export const SimulatedPaymentPanel = ({ orderNumber, referenceId, email }) => {
  const { t } = useTranslation("checkout");
  const navigate = useNavigate();
  const [pending, setPending] = useState(null);

  const simulate = async (result) => {
    setPending(result);
    try {
      await simulatePaymentStatus(
        referenceId,
        result === "approved" ? "SALE_APPROVED" : "SALE_REJECTED",
      );
    } catch {
      // Silencioso a propósito: seguimos navegando al resultado aunque falle
      // la llamada de simulación, para no bloquear la prueba manual del flujo.
    } finally {
      const params = new URLSearchParams({ order: orderNumber, "bold-tx-status": result });
      if (email) params.set("email", email);
      navigate(`/checkout/resultado?${params.toString()}`);
    }
  };

  return (
    <div style={{ border: ".5px solid var(--line)", borderRadius: 16, padding: "18px 20px" }}>
      <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>{t("simulatedPaymentPanel.badge")}</div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 14 }}>
        {t("simulatedPaymentPanel.description")}
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <Button type="button" onClick={() => simulate("approved")} disabled={pending !== null}>
          {pending === "approved" ? t("simulatedPaymentPanel.simulatingApproved") : t("simulatedPaymentPanel.approveButton")}
        </Button>
        <Button type="button" variant="ghost" onClick={() => simulate("rejected")} disabled={pending !== null}>
          {pending === "rejected" ? t("simulatedPaymentPanel.simulatingRejected") : t("simulatedPaymentPanel.rejectButton")}
        </Button>
      </div>
    </div>
  );
};
