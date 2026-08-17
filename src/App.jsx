import { useState } from "react";
import { Nav } from "@ui/Nav";
import { Hero } from "@ui/Hero";
import { Products } from "@features/catalog/components/Products";
import { Benefits } from "@ui/Benefits";
import { BeforeAfter } from "@ui/BeforeAfter";
import { Testimonials } from "@ui/Testimonials";
import { PurchaseProcess } from "@ui/PurchaseProcess";
import { OfferBanner } from "@ui/OfferBanner";
import { Newsletter } from "@ui/Newsletter";
import { Footer } from "@ui/Footer";
import { CartDrawer } from "@features/cart/components/CartDrawer";
import { SearchModal } from "@features/catalog/components/SearchModal";
import { AuthModal } from "@features/auth/components/AuthModal";
import { ResetPasswordModal } from "@features/auth/components/reset-password/ResetPasswordModal";
import { EmailVerificationModal } from "@features/auth/components/verify-email/EmailVerificationModal";
import { ProfileModal } from "@features/profile/components/ProfileModal";
import { DEMO_ACCOUNT } from "@features/auth/components/login/LoginForm";
import { MobileMenu } from "@ui/MobileMenu";
import { AnnouncementBar } from "@ui/AnnouncementBar";
import { TweaksPanel, TweakSection, TweakToggle, TweakSelect } from "@ui/TweaksPanel";
import { PRODUCTS } from "@features/catalog/data/products";
import { Z } from "@ui/zIndex";

const ACCENT_PALETTES = {
  botanic: { deep: "#5E7860", soft: "#9CB29B", paper: "#D2DFD0" },
  rose:    { deep: "#C97B6A", soft: "#E8C7C0", paper: "#F3DDD7" },
  garnet:  { deep: "#9C4A4A", soft: "#D8A6A0", paper: "#EBD0CB" },
  ink:     { deep: "#1B1815", soft: "#7A6F66", paper: "#E5DED4" },
};

// Direcciones de ejemplo para la cuenta demo (ver DEMO_ACCOUNT en LoginForm), solo para
// poder probar en cliente la regla "no se puede eliminar la única dirección si tiene
// un pedido en curso" sin tener todavía una feature de pedidos real. "Casa" simula estar
// referenciada por un pedido en curso: intenta borrar "Oficina" primero y luego "Casa"
// para ver el bloqueo y la opción de archivar.
const DEMO_ADDRESSES = [
  { id: "addr_demo_casa", alias: "Casa", countryCode: "CO", line1: "Calle 10 # 43-12", line2: "Apto 502", city: "Medellín", postalCode: "050021", isDefault: true, archived: false, hasActiveOrder: true },
  { id: "addr_demo_oficina", alias: "Oficina", countryCode: "CO", line1: "Carrera 43A # 1-50", line2: "Piso 8", city: "Medellín", postalCode: "050021", isDefault: false, archived: false, hasActiveOrder: false },
];

// Snapshot de "Casa" (arriba) tal como quedaría guardado en un pedido — independiente
// del array de direcciones en sí, porque una dirección real puede editarse/archivarse
// después de comprar y el pedido debe conservar la dirección tal como era ese día.
const DEMO_SHIPPING_ADDRESS = { alias: "Casa", countryCode: "CO", line1: "Calle 10 # 43-12", line2: "Apto 502", city: "Medellín", postalCode: "050021" };

// Pedidos de ejemplo para la cuenta demo. Nota: esto es independiente del flag
// hasActiveOrder en DEMO_ADDRESSES — todavía no hay una feature de orders real que
// los conecte (ver CLAUDE.md > Pendiente de definir).
const DEMO_ORDERS = [
  {
    id: "SH-10231",
    placedAt: "2026-06-02T15:10:00-05:00",
    status: "delivered",
    items: [{ productId: "p1", name: "Tónico Capilar", qty: 1, price: 49900 }, { productId: "p4", name: "Cepíllo", qty: 1, price: 18000 }],
    total: 67900,
    shippingAddress: DEMO_SHIPPING_ADDRESS,
    paymentMethod: { type: "whatsapp", label: "Coordinado por WhatsApp" },
  },
  {
    id: "SH-10255",
    placedAt: "2026-07-10T11:45:00-05:00",
    status: "shipped",
    items: [{ productId: "p2", name: "Mascarilla Hidratante", qty: 2, price: 39900 }],
    total: 79800,
    shippingAddress: DEMO_SHIPPING_ADDRESS,
    paymentMethod: { type: "cod", label: "Pago contraentrega" },
  },
  {
    id: "SH-10298",
    placedAt: "2026-07-30T09:20:00-05:00",
    status: "processing",
    items: [{ productId: "p3", name: "Shampoo", qty: 1, price: 49900 }, { productId: "p1", name: "Tónico Capilar", qty: 1, price: 49900 }],
    total: 99800,
    shippingAddress: DEMO_SHIPPING_ADDRESS,
    paymentMethod: { type: "transfer", label: "Transferencia bancaria" },
  },
  {
    id: "SH-10310",
    placedAt: "2026-08-05T18:05:00-05:00",
    status: "cancelled",
    items: [{ productId: "p4", name: "Cepíllo", qty: 2, price: 18000 }],
    total: 36000,
    shippingAddress: DEMO_SHIPPING_ADDRESS,
    paymentMethod: { type: "whatsapp", label: "Coordinado por WhatsApp" },
  },
];

