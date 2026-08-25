import { useEffect, useState } from "react";
import { IconButton } from "@ui/components/IconButton";
import { ProductImage } from "@ui/ProductImage";
import { Modal } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { formatCurrency } from "@shared/i18n/currency";
import { COUNTRIES } from "@shared/data/countries";
import { PRODUCTS } from "@features/catalog/data/products";
import { getOrder } from "@shared/api-client";
import { useAuth } from "@shared/auth/AuthContext";
import { getStatus } from "../data/statuses";

const formatDate = (isoDate) =>
  new Date(isoDate).toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" });

const formatDateTime = (isoDate) =>
  new Date(isoDate).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

// Detalle completo de un pedido: productos, dirección de envío y método de pago
// usado (los tres datos que pide el AC), anidado dentro de OrderHistoryModal igual
// que AddressFormModal dentro de AddressBookModal. También se monta como instancia
// top-level en App.jsx (zIndex={Z.orderTracking}) cuando se abre desde una
// notificación, mismo motivo que Z.deleteAccount: la instancia anidada solo existe
// mientras OrderHistoryModal está abierta.
// Los productos del pedido son un snapshot congelado (nombre/cantidad/precio al
// momento de la compra); la imagen se resuelve contra el catálogo actual solo para
// mostrarla — un backend real guardaría también la imagen en el snapshot.
//
// `order` puede llegar como el resumen liviano de GET /orders (historial) — ese
// resumen no trae `statusHistory` (solo GET /orders/:orderNumber lo devuelve), así
// que acá se pide el detalle completo apenas se abre y se usa mientras tanto el
// resumen para no dejar el modal en blanco. Si `order` ya viene completo (ej. recién
// creado en CheckoutPage, con `items`/`shippingAddress` pero sin pasar por el
// historial), igual se pide el detalle fresco — es la única forma de tener
// `statusHistory` sin duplicar esa lógica en cada lugar que abre este modal.
export const OrderDetailModal = ({ order: summary, onClose, zIndex = Z.orderDetail }) => {
  const { getAccessToken } = useAuth();
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!summary) {
      setDetail(null);
      return;
    }
    let cancelled = false;
    getOrder(summary.orderNumber, {}, getAccessToken())
      .then((res) => {
        if (!cancelled) setDetail(res);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary?.orderNumber]);

  if (!summary) return null;
  const order = detail?.orderNumber === summary.orderNumber ? detail : summary;
  const status = getStatus(order.status);
  const country = COUNTRIES.find((c) => c.code === order.shippingAddress.countryCode);

  return (
    <Modal
      open={Boolean(order)}
      onClose={onClose}
      zIndex={zIndex}
      width="min(520px, 92vw)"
      labelledBy="order-detail-title"
      panelStyle={{
        maxHeight: "88vh",
        background: "var(--cream)",
        borderRadius: 24,
        boxShadow: "0 32px 80px rgba(27,24,21,.3)",
        border: ".5px solid var(--line)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "22px 26px",
          borderBottom: "1px solid var(--line)",
          flexShrink: 0,
        }}
      >
        <div>
          <span className="eyebrow" style={{ fontSize: 10, letterSpacing: ".14em" }}>Pedido {order.orderNumber}</span>
          <div id="order-detail-title" className="display" style={{ fontSize: 22, marginTop: 6 }}>
            {formatDate(order.placedAt)}
          </div>
          <span
            style={{
              display: "inline-block",
              marginTop: 8,
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: ".05em",
              textTransform: "uppercase",
              color: status.color,
              background: status.bg,
              padding: "3px 8px",
              borderRadius: 999,
            }}
          >
            {status.label}
          </span>
        </div>
        <IconButton icon="close" size={36} iconSize={18} onClick={onClose} aria-label="Cerrar" />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "18px 26px" }}>
        <span className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 10 }}>Productos</span>
        {order.items.map((item) => {
          const product = PRODUCTS.find((p) => p.productId === item.productId);
          return (
            <div key={item.productId} style={{ display: "grid", gridTemplateColumns: "56px 1fr auto", gap: 12, alignItems: "center", padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
              <div style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden" }}>
                <ProductImage image={product?.image} thumbnail={product?.thumbnail} name={item.productName} type={product?.type} accent={product?.accent} category={product?.category} />
              </div>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 500 }}>{item.productName}</div>
                <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>Cantidad: {item.quantity}</div>
              </div>
              <div style={{ fontSize: 13.5, textAlign: "right" }}>{formatCurrency(item.lineTotal)}</div>
            </div>
          );
        })}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "14px 0", marginBottom: 4 }}>
          <span className="display" style={{ fontSize: 18 }}>Total</span>
          <span className="display" style={{ fontSize: 22 }}>{formatCurrency(order.total)}</span>
        </div>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
          <span className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 8 }}>Dirección de envío</span>
          <p style={{ fontSize: 13, lineHeight: 1.6 }}>
            <strong>{order.shippingAddress.recipientName}</strong>
            <br />
            {order.shippingAddress.streetLine1}
            {order.shippingAddress.streetLine2 ? `, ${order.shippingAddress.streetLine2}` : ""}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.stateProvince} {order.shippingAddress.postalCode} · {country?.name}
          </p>
        </div>

        <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
          <span className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 8 }}>Método de pago</span>
          <p style={{ fontSize: 13 }}>{order.paymentMethodLabel}</p>
        </div>

        {order.shipment && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
            <span className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 8 }}>Envío</span>
            <p style={{ fontSize: 13, lineHeight: 1.6 }}>
              {order.shipment.carrierName || order.shipment.carrierCode}
              {order.shipment.trackingNumber && <> — guía {order.shipment.trackingNumber}</>}
              {order.shipment.trackingUrl && (
                <>
                  {" "}
                  <a href={order.shipment.trackingUrl} target="_blank" rel="noreferrer" style={{ color: "var(--botanic-deep)", fontWeight: 600 }}>
                    Rastrear envío
                  </a>
                </>
              )}
            </p>
            <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 4 }}>
              Enviado el {formatDate(order.shipment.shippedAt)}
              {order.shipment.deliveredAt && <> · Entregado el {formatDate(order.shipment.deliveredAt)}</>}
            </p>
          </div>
        )}

        {order.statusHistory?.length > 0 && (
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--line)" }}>
            <span className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 10 }}>Seguimiento del pedido</span>
            <div>
              {order.statusHistory.map((entry, i) => {
                const entryStatus = getStatus(entry.status);
                return (
                  <div key={i} style={{ display: "flex", gap: 12, paddingBottom: i === order.statusHistory.length - 1 ? 0 : 14 }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <span style={{ width: 9, height: 9, borderRadius: 999, background: entryStatus.color, flexShrink: 0, marginTop: 3 }} />
                      {i !== order.statusHistory.length - 1 && <span style={{ width: 1, flex: 1, background: "var(--line)", marginTop: 4 }} />}
                    </div>
                    <div style={{ paddingBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{entryStatus.label}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{formatDateTime(entry.changedAt)}</div>
                      {entry.note && <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{entry.note}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
