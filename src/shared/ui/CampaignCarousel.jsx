import { useEffect, useState } from "react";
import { Reveal } from "./Reveal";
import { listPublicBanners } from "@shared/api-client";

const AUTOPLAY_MS = 6000;

function formatEndDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" }).replace(".", "");
}

// Diseño 2a (ver "Sharon Mejoras"): carrusel a sangre bajo el hero para los
// banners que ya administra el CRM (GET /banners, activos y dentro de su rango
// de fechas — el backend decide eso, este componente solo pinta lo que recibe,
// ver CLAUDE.md regla de no duplicar lógica de negocio). Sin banners, la sección
// no se monta.
export const CampaignCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    listPublicBanners()
      .then((data) => {
        if (!cancelled) setBanners(Array.isArray(data?.items) ? data.items : []);
      })
      .catch(() => {
        if (!cancelled) setBanners([]);
      })
      .finally(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [banners.length]);

  if (!loaded || banners.length === 0) return null;

  const banner = banners[Math.min(index, banners.length - 1)];
  const endLabel = formatEndDate(banner.endsAt);
  const goPrev = () => setIndex((i) => (i - 1 + banners.length) % banners.length);
  const goNext = () => setIndex((i) => (i + 1) % banners.length);

  const content = (
    <div style={{ position: "relative", height: 440, background: "var(--botanic-muted)", overflow: "hidden" }}>
      <img
        src={banner.imageUrl}
        alt={banner.title || ""}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
      <div aria-hidden="true" style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(90deg, rgba(27,24,21,.86) 0%, rgba(27,24,21,.7) 38%, rgba(27,24,21,.2) 68%, rgba(27,24,21,0) 88%)",
      }} />

      <div style={{
        position: "absolute", left: 60, top: "50%", transform: "translateY(-50%)",
        maxWidth: 520, display: "flex", flexDirection: "column", gap: 16, color: "var(--cream)",
      }} className="campaign-copy">
        {endLabel && (
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }} className="mono" >
            <span style={{ width: 6, height: 6, borderRadius: 999, background: "var(--botanic)" }} />
            <span style={{ fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" }}>Activo hasta el {endLabel}</span>
          </div>
        )}
        <div className="display" style={{ fontSize: "clamp(32px, 4.5vw, 52px)", lineHeight: 1.02 }}>
          {banner.title}
        </div>
        {banner.linkUrl && (
          <div>
            <a
              href={banner.linkUrl}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                border: "1px solid rgba(251,247,242,.5)", borderRadius: 999,
                padding: "14px 24px", fontSize: 13.5, fontWeight: 600, color: "var(--cream)",
              }}
            >
              Ver la campaña →
            </a>
          </div>
        )}
      </div>

      {banners.length > 1 && (
        <>
          <div style={{
            position: "absolute", right: 28, top: 26,
            fontFamily: "var(--mono)", fontSize: 11, letterSpacing: ".12em", color: "var(--cream)",
            background: "rgba(27,24,21,.35)", backdropFilter: "blur(8px)", padding: "7px 12px", borderRadius: 999,
          }}>
            {String(index + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
          </div>

          <div style={{ position: "absolute", left: 60, bottom: 30, display: "flex", gap: 8, alignItems: "center" }}>
            {banners.map((b, i) => (
              <button
                key={b.id ?? i}
                type="button"
                aria-label={`Ir a la campaña ${i + 1}`}
                onClick={() => setIndex(i)}
                style={{
                  width: i === index ? 34 : 10, height: 4, borderRadius: 999, border: 0, padding: 0, cursor: "pointer",
                  background: i === index ? "var(--cream)" : "rgba(251,247,242,.45)",
                  transition: "width .25s ease",
                }}
              />
            ))}
          </div>

          <div style={{ position: "absolute", right: 28, bottom: 26, display: "flex", gap: 10 }}>
            <button
              type="button"
              aria-label="Campaña anterior"
              onClick={goPrev}
              style={{
                width: 46, height: 46, borderRadius: "50%", cursor: "pointer",
                border: "1px solid rgba(251,247,242,.4)", background: "rgba(27,24,21,.3)",
                backdropFilter: "blur(8px)", color: "var(--cream)", fontSize: 15,
              }}
            >
              ←
            </button>
            <button
              type="button"
              aria-label="Siguiente campaña"
              onClick={goNext}
              style={{
                width: 46, height: 46, borderRadius: "50%", cursor: "pointer",
                border: "1px solid rgba(251,247,242,.4)", background: "rgba(27,24,21,.3)",
                backdropFilter: "blur(8px)", color: "var(--cream)", fontSize: 15,
              }}
            >
              →
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <section style={{ padding: "0 0 100px" }}>
      <div className="wrap">
        <Reveal>
          <div style={{ borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 64px rgba(27,24,21,.12)" }}>
            {content}
          </div>
        </Reveal>
      </div>

      <style>{`
        @media (max-width: 720px){
          .campaign-copy{ left: 28px !important; right: 28px !important; max-width: none !important; }
        }
      `}</style>
    </section>
  );
};
