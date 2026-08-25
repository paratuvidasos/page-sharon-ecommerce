import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@ui/components/Button";
import { simulatePaymentStatus } from "@shared/api-client";

// Modo simulado (sin cuenta de Bold): el backend responde payment.session.scriptUrl
// vacío + sandbox:true. Solo visible en desarrollo (gateado por import.meta.env.DEV
// en BoldPaymentPanel) para poder probar [0038]-[0040] sin la pasarela real.
//
// SUPUESTO A CONFIRMAR CON BACKEND: en sandbox no hay webhook automático, así que no
// hay forma documentada en el handoff de marcar la orden simulada como pagada/
// rechazada. Se intenta un endpoint best-effort (POST /payments/{referenceId}/status/
// simulate) antes de navegar al resultado; si no existe, el resultado va a quedar en
// PENDING y el polling de CheckoutResultPage lo mostrará como "confirmando" hasta que
// se agote el timeout — ajustar esta llamada cuando se confirme el contrato real en
// /api/docs del backend.
export const SimulatedPaymentPanel = ({ orderNumber, referenceId, email }) => {
  const navigate = useNavigate();
  const [pending, setPending] = useState(null);

  const simulate = async (result) => {
    setPending(result);
    try {
      await simulatePaymentStatus(referenceId, result === "approved" ? "APPROVED" : "REJECTED");
    } catch {
      // Silencioso a propósito: el endpoint es un supuesto best-effort, ver comentario arriba.
    } finally {
      const params = new URLSearchParams({ order: orderNumber, "bold-tx-status": result });
      if (email) params.set("email", email);
      navigate(`/checkout/resultado?${params.toString()}`);
    }
  };

  return (
    <div style={{ border: ".5px solid var(--line)", borderRadius: 16, padding: "18px 20px" }}>
      <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>Pasarela en modo simulado</div>
      <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 14 }}>
        Todavía no hay cuenta de Bold conectada. Usa estos botones para probar el flujo.
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        <Button type="button" onClick={() => simulate("approved")} disabled={pending !== null}>
          {pending === "approved" ? "Simulando…" : "Simular pago aprobado"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => simulate("rejected")} disabled={pending !== null}>
          {pending === "rejected" ? "Simulando…" : "Simular pago rechazado"}
        </Button>
      </div>
    </div>
  );
};
