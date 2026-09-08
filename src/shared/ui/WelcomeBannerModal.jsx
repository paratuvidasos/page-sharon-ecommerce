import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Modal } from "./components/Modal";
import { IconButton } from "./components/IconButton";
import { Icon } from "./Icon";
import { Z } from "./zIndex";
import { listPublicBanners } from "@shared/api-client";

export const WELCOME_BANNER_STORAGE_KEY = "sharon_welcome_banner_last_shown";

// La navegación al hacer click depende SOLO de category, nunca de linkUrl (aunque el
// banner traiga uno) — regla explícita del backlog. EVENTO y GENERAL son puramente
// informativos: no hacen nada al hacer click.
const CLICKABLE_CATEGORIES = ["KIT", "PROMOCION", "LANZAMIENTO", "COLECCION"];
const CATALOG_PATH = "/tienda";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function ctaLabel(actionType, t) {
  if (actionType === "COMPRAR") return t("welcomeBanner.ctaBuy");
  if (actionType === "INSCRIPCION") return t("welcomeBanner.ctaSubscribe");
  return null;
}

// Modal de bienvenida ([banners home]): carga los banners de placement=WELCOME_MODAL
// y se abre solo, una vez por día calendario (localStorage, decisión de frontend —
// el backend no controla esto), siempre que existan banners vigentes para ese
// placement. Vive en HomePage.jsx (no App.jsx) porque es contenido exclusivo de "/".
// No reabre en cada recarga a propósito (ver discusión del backlog: un popup que
// vuelve en cada F5 se siente invasivo) — en su lugar, mientras haya banners
// cargados queda un botón flotante abajo a la derecha para reabrirlo a demanda.
export const WelcomeBannerModal = () => {
  const { t } = useTranslation("home");
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    listPublicBanners("WELCOME_MODAL")
      .then((data) => {
        if (cancelled) return;
        const items = Array.isArray(data?.items) ? data.items : [];
        setBanners(items);
        if (items.length === 0) return;
        let lastShown = null;
        try {
          lastShown = window.localStorage.getItem(WELCOME_BANNER_STORAGE_KEY);
        } catch {
          lastShown = null;
        }
        if (lastShown === todayKey()) return;
        setOpen(true);
        try {
          window.localStorage.setItem(WELCOME_BANNER_STORAGE_KEY, todayKey());
        } catch {
          // localStorage no disponible (modo privado, cuota, etc.) — el modal igual
          // se muestra esta vez, solo no se recuerda para la próxima carga.
        }
      })
      .catch(() => {
        if (!cancelled) setBanners([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Sin banners no hay nada que mostrar ni que reabrir — ni modal ni FAB.
  if (banners.length === 0) return null;

  const banner = banners[Math.min(index, banners.length - 1)];
  const cta = ctaLabel(banner.actionType, t);
  const isClickable = CLICKABLE_CATEGORIES.includes(banner.category);

  const handleBannerClick = () => {
    if (!isClickable) return;
    setOpen(false);
    navigate(CATALOG_PATH);
  };

  const reopen = () => {
    setIndex(0);
    setOpen(true);
  };

  return (
    <>
      {/* Modal.jsx mantiene sus children montados en el DOM aunque `open` sea false
          (solo anima opacity/pointerEvents) — acá se monta condicionalmente en vez de
          pasarle `open` reactivo, para que cerrarlo (o no haberse ganado el sorteo del
          día) realmente saque el banner del DOM y del tab order. */}
      {open && (
        <Modal
          open
          onClose={() => setOpen(false)}
          zIndex={Z.welcomeBanner}
          closeOnOverlayClick
          closeOnEscape
          width="min(720px, 92vw)"
          ariaLabel={banner.title || t("welcomeBanner.close")}
          panelStyle={{ borderRadius: 20, overflow: "hidden", background: "var(--cream)", padding: 0 }}
        >
          <div data-testid="welcome-banner-modal" data-current-index={index} style={{ position: "relative" }}>
            <IconButton
              icon="close"
              size={38}
              iconSize={18}
              onClick={() => setOpen(false)}
              aria-label={t("welcomeBanner.close")}
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                zIndex: 2,
                background: "rgba(27,24,21,.55)",
                color: "#fff",
              }}
            />
            <button
              type="button"
              onClick={handleBannerClick}
              style={{
                display: "block",
                width: "100%",
                padding: 0,
                border: 0,
                background: "none",
                cursor: isClickable ? "pointer" : "default",
              }}
            >
              <img
                src={banner.imageUrl}
                alt={banner.title || ""}
                draggable={false}
                style={{ width: "100%", height: "min(80vh, 640px)", objectFit: "cover", display: "block" }}
              />
              {cta && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: 20,
                    bottom: banners.length > 1 ? 44 : 20,
                    background: "var(--botanic-deep)",
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    padding: "8px 16px",
                    borderRadius: 999,
                  }}
                >
                  {cta}
                </span>
              )}
            </button>
            {banners.length > 1 && (
              <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
                {banners.map((b, i) => (
                  <button
                    key={b.id ?? i}
                    type="button"
                    aria-label={t("welcomeBanner.goToSlide", { number: i + 1 })}
                    onClick={() => setIndex(i)}
                    style={{
                      width: i === index ? 24 : 8,
                      height: 8,
                      borderRadius: 999,
                      border: 0,
                      padding: 0,
                      cursor: "pointer",
                      background: i === index ? "var(--cream)" : "rgba(251,247,242,.5)",
                      transition: "width .25s ease",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Botón flotante para reabrir el modal a demanda — se corre más arriba en
          mobile (media query abajo) para no pisar el CartFab (bottom:24, 62px de
          alto, mismo lado), que solo aparece <900px. El anillo de pulso llama la
          atención hacia la promoción sin ser un badge numérico (no hay un "conteo"
          real que mostrar); el tooltip solo aparece con hover real (desktop). */}
      <div className="welcome-banner-fab-wrap" style={{ position: "fixed", right: 22, bottom: "calc(24px + env(safe-area-inset-bottom))", zIndex: 40, display: "flex", alignItems: "center", gap: 10 }}>
        <span className="welcome-banner-fab-tooltip" aria-hidden="true">
          {t("welcomeBanner.reopen")}
        </span>
        <button
          type="button"
          onClick={reopen}
          aria-label={t("welcomeBanner.reopen")}
          data-testid="welcome-banner-fab"
          className="welcome-banner-fab foc"
          style={{
            position: "relative",
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: 0,
            background: "var(--botanic-deep)",
            cursor: "pointer",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 14px 34px rgba(27,24,21,.35)",
          }}
        >
          <span className="welcome-banner-fab-ping" aria-hidden="true" />
          <Icon name="megaphone" size={20} color="var(--cream)" />
        </button>
      </div>
      <style>{`
        .welcome-banner-fab-ping {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: var(--botanic-deep);
          animation: welcome-banner-fab-ping 2.4s cubic-bezier(0,0,.2,1) infinite;
        }
        @keyframes welcome-banner-fab-ping {
          0% { transform: scale(1); opacity: .55; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        .welcome-banner-fab {
          transition: transform .25s cubic-bezier(.2,.7,.2,1);
        }
        .welcome-banner-fab:hover {
          transform: scale(1.08) rotate(-6deg);
        }
        .welcome-banner-fab-tooltip {
          background: var(--ink);
          color: var(--cream);
          font-size: 12.5px;
          font-weight: 600;
          white-space: nowrap;
          padding: 8px 14px;
          border-radius: 999px;
          box-shadow: 0 8px 20px rgba(27,24,21,.25);
          opacity: 0;
          transform: translateX(8px);
          transition: opacity .2s ease, transform .2s ease;
          pointer-events: none;
        }
        .welcome-banner-fab-wrap:hover .welcome-banner-fab-tooltip {
          opacity: 1;
          transform: translateX(0);
        }
        @media (max-width: 900px){
          .welcome-banner-fab-wrap{ bottom: calc(98px + env(safe-area-inset-bottom)) !important; }
          .welcome-banner-fab-tooltip{ display: none; }
        }
      `}</style>
    </>
  );
};
