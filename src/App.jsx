import { useEffect, useState } from "react";
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
import { DeleteAccountModal } from "@features/profile/components/delete-account/DeleteAccountModal";
import { useAuth } from "@shared/auth/AuthContext";
import { listAddresses, listOrders } from "@shared/api-client";
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
  // El backend genera ambos enlaces con el mismo nombre de query param (?token=...),
  // distinguibles solo por el pathname (/reset-password vs /verify-email) — no hay
  // routing todavía, así que App.jsx los desambigua a mano antes de decidir qué modal abrir.
  const [resetToken] = useState(() => new URLSearchParams(window.location.search).get("token"));
  const [resetModalOpen, setResetModalOpen] = useState(
    () => window.location.pathname === "/reset-password" && new URLSearchParams(window.location.search).has("token")
  );
  const [verifyToken] = useState(() => new URLSearchParams(window.location.search).get("token"));
  const [verifyModalOpen, setVerifyModalOpen] = useState(
    () => window.location.pathname === "/verify-email" && new URLSearchParams(window.location.search).has("token")
  );
  const { user, login: authLogin, logout: authLogout, logoutAll: authLogoutAll, updateUser, getAccessToken, profileReady } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
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
    url.searchParams.delete("token");
    window.history.replaceState({}, "", url);
  };

  const closeVerifyModal = () => {
    setVerifyModalOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("token");
    window.history.replaceState({}, "", url);
  };

  // El "usuario logueado" y su accessToken viven en AuthContext (ver src/shared/auth),
  // en memoria únicamente. Login por correo trae accessToken real (sesión de verdad);
  // Google sigue simulado y no trae token. Solo se conserva phone/countryCode/avatarUrl
  // previos si es la misma cuenta ya editada en esta sesión (ProfileModal los llena).
  const handleAuthSuccess = ({ name, email, accessToken }) => {
    const samePrevAccount = user?.email === email;
    authLogin(
      {
        name: name || user?.name || "",
        email,
        phone: samePrevAccount ? user?.phone || "" : "",
        countryCode: samePrevAccount ? user?.countryCode || "CO" : "CO",
        avatarUrl: samePrevAccount ? user?.avatarUrl || null : null,
      },
      accessToken
    );
  };

  // Direcciones sí son reales desde [0007][BE]: se cargan contra la API apenas hay
  // sesión (login por correo o el refresh-token automático al montar la app en
  // AuthContext), y se limpian al cerrar sesión. hasActiveOrder es un campo que solo
  // existe en el cliente (ver AddressBookModal) — el backend de direcciones no lo devuelve.
  useEffect(() => {
    if (!user) {
      setAddresses([]);
      return;
    }
    let cancelled = false;
    listAddresses(getAccessToken())
      .then((list) => {
        if (!cancelled) setAddresses(list.map((a) => ({ ...a, hasActiveOrder: false })));
      })
      .catch(() => {
        if (!cancelled) setAddresses([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  // Pedidos reales desde [0008][BE]: se cargan contra GET /orders apenas hay sesión
  // (mismo patrón que direcciones arriba) y se limpian al cerrar sesión. El backend
  // pagina, pero hoy no hay UI de paginación — se pide una sola página grande y basta,
  // porque mientras no exista creación real de pedidos ([checkout]) el historial es corto.
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    let cancelled = false;
    listOrders({ limit: 100 }, getAccessToken())
      .then((res) => {
        if (!cancelled) setOrders(res.items);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  // [0009][BE] Cerrar sesión: addresses/orders ya se limpian solos vía los efectos de
  // arriba en cuanto `user` pasa a null (mismo `user?.email` como dependencia). El
  // carrito en cambio es independiente de la cuenta (invitado también puede comprar),
  // así que cerrar sesión no lo toca.
  const handleLogout = async () => {
    setProfileOpen(false);
    await authLogout();
  };

  const handleLogoutAll = async () => {
    setProfileOpen(false);
    await authLogoutAll();
  };

  // [0010][BE] Eliminar cuenta: DeleteAccountModal ya hizo el DELETE real y limpió la
  // sesión en AuthContext antes de llamar acá — este handler solo oculta ProfileModal por
  // detrás (ver el comentario de Z.deleteAccount en shared/ui/zIndex.js sobre por qué el
  // modal de éxito vive fuera del árbol de ProfileModal).
  const handleAccountDeleted = () => {
    setProfileOpen(false);
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

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} items={cart} setItems={setCart} user={user} addresses={addresses} />
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
        profileReady={profileReady}
        onSave={(profile) => updateUser(profile)}
        addresses={addresses}
        setAddresses={setAddresses}
        orders={orders}
        onLogout={handleLogout}
        onLogoutAll={handleLogoutAll}
        onOpenDeleteAccount={() => setDeleteAccountOpen(true)}
      />
      <DeleteAccountModal
        open={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
        onDeleted={handleAccountDeleted}
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
