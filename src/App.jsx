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

  return (
    <>
      {/* <AnnouncementBar show={tweaks.showAnnouncement} /> */}
      <Nav
        onOpenCart={() => setCartOpen(true)}
        onOpenSearch={() => setSearchOpen(true)}
        onOpenMenu={() => setMenuOpen(true)}
        onOpenAccount={() => setAccountOpen(true)}
        cartCount={cartCount}
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
      <AuthModal open={accountOpen} onClose={() => setAccountOpen(false)} />

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
