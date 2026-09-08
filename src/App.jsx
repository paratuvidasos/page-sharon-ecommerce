import { useEffect, useMemo, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useUser as useClerkUser, useAuth as useClerkAuth, useClerk } from "@clerk/react";
import { Nav } from "@ui/Nav";
import { HomePage } from "./pages/HomePage";
import { CatalogPage } from "./pages/CatalogPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { CheckoutResultPage } from "./pages/CheckoutResultPage";
import { Footer } from "@ui/Footer";
import { CartDrawer } from "@features/cart/components/CartDrawer";
import { SearchModal } from "@features/catalog/components/SearchModal";
import { AuthModal } from "@features/auth/components/AuthModal";
import { ResetPasswordModal } from "@features/auth/components/reset-password/ResetPasswordModal";
import { EmailVerificationModal } from "@features/auth/components/verify-email/EmailVerificationModal";
import { SsoCallbackHandler } from "@features/auth/components/sso-callback/SsoCallbackHandler";
import { ProfileModal } from "@features/profile/components/ProfileModal";
import { DeleteAccountModal } from "@features/profile/components/delete-account/DeleteAccountModal";
import { useAuth } from "@shared/auth/AuthContext";
import { useCart } from "@shared/cart/CartContext";
import { listAddresses, listOrders, listWishlist, addToWishlist, removeFromWishlist, loginWithGoogle } from "@shared/api-client";
import { WishlistModal } from "@features/wishlist/components/WishlistModal";
import { ProductDetailModal } from "@features/catalog/components/ProductDetailModal";
import { OrderDetailModal } from "@features/orders/components/OrderDetailModal";
import { OrderHistoryModal } from "@features/orders/components/OrderHistoryModal";
import { Z } from "@ui/zIndex";
import { MobileMenu } from "@ui/MobileMenu";
import { CartFab } from "@ui/CartFab";
import { AnnouncementBar } from "@ui/AnnouncementBar";
import { TweaksPanel, TweakSection, TweakToggle, TweakSelect } from "@ui/TweaksPanel";
import { AdminLayout } from "@features/admin/components/AdminLayout";
import { AdminDashboard } from "@features/admin/components/dashboard/AdminDashboard";
import { AdminOrders } from "@features/admin/components/orders/AdminOrders";
import { AdminProducts } from "@features/admin/components/products/AdminProducts";
import { AdminCustomers } from "@features/admin/components/customers/AdminCustomers";
import { AdminCoupons } from "@features/admin/components/coupons/AdminCoupons";
import { AdminTeam } from "@features/admin/components/team/AdminTeam";
import { AdminSettings } from "@features/admin/components/settings/AdminSettings";
import { AdminCategories } from "@features/admin/components/categories/AdminCategories";
import { AdminInventory } from "@features/admin/components/inventory/AdminInventory";
import { AdminReviews } from "@features/admin/components/reviews/AdminReviews";
import { AdminBanners } from "@features/admin/components/banners/AdminBanners";

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
  const { user, status, login: authLogin, logout: authLogout, logoutAll: authLogoutAll, updateUser, getAccessToken, profileReady, hasPassword } = useAuth();
  const { isLoaded: clerkLoaded, isSignedIn: clerkSignedIn } = useClerkUser();
  const { getToken: getClerkSessionToken } = useClerkAuth();
  const { signOut: clerkSignOut } = useClerk();
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
  // Pedido abierto desde una notificación ([0044][FE]): la campana no navega a una
  // ruta (no existe /pedidos/:orderNumber todavía), resuelve el orderNumber contra
  // `orders` (ya cargado por sesión, ver el efecto de listOrders más abajo) y abre
  // el mismo OrderDetailModal que usa el historial de pedidos del perfil.
  const [trackedOrderNumber, setTrackedOrderNumber] = useState(null);
  const trackedOrder = orders.find((o) => o.orderNumber === trackedOrderNumber) || null;
  // Historial de pedidos: se abre directo desde el menú desplegable de la cuenta
  // (AccountMenu), no desde dentro de ProfileModal — solo tiene sentido para cuentas
  // registradas (AccountMenu ya oculta esta opción para invitados/sin sesión).
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);
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
  // en memoria únicamente. Tanto login por correo como Google (vía ClerkGoogleBridge
  // abajo, que cambia el session token de Clerk por un accessToken real de este backend
  // en POST /accounts/oauth/google) llegan acá con un accessToken de verdad. Solo se
  // conserva phone/countryCode/avatarUrl previos si es la misma cuenta ya editada en
  // esta sesión (ProfileModal los llena).
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
    if (accessToken) mergeGuestCart(accessToken);
  };

  // Puente entre la sesión de Clerk (Google) y la sesión real de este backend: el redirect
  // de OAuth sale de la SPA por completo (ver AuthModal.handleGoogleContinue +
  // SsoCallbackHandler), así que nada dentro del modal sigue vivo para recibir el
  // resultado. En cuanto Clerk reporta sesión activa y el AuthContext local sigue en
  // "guest", se cambia el session token de Clerk por un accessToken propio en
  // POST /accounts/oauth/google (el backend vincula por email o crea la cuenta) y se
  // completa el login local igual que un login por correo. Se frena solo con
  // `status !== "guest"`: handleAuthSuccess deja status en "authenticated", así que este
  // efecto no vuelve a dispararse hasta el próximo logout.
  useEffect(() => {
    if (!clerkLoaded || !clerkSignedIn || status !== "guest") return;
    let cancelled = false;
    (async () => {
      const sessionToken = await getClerkSessionToken();
      if (cancelled || !sessionToken) return;
      const { accessToken, user: apiUser } = await loginWithGoogle({ sessionToken });
      if (cancelled) return;
      handleAuthSuccess({
        name: `${apiUser.firstName} ${apiUser.lastName}`,
        email: apiUser.email,
        accessToken,
      });
    })().catch((err) => {
      console.error("No se pudo sincronizar el login con Google contra el backend", err);
    });
    return () => {
      cancelled = true;
    };
  }, [clerkLoaded, clerkSignedIn, status]);

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
  const refreshOrders = () => {
    if (!user) return;
    listOrders({ limit: 100 }, getAccessToken())
      .then((res) => setOrders(Array.isArray(res?.items) ? res.items : []))
      .catch(() => {});
  };
  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }
    let cancelled = false;
    listOrders({ limit: 100 }, getAccessToken())
      .then((res) => {
        if (!cancelled) setOrders(Array.isArray(res?.items) ? res.items : []);
      })
      .catch(() => {
        if (!cancelled) setOrders([]);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.email]);

  // El pedido que arma POST /orders/checkout todavía tiene status: "PENDING" a
  // propósito (el pago no se resolvió en ese instante) — CheckoutResultPage hace
  // polling sobre GET /orders/:orderNumber hasta confirmarlo y avisa acá para que la
  // fila en `orders` (historial, tracking desde notificaciones) no se quede congelada
  // en PENDING después de que el pago sí se aprobó.
  const handleOrderUpdated = (order) => {
    setOrders((prev) => {
      const idx = prev.findIndex((o) => o.orderNumber === order.orderNumber);
      if (idx === -1) return [order, ...prev];
      const next = [...prev];
      next[idx] = order;
      return next;
    });
  };

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
        if (!cancelled) setWishlist(Array.isArray(res?.items) ? res.items : []);
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
    // Sin esto, una sesión iniciada con Google (Clerk) seguiría activa del lado de Clerk
    // y ClerkGoogleBridge la volvería a loguear localmente en el siguiente render.
    await clerkSignOut().catch(() => {});
  };

  const handleLogoutAll = async () => {
    setProfileOpen(false);
    await authLogoutAll();
    await clerkSignOut().catch(() => {});
  };

  // [0010][BE] Eliminar cuenta: DeleteAccountModal ya hizo el DELETE real y limpió la
  // sesión en AuthContext antes de llamar acá — este handler solo oculta ProfileModal por
  // detrás (ver el comentario de Z.deleteAccount en shared/ui/zIndex.js sobre por qué el
  // modal de éxito vive fuera del árbol de ProfileModal).
  const handleAccountDeleted = () => {
    setProfileOpen(false);
  };

  const handleOpenOrderHistory = () => {
    setOrderHistoryOpen(true);
    refreshOrders();
  };

  // El panel admin tiene su propio shell (AdminLayout: sidebar + topbar), sin el
  // Nav/Footer de la tienda ni los modales globales de abajo — se renderiza aparte
  // en vez de meterlo dentro de <main> junto al resto de las rutas.
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="team" element={<AdminTeam />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    );
  }

  return (
    <>
      {/* <AnnouncementBar show={tweaks.showAnnouncement} /> */}
      <Nav
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenMenu={() => setMenuOpen(true)}
        onOpenAuth={() => openAuth("register")}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenOrderHistory={handleOpenOrderHistory}
        onLogout={handleLogout}
        onOpenWishlist={openWishlist}
        wishlistCount={wishlist.length}
        onOpenOrder={setTrackedOrderNumber}
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
          <Route
            path="/checkout"
            element={<CheckoutPage user={user} addresses={addresses} onOrderPlaced={(order) => setOrders((prev) => [order, ...prev])} />}
          />
          <Route path="/checkout/resultado" element={<CheckoutResultPage onOrderUpdated={handleOrderUpdated} />} />
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
          {/* Aterrizaje del redirect de OAuth de Google (ver AuthModal + SsoCallbackHandler
              abajo) — mismo patrón que /reset-password y /verify-email: el fondo es la
              landing, SsoCallbackHandler hace el trabajo real y no renderiza nada visible. */}
          <Route
            path="/sso-callback"
            element={<HomePage onWish={handleWish} wishlistIds={wishlistIds} onOpenProduct={setDetailSlug} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
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
      <MobileMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        wishlistCount={wishlist.length}
        onOpenWishlist={openWishlist}
        onOpenProfile={() => setProfileOpen(true)}
        onOpenAuth={() => openAuth("register")}
        onOpenOrder={setTrackedOrderNumber}
      />
      <CartFab onOpenCart={() => setCartOpen(true)} />
      <SsoCallbackHandler />
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
        hasPassword={hasPassword}
        onSave={(profile) => updateUser(profile)}
        addresses={addresses}
        setAddresses={setAddresses}
        onLogout={handleLogout}
        onLogoutAll={handleLogoutAll}
        onOpenDeleteAccount={() => setDeleteAccountOpen(true)}
      />
      <DeleteAccountModal
        open={deleteAccountOpen}
        onClose={() => setDeleteAccountOpen(false)}
        onDeleted={handleAccountDeleted}
      />
      <OrderHistoryModal
        open={orderHistoryOpen}
        onClose={() => setOrderHistoryOpen(false)}
        orders={orders}
      />
      <OrderDetailModal
        order={trackedOrder}
        onClose={() => setTrackedOrderNumber(null)}
        zIndex={Z.orderTracking}
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
