import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Nav } from "@ui/Nav";
import { HomePage } from "./pages/HomePage";
import { CatalogPage } from "./pages/CatalogPage";
import { Footer } from "@ui/Footer";
import { CartDrawer } from "@features/cart/components/CartDrawer";
import { SearchModal } from "@features/catalog/components/SearchModal";
import { AuthModal } from "@features/auth/components/AuthModal";
import { ResetPasswordModal } from "@features/auth/components/reset-password/ResetPasswordModal";
import { EmailVerificationModal } from "@features/auth/components/verify-email/EmailVerificationModal";
import { ProfileModal } from "@features/profile/components/ProfileModal";
import { DeleteAccountModal } from "@features/profile/components/delete-account/DeleteAccountModal";
import { useAuth } from "@shared/auth/AuthContext";
import { useCart } from "@shared/cart/CartContext";
import { listAddresses, listOrders, listWishlist, addToWishlist, removeFromWishlist } from "@shared/api-client";
import { WishlistModal } from "@features/wishlist/components/WishlistModal";
import { ProductDetailModal } from "@features/catalog/components/ProductDetailModal";
import { MobileMenu } from "@ui/MobileMenu";
import { AnnouncementBar } from "@ui/AnnouncementBar";
import { TweaksPanel, TweakSection, TweakToggle, TweakSelect } from "@ui/TweaksPanel";

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
  const [wishlist, setWishlist] = useState([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  // Única instancia de ProductDetailModal en toda la app — Products/SearchModal/
  // FeaturedProducts abren el mismo modal vía onOpenProduct en vez de montar cada
  // una la suya (Modal nunca se desmonta, así que tres instancias propias dejaban
  // tres <div id="product-detail-title"> duplicados en el DOM simultáneamente).
  const [detailSlug, setDetailSlug] = useState(null);
  const { mergeGuestCart } = useCart();
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

  const openAuth = (mode = "register") => {
    setAuthInitialMode(mode);
    setAccountOpen(true);
  };

  const wishlistIds = useMemo(() => new Set(wishlist.map((w) => w.productId)), [wishlist]);

  // Favoritos requiere sesión (el backend exige Bearer token en toda ruta de
  // wishlist) — sin usuario, el corazón abre login en vez de guardar nada.
  // Optimista: actualiza el estado local de una vez y revierte si la llamada falla.
  const handleWish = (product) => {
    if (!user) {
      openAuth("login");
      return;
    }
    const accessToken = getAccessToken();
    if (wishlistIds.has(product.productId)) {
      setWishlist((prev) => prev.filter((w) => w.productId !== product.productId));
      removeFromWishlist(product.productId, accessToken).catch(() => {
        setWishlist((prev) => [...prev, { productId: product.productId, addedAt: new Date().toISOString() }]);
      });
    } else {
      setWishlist((prev) => [...prev, { productId: product.productId, addedAt: new Date().toISOString() }]);
      addToWishlist(product.productId, accessToken).catch(() => {
        setWishlist((prev) => prev.filter((w) => w.productId !== product.productId));
      });
    }
  };

  const openWishlist = () => (user ? setWishlistOpen(true) : openAuth("login"));

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
    // [0028][FE] Google simulado no trae accessToken, así que no hay carrito de
    // cuenta contra el que fusionar todavía — solo el login real dispara el merge.
    if (accessToken) mergeGuestCart(accessToken);
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

  // [0012][BE] Favoritos reales: mismo patrón que addresses/orders arriba, se cargan
  // contra GET /wishlist apenas hay sesión y se limpian al cerrar sesión. El backend
  // pagina pero el catálogo es chico, así que basta una sola página grande.
  useEffect(() => {
    if (!user) {
      setWishlist([]);
      return;
    }
    let cancelled = false;
    listWishlist({ limit: 100 }, getAccessToken())
      .then((res) => {
        if (!cancelled) setWishlist(res.items);
      })
      .catch(() => {
        if (!cancelled) setWishlist([]);
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
        onOpenWishlist={openWishlist}
        wishlistCount={wishlist.length}
        loggedIn={Boolean(user)}
      />

      <main>
        <Routes>
          <Route
            path="/"
            element={<HomePage onWish={handleWish} wishlistIds={wishlistIds} onOpenProduct={setDetailSlug} />}
          />
          <Route
            path="/tienda"
            element={<CatalogPage onWish={handleWish} wishlistIds={wishlistIds} onOpenProduct={setDetailSlug} />}
          />
          {/* /reset-password y /verify-email son solo puntos de entrada para un modal
              (ver ResetPasswordModal/EmailVerificationModal abajo) — el fondo siempre
              fue la landing, así que cae en Home igual que antes de tener router. */}
          <Route
            path="/reset-password"
            element={<HomePage onWish={handleWish} wishlistIds={wishlistIds} onOpenProduct={setDetailSlug} />}
          />
          <Route
            path="/verify-email"
            element={<HomePage onWish={handleWish} wishlistIds={wishlistIds} onOpenProduct={setDetailSlug} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      <CartDrawer
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        user={user}
        addresses={addresses}
        onOrderPlaced={(order) => setOrders((prev) => [order, ...prev])}
      />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} onOpenProduct={setDetailSlug} />
      <ProductDetailModal
        slug={detailSlug}
        onClose={() => setDetailSlug(null)}
        onSlugChange={setDetailSlug}
        onViewCart={() => { setDetailSlug(null); setCartOpen(true); }}
        onWish={handleWish}
        wishlistIds={wishlistIds}
        orders={orders}
      />
      <WishlistModal
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        items={wishlist}
        onOpenProduct={setDetailSlug}
        onRemove={handleWish}
      />
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