function applyTweaks(t) {
  const root = document.documentElement;
  const a = ACCENT_PALETTES[t.accent] || ACCENT_PALETTES.botanic;
  root.style.setProperty("--rose-deep", a.deep);
  root.style.setProperty("--rose", a.soft);
  root.style.setProperty("--rose-soft", a.paper);
}

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState("register");
  const [resetToken] = useState(() => new URLSearchParams(window.location.search).get("resetToken"));
  const [resetModalOpen, setResetModalOpen] = useState(() => new URLSearchParams(window.location.search).has("resetToken"));
  const [verifyToken] = useState(() => new URLSearchParams(window.location.search).get("token"));
  const [verifyModalOpen, setVerifyModalOpen] = useState(() => new URLSearchParams(window.location.search).has("token"));
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);
  const [tweaks, setTweaks] = useState({
    accent: "botanic",
    showAnnouncement: true,
  });

  const setTweak = (key, val) => {
    setTweaks(prev => {
      const next = { ...prev, [key]: val };
      applyTweaks(next);
      return next;
    });
  };

  const onAdd = (product) => {
    setCart(prev => {
      const ex = prev.find(p => p.id === product.id);
      if (ex) return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { ...product, qty: 1 }];
    });
    setToast({ name: product.name, t: Date.now() });
    setTimeout(() => setToast(null), 2400);
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const openAuth = (mode = "register") => {
    setAuthInitialMode(mode);
    setAccountOpen(true);
  };

  const closeResetModal = () => {
    setResetModalOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("resetToken");
    window.history.replaceState({}, "", url);
  };

  const closeVerifyModal = () => {
    setVerifyModalOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("token");
    window.history.replaceState({}, "", url);
  };

  // Sin backend/sesión real todavía: el "usuario logueado" es estado local que se
  // llena al completar registro/login/Google en AuthModal, y persiste solo en memoria.
  const handleAuthSuccess = ({ name, email }) => {
    setUser((prev) => ({
      name: name || prev?.name || "",
      email,
      phone: prev?.phone || "",
      countryCode: prev?.countryCode || "CO",
      avatarUrl: prev?.avatarUrl || null,
    }));
    setAddresses((prev) => {
      if (prev.length > 0) return prev; // ya hay direcciones cargadas en esta sesión, no las pisamos
      return email === DEMO_ACCOUNT.email ? DEMO_ADDRESSES.map((a) => ({ ...a })) : [];
    });
    setOrders((prev) => {
      if (prev.length > 0) return prev; // idem: no pisar pedidos ya cargados en esta sesión
      return email === DEMO_ACCOUNT.email ? DEMO_ORDERS.map((o) => ({ ...o })) : [];
    });
  };

  return (
    <>
      {/* <AnnouncementBar show={tweaks.showAnnouncement} /> */}
      <Nav
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenMenu={() => setMenuOpen(true)}
        onOpenAccount={() => (user ? setProfileOpen(true) : openAuth("register"))}
        cartCount={cartCount}
        loggedIn={Boolean(user)}
      />

      <main>
        <Hero onShop={() => document.getElementById("shop").scrollIntoView({ behavior: "smooth", block: "start" })} />
        <Products onAdd={onAdd} />
        <Benefits />
        <BeforeAfter />
        <PurchaseProcess />
        <Testimonials />
        <OfferBanner />
        <Newsletter />
      </main>

      <Footer />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cart} setItems={setCart} />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} products={PRODUCTS} onPick={onAdd} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <AuthModal
        open={accountOpen}
        onClose={() => setAccountOpen(false)}
        initialMode={authInitialMode}
        onAuthSuccess={handleAuthSuccess}
      />
      <ResetPasswordModal
        open={resetModalOpen}
        onClose={closeResetModal}
        token={resetToken}
        onRequestNewLink={() => { closeResetModal(); openAuth("forgot"); }}
        onGoToLogin={() => { closeResetModal(); openAuth("login"); }}
      />
      <EmailVerificationModal
        open={verifyModalOpen}
        onClose={closeVerifyModal}
        token={verifyToken}
        onGoToLogin={() => { closeVerifyModal(); openAuth("login"); }}
      />
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={user}
        onSave={(profile) => setUser((prev) => ({ ...prev, ...profile }))}
        addresses={addresses}
        setAddresses={setAddresses}
        orders={orders}
      />

      {toast && (
        <div style={{
          position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)",
          background: "var(--ink)", color: "var(--cream)",
          padding: "14px 22px", borderRadius: 999,
          fontSize: 13, fontWeight: 500, zIndex: Z.toast,
          boxShadow: "var(--shadow-lg)",
          display: "flex", alignItems: "center", gap: 10,
          animation: "scaleIn .25s ease-out"
        }}>
          <span style={{ color: "var(--gold-soft)" }}>✦</span>
          {toast.name} añadido a tu bolsa
          <button onClick={() => { setToast(null); setCartOpen(true); }}
            style={{ marginLeft: 6, background: "transparent", border: 0, color: "var(--botanic)", cursor: "pointer", fontSize: 12, textDecoration: "underline" }}>
            Ver bolsa
          </button>
        </div>
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection label="Estética" />
        <TweakSelect label="Acento" value={tweaks.accent}
          options={["botanic", "rose", "garnet", "ink"]}
          onChange={(v) => setTweak("accent", v)} />
        <TweakToggle label="Barra de anuncio" value={tweaks.showAnnouncement}
          onChange={(v) => setTweak("showAnnouncement", v)} />
      </TweaksPanel>
    </>
  );
}

export default App;
