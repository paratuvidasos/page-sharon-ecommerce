import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { COUNTRIES } from "@shared/data/countries";
import { checkout, ApiError } from "@shared/api-client";
import { useAuth } from "@shared/auth/AuthContext";
import { useCart } from "@shared/cart/CartContext";
import { Button } from "@ui/components/Button";
import { ContactStep, validateGuestFields } from "@features/checkout/components/ContactStep";
import { AddressStep, MANUAL_ADDRESS } from "@features/checkout/components/AddressStep";
import { ShippingMethodStep } from "@features/checkout/components/ShippingMethodStep";
import { PaymentMethodStep } from "@features/checkout/components/PaymentMethodStep";
import { OrderSummary } from "@features/checkout/components/OrderSummary";
import { CheckoutErrorBanner } from "@features/checkout/components/CheckoutErrorBanner";
import { BoldPaymentPanel } from "@features/checkout/components/payment/BoldPaymentPanel";
import { validateAddressFields } from "@features/checkout/validation";

// [0041] Solo COP está habilitado hoy (mismo alcance que shared/i18n/currency.js) — no
// hay endpoint para saber qué monedas habilitó el backend, así que no se pinta selector.
// Revisar cuando exista esa información.
const CURRENCY = "COP";

// Vista dedicada de checkout ([0032]-[0041][FE]): reemplaza el flujo anterior de
// CartDrawer -> modal de checkout. Dos columnas (pasos a la izquierda, resumen sticky
// a la derecha), reemplaza el cálculo de envío en cliente por POST /shipping/quote y
// agrega selección de método de pago real + Botón de Pagos de Bold.
export const CheckoutPage = ({ user, addresses, onOrderPlaced }) => {
  const { getAccessToken, login } = useAuth();
  const { cart, loading: cartLoading, refreshCart, removeCoupon } = useCart();

  const savedAddresses = useMemo(() => (addresses || []).filter((a) => !a.archived), [addresses]);
  const defaultAddress = useMemo(() => savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || null, [savedAddresses]);

  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.id || MANUAL_ADDRESS);
  // `addresses` llega async desde App.jsx (GET /accounts/me/addresses arranca después
  // de resolver la sesión) — en la primera carga de /checkout casi siempre todavía es
  // [], así que el useState de arriba solo alcanza a inicializar en MANUAL_ADDRESS.
  // Este efecto corrige la preselección apenas llega la dirección predeterminada real,
  // pero solo mientras el usuario no haya tocado el selector él mismo.
  const [addressTouched, setAddressTouched] = useState(false);
  useEffect(() => {
    if (!addressTouched && defaultAddress && selectedAddressId !== defaultAddress.id) {
      setSelectedAddressId(defaultAddress.id);
    }
  }, [addressTouched, defaultAddress, selectedAddressId]);
  const handleSelectAddress = (id) => {
    setAddressTouched(true);
    setSelectedAddressId(id);
  };
  const [manual, setManual] = useState({
    recipientName: user?.name || "",
    countryCode: COUNTRIES[0].code,
    phone: "",
    streetLine1: "",
    streetLine2: "",
    stateProvince: "",
    city: "",
    postalCode: "",
  });
  const [manualErrors, setManualErrors] = useState({});
  const [manualTouched, setManualTouched] = useState({});

  const [guest, setGuest] = useState({ email: "", createAccount: false, firstName: "", lastName: "", password: "" });
  const [guestErrors, setGuestErrors] = useState({});
  const [guestTouched, setGuestTouched] = useState({});

  const [shippingOption, setShippingOption] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [phase, setPhase] = useState("form"); // "form" | "paying"
  const [orderResult, setOrderResult] = useState(null);

  const selected = savedAddresses.find((a) => a.id === selectedAddressId);
  const isManual = selectedAddressId === MANUAL_ADDRESS || savedAddresses.length === 0;
  const hasAddress = isManual ? Boolean(manual.stateProvince.trim() && manual.countryCode) : Boolean(selected);
  const addressCountryCode = isManual ? manual.countryCode : selected?.countryCode || COUNTRIES[0].code;
  const addressStateProvince = isManual ? manual.stateProvince : selected?.stateProvince || "";
  const addressPostalCode = isManual ? manual.postalCode : selected?.postalCode || "";

  // Referencia estable para no re-cotizar en cada render (ShippingMethodStep depende
  // de `items` en su useEffect) — solo cambia cuando de verdad cambia el contenido.
  const shippingItems = useMemo(
    () => cart.items.map((it) => ({ variantId: it.variantId, quantity: it.quantity })),
    [cart.items]
  );

  if (!cartLoading && cart.items.length === 0 && phase === "form") {
    return <Navigate to="/tienda" replace />;
  }
  if (cartLoading && phase === "form") {
    return <div style={{ paddingTop: 150, paddingBottom: 100, minHeight: "70vh" }} />;
  }

  const handleManualChange = (field, value) => {
    setManual((prev) => ({ ...prev, [field]: value }));
    setManualErrors((prev) => (manualTouched[field] ? { ...prev, [field]: validateAddressFields({ ...manual, [field]: value })[field] } : prev));
  };
  const handleManualBlur = (field) => {
    setManualTouched((prev) => ({ ...prev, [field]: true }));
    setManualErrors((prev) => ({ ...prev, [field]: validateAddressFields(manual)[field] }));
  };

  const handleGuestChange = (field, value) => {
    setGuest((prev) => ({ ...prev, [field]: value }));
    setGuestErrors((prev) => (guestTouched[field] ? { ...prev, ...validateGuestFields({ ...guest, [field]: value }) } : prev));
  };
  const handleGuestBlur = (field) => {
    setGuestTouched((prev) => ({ ...prev, [field]: true }));
    setGuestErrors((prev) => ({ ...prev, ...validateGuestFields(guest) }));
  };

  const handleConfirm = async () => {
    const nextGuestErrors = !user ? validateGuestFields(guest) : {};
    const nextAddressErrors = isManual ? validateAddressFields(manual) : {};
    setGuestErrors(nextGuestErrors);
    setGuestTouched((prev) => ({ ...prev, ...Object.fromEntries(Object.keys(nextGuestErrors).map((k) => [k, true])) }));
    setManualErrors(nextAddressErrors);
    setManualTouched((prev) => ({ ...prev, ...Object.fromEntries(Object.keys(nextAddressErrors).map((k) => [k, true])) }));

    const hasFieldErrors = Object.values(nextGuestErrors).some(Boolean) || Object.values(nextAddressErrors).some(Boolean);

    if (hasFieldErrors) return;
    if (!shippingOption) {
      setCheckoutError({ code: null, message: "Selecciona un método de envío antes de continuar." });
      return;
    }
    if (!paymentMethod) {
      setCheckoutError({ code: null, message: "Selecciona un método de pago antes de continuar." });
      return;
    }

    setSubmitting(true);
    setCheckoutError(null);

    const payload = {
      items: cart.items.map((it) => ({ variantId: it.variantId, quantity: it.quantity, expectedUnitPrice: it.unitPrice })),
      shippingMethod: shippingOption.method,
      currency: CURRENCY,
      paymentMethod: paymentMethod.method,
      paymentMethodLabel: paymentMethod.label,
    };
    if (isManual) {
      const country = COUNTRIES.find((c) => c.code === manual.countryCode) || COUNTRIES[0];
      payload.shippingAddress = {
        recipientName: manual.recipientName.trim(),
        phone: `${country.dialCode}${manual.phone}`,
        countryCode: manual.countryCode,
        stateProvince: manual.stateProvince.trim(),
        city: manual.city.trim(),
        postalCode: manual.postalCode.trim(),
        streetLine1: manual.streetLine1.trim(),
        streetLine2: manual.streetLine2.trim() || undefined,
      };
    } else {
      payload.shippingAddressId = selected.id;
    }
    if (cart.couponCode) payload.couponCode = cart.couponCode;
    if (!user) {
      payload.guestEmail = guest.email.trim();
      if (guest.createAccount) {
        payload.createAccount = true;
        payload.firstName = guest.firstName.trim();
        payload.lastName = guest.lastName.trim();
        payload.password = guest.password;
      }
    }

    try {
      const res = await checkout(payload, getAccessToken());
      if (res.account) {
        login(
          { name: `${payload.firstName} ${payload.lastName}`, email: payload.guestEmail, phone: "", countryCode: "CO", avatarUrl: null },
          res.account.accessToken
        );
      }
      onOrderPlaced?.(res.order);
      setOrderResult(res);
      setPhase("paying");
    } catch (e) {
      if (e instanceof ApiError && e.code === "GUEST_EMAIL_REQUIRED") {
        setGuestTouched((prev) => ({ ...prev, email: true }));
        setGuestErrors((prev) => ({ ...prev, email: e.message }));
      } else if (e instanceof ApiError) {
        setCheckoutError({ code: e.code, message: e.message, lines: e.lines, restrictedProducts: e.restrictedProducts });
      } else {
        setCheckoutError({ code: null, message: "No pudimos procesar tu pedido. Intenta de nuevo en unos segundos." });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefreshCart = async () => {
    await refreshCart();
    setCheckoutError(null);
  };
  const handleRemoveCoupon = async () => {
    await removeCoupon();
    setCheckoutError(null);
  };

  return (
    <div style={{ paddingTop: 150, paddingBottom: 100, minHeight: "70vh" }}>
      <div className="wrap">
        <h1 className="display" style={{ fontSize: "clamp(28px, 4vw, 40px)", marginBottom: 32 }}>
          {phase === "paying" ? "Completa tu pago" : "Finalizar compra"}
        </h1>

        <div className="checkout-layout" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 40, alignItems: "start" }}>
          <div>
            {phase === "form" ? (
              <>
                <CheckoutErrorBanner error={checkoutError} cartItems={cart.items} onRefreshCart={handleRefreshCart} onRemoveCoupon={handleRemoveCoupon} />

                <Section title="Contacto">
                  <ContactStep user={user} guest={guest} onGuestChange={handleGuestChange} errors={guestErrors} touched={guestTouched} onBlur={handleGuestBlur} />
                </Section>

                <Section title="Entrega">
                  <AddressStep
                    addresses={savedAddresses}
                    selectedAddressId={selectedAddressId}
                    onSelectAddress={handleSelectAddress}
                    manual={manual}
                    errors={manualErrors}
                    touched={manualTouched}
                    onManualChange={handleManualChange}
                    onManualBlur={handleManualBlur}
                  />
                </Section>

                <Section title="Envío">
                  <ShippingMethodStep
                    countryCode={addressCountryCode}
                    stateProvince={addressStateProvince}
                    postalCode={addressPostalCode}
                    subtotal={cart.total}
                    currency={CURRENCY}
                    items={shippingItems}
                    hasAddress={hasAddress}
                    value={shippingOption}
                    onSelect={setShippingOption}
                  />
                </Section>

                <Section title="Pago">
                  <PaymentMethodStep
                    countryCode={addressCountryCode}
                    currency={CURRENCY}
                    value={paymentMethod}
                    onSelect={setPaymentMethod}
                  />
                </Section>

                <Button
                  onClick={handleConfirm}
                  disabled={submitting}
                  style={{ width: "100%", justifyContent: "center", opacity: submitting ? 0.6 : 1, cursor: submitting ? "not-allowed" : "pointer", marginTop: 8 }}
                >
                  {submitting ? "Procesando…" : "Pagar ahora"}
                </Button>
                <div style={{ textAlign: "center", color: "var(--ink-soft)", fontSize: 11, marginTop: 8 }}>
                  Al confirmar aceptas nuestros términos y condiciones.
                </div>
              </>
            ) : (
              <Section title="Pago">
                <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 16 }}>
                  Tu pedido <strong>{orderResult.order.orderNumber}</strong> quedó registrado. Completa el pago para confirmarlo.
                </p>
                <BoldPaymentPanel payment={orderResult.payment} orderNumber={orderResult.order.orderNumber} email={user?.email || guest.email} />
              </Section>
            )}
          </div>

          <div style={{ position: "sticky", top: 100 }}>
            <OrderSummary cart={cart} shippingOption={shippingOption} />
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .checkout-layout { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 28, paddingBottom: 28, borderBottom: "1px solid var(--line)" }}>
    <div className="eyebrow" style={{ marginBottom: 14, fontSize: 10 }}>{title}</div>
    {children}
  </div>
);
