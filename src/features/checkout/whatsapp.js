import { formatCurrency } from "@shared/i18n/currency";

// Camino alterno de pago: la persona arma el pedido en el checkout normal (contacto,
// dirección, envío) pero en vez de pagar con tarjeta/Bold, confirma y coordina el pago
// directo con nosotras por WhatsApp. No crea un pedido real en el backend — solo arma
// el mensaje con el resumen del carrito para que la persona solo tenga que darle "enviar".
export const WHATSAPP_PHONE = "573103879555";
export const WHATSAPP_DISPLAY = "+57 310 3879555";

export function buildWhatsAppCheckoutMessage({ cart, shippingOption, contact }) {
  const shippingCost = shippingOption ? (shippingOption.freeShippingApplied ? 0 : shippingOption.cost) : 0;
  const total = cart.total + shippingCost;

  const lines = [
    "¡Hola! Quiero confirmar este pedido de *Sharon*:",
    "",
    ...cart.items.map((it) => `• ${it.productName} x${it.quantity} — ${formatCurrency(it.subtotal)}`),
    "",
    `Subtotal: ${formatCurrency(cart.subtotal)}`,
  ];

  if (cart.discount > 0) {
    lines.push(`Descuento${cart.couponCode ? ` (${cart.couponCode})` : ""}: -${formatCurrency(cart.discount)}`);
  }
  lines.push(`Envío${shippingOption ? ` (${shippingOption.label})` : ""}: ${shippingOption ? (shippingCost === 0 ? "Gratis" : formatCurrency(shippingCost)) : "Por definir"}`);
  lines.push(`Total: ${formatCurrency(total)}`);
  lines.push("");
  lines.push("Mis datos:");
  lines.push(`Nombre: ${contact.name}`);
  lines.push(`Teléfono: ${contact.phone}`);
  lines.push(`Dirección: ${contact.address}`);
  if (contact.email) lines.push(`Correo: ${contact.email}`);
  lines.push("");
  lines.push("Quedo atento/a para coordinar el pago. ¡Gracias!");

  return lines.join("\n");
}

export function whatsAppCheckoutUrl(message) {
  return `https://api.whatsapp.com/send?phone=${WHATSAPP_PHONE}&text=${encodeURIComponent(message)}`;
}
