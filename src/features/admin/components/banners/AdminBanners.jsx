import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@ui/Icon";
import { useAuth } from "@shared/auth/AuthContext";
import { AdminFormSheet } from "../AdminFormSheet";
import {
  listBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
  uploadBannerImage,
} from "@shared/api-client";

const CATEGORIES = ["EVENTO", "KIT", "PROMOCION", "LANZAMIENTO", "COLECCION", "GENERAL"];
const ACTION_TYPES = ["COMPRAR", "INSCRIPCION", "MAS_INFORMACION"];
const PLACEMENTS = ["WELCOME_MODAL", "HOME_SECTION"];

const emptyForm = () => ({
  id: null,
  imageUrl: "",
  linkUrl: "",
  title: "",
  category: "GENERAL",
  actionType: "MAS_INFORMACION",
  placements: [],
  startsAt: "",
  endsAt: "",
  isActive: true,
});
const fieldStyle = { width: "100%", boxSizing: "border-box", padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 12, background: "#fff", fontSize: 14, fontFamily: "var(--sans)" };
const labelStyle = { fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 700, display: "block", marginBottom: 6 };

// Sin paginar (incluye inactivos/programados). El reordenamiento usa botones subir/
// bajar en vez de drag-and-drop, para no sumar una dependencia nueva solo por esto —
// cada movimiento manda el arreglo COMPLETO reordenado a PUT /admin/banners/order.
export const AdminBanners = () => {
  const { t } = useTranslation("admin");
  const { getAccessToken } = useAuth();
  const [banners, setBanners] = useState([]);
  const [status, setStatus] = useState("loading");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const fileInputRef = useRef(null);

  const load = () => {
    setStatus("loading");
    listBanners(getAccessToken())
      .then((res) => {
        setBanners(res.items);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openNew = () => { setForm(emptyForm()); setError(null); setModalOpen(true); };
  const openEdit = (b) => {
    setForm({
      id: b.id,
      imageUrl: b.imageUrl,
      linkUrl: b.linkUrl || "",
      title: b.title,
      category: b.category || "GENERAL",
      actionType: b.actionType || "MAS_INFORMACION",
      placements: b.placements || [],
      startsAt: b.startsAt?.slice(0, 10) || "",
      endsAt: b.endsAt?.slice(0, 10) || "",
      isActive: b.isActive,
    });
    setError(null);
    setModalOpen(true);
  };

  const togglePlacement = (placement) => {
    setForm((f) => ({
      ...f,
      placements: f.placements.includes(placement)
        ? f.placements.filter((p) => p !== placement)
        : [...f.placements, placement],
    }));
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await uploadBannerImage(file, getAccessToken());
      setForm((f) => ({ ...f, imageUrl: res.url }));
    } catch (err) {
      setError(err?.message || t("banners.uploadErrorGeneric"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.imageUrl || !form.title.trim()) {
      setError(t("banners.requiredFieldsError"));
      return;
    }
    if (form.placements.length === 0) {
      setError(t("banners.requiredPlacementError"));
      return;
    }
    const payload = {
      imageUrl: form.imageUrl,
      linkUrl: form.linkUrl.trim() || undefined,
      title: form.title.trim(),
      category: form.category,
      actionType: form.actionType,
      placements: form.placements,
      startsAt: form.startsAt || undefined,
      endsAt: form.endsAt || undefined,
      isActive: form.isActive,
    };
    try {
      if (form.id) await updateBanner(form.id, payload, getAccessToken());
      else await createBanner(payload, getAccessToken());
      setModalOpen(false);
      load();
    } catch (err) {
      setError(err?.message || t("banners.saveErrorGeneric"));
    }
  };

  const remove = async (id) => {
    const prev = banners;
    setBanners((bs) => bs.filter((b) => b.id !== id));
    setConfirmingDeleteId(null);
    try {
      await deleteBanner(id, getAccessToken());
      load();
    } catch {
      setBanners(prev);
    }
  };

  const toggleActive = async (banner) => {
    setTogglingId(banner.id);
    const next = !banner.isActive;
    setBanners((bs) => bs.map((b) => (b.id === banner.id ? { ...b, isActive: next } : b)));
    try {
      await updateBanner(banner.id, { isActive: next }, getAccessToken());
    } catch {
      setBanners((bs) => bs.map((b) => (b.id === banner.id ? { ...b, isActive: !next } : b)));
    } finally {
      setTogglingId(null);
    }
  };

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= banners.length) return;
    const next = [...banners];
    [next[index], next[target]] = [next[target], next[index]];
    setBanners(next);
    try {
      await reorderBanners(next.map((b) => b.id), getAccessToken());
    } catch {
      setBanners(banners);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button onClick={openNew} className="foc" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--ink)", color: "var(--cream)", border: 0, borderRadius: 999, padding: "12px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Icon name="plus" size={15} color="var(--cream)" />
          {t("banners.newBanner")}
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", overflow: "hidden" }}>
        {status === "loading" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>{t("banners.loading")}</div>}
        {status === "error" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--terracotta-deep)" }}>{t("banners.error")}</div>}
        {status === "ready" && banners.length === 0 && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>{t("banners.empty")}</div>}

        {banners.map((b, i) => (
          <div key={b.id}>
            <div className="admin-row admin-banner-row" style={{ display: "grid", gridTemplateColumns: "60px 80px 1fr 90px 160px", padding: "12px 22px", alignItems: "center", borderBottom: "1px solid var(--line)", gap: 12 }}>
              <div className="cell-arrows" style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button onClick={() => move(i, -1)} disabled={i === 0} className="foc" style={{ border: 0, background: "none", cursor: i === 0 ? "not-allowed" : "pointer", opacity: i === 0 ? 0.3 : 1 }}>▲</button>
                <button onClick={() => move(i, 1)} disabled={i === banners.length - 1} className="foc" style={{ border: 0, background: "none", cursor: i === banners.length - 1 ? "not-allowed" : "pointer", opacity: i === banners.length - 1 ? 0.3 : 1 }}>▼</button>
              </div>
              <div className="cell-thumb" style={{ width: 60, height: 40, borderRadius: 8, overflow: "hidden", background: "var(--cream-2)" }}>
                <img src={b.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div className="cell-title" style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
                <span style={{ fontWeight: 600, fontSize: 13.5 }}>{b.title}</span>
                <span style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {b.category && (
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".04em", padding: "3px 9px", borderRadius: 999, background: "var(--cream-2)", color: "var(--ink-soft)" }}>
                      {t(`banners.category.${b.category}`)}
                    </span>
                  )}
                  {(b.placements || []).map((p) => (
                    <span key={p} style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".04em", padding: "3px 9px", borderRadius: 999, background: "var(--botanic-muted)", color: "#3A4A34" }}>
                      {t(`banners.placement.${p}`)}
                    </span>
                  ))}
                </span>
              </div>
              <button
                onClick={() => toggleActive(b)}
                disabled={togglingId === b.id}
                title={t("banners.toggleAria")}
                className="foc cell-toggle"
                style={{ border: 0, cursor: togglingId === b.id ? "wait" : "pointer", padding: "5px 11px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, background: b.isActive ? "var(--botanic-muted)" : "var(--cream-2)", color: b.isActive ? "#3A4A34" : "var(--ink-soft)", justifySelf: "start" }}
              >
                {b.isActive ? t("banners.statusActive") : t("banners.statusInactive")}
              </button>
              <span className="cell-actions" style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button onClick={() => openEdit(b)} aria-label={t("banners.editAria")} title={t("banners.editAria")} className="foc" style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}>
                  <Icon name="pencil" size={14} />
                </button>
                <button onClick={() => setConfirmingDeleteId(b.id)} aria-label={t("banners.deleteAria")} title={t("banners.deleteAria")} className="foc" style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(193,99,63,.25)", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}>
                  <Icon name="trash" size={14} color="var(--terracotta-deep)" />
                </button>
              </span>
            </div>
            {confirmingDeleteId === b.id && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 22px", background: "rgba(193,99,63,.06)", borderBottom: "1px solid var(--line)" }}>
                <span style={{ fontSize: 12.5, color: "#7A3535", flex: 1 }}>{t("banners.confirmDelete", { title: b.title })}</span>
                <button onClick={() => remove(b.id)} className="foc" style={{ border: 0, borderRadius: 999, padding: "8px 16px", background: "var(--terracotta-deep)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{t("banners.delete")}</button>
                <button onClick={() => setConfirmingDeleteId(null)} className="foc" style={{ border: 0, borderRadius: 999, padding: "8px 16px", background: "transparent", color: "var(--ink)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t("banners.cancel")}</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {modalOpen && (
        <AdminFormSheet onClose={() => setModalOpen(false)} eyebrow={t("banners.form.eyebrow")} title={form.id ? t("banners.form.editTitle") : t("banners.form.newTitle")} maxWidth={460}>
          <form onSubmit={save}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>{t("banners.form.imageLabel")}</label>
                {form.imageUrl && (
                  <div style={{ width: "100%", height: 100, borderRadius: 12, overflow: "hidden", marginBottom: 8, background: "var(--cream-2)" }}>
                    <img src={form.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="foc" style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid var(--line)", borderRadius: 999, padding: "10px 16px", background: "#fff", fontSize: 12.5, fontWeight: 600, cursor: uploading ? "wait" : "pointer" }}>
                  <Icon name="image" size={14} />
                  {uploading ? t("banners.form.uploading") : t("banners.form.uploadButton")}
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} style={{ display: "none" }} />
              </div>
              <div>
                <label style={labelStyle} htmlFor="banner-title">{t("banners.form.titleLabel")}</label>
                <input id="banner-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>{t("banners.form.linkLabel")}</label>
                <input value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} style={fieldStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle} htmlFor="banner-category">{t("banners.form.categoryLabel")}</label>
                  <select id="banner-category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} style={fieldStyle}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{t(`banners.category.${c}`)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle} htmlFor="banner-action-type">{t("banners.form.actionTypeLabel")}</label>
                  <select id="banner-action-type" value={form.actionType} onChange={(e) => setForm((f) => ({ ...f, actionType: e.target.value }))} style={fieldStyle}>
                    {ACTION_TYPES.map((a) => (
                      <option key={a} value={a}>{t(`banners.actionType.${a}`)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>{t("banners.form.startsAt")}</label>
                  <input value={form.startsAt} onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))} type="date" style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t("banners.form.endsAt")}</label>
                  <input value={form.endsAt} onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))} type="date" style={fieldStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>{t("banners.form.placementsLabel")}</label>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {PLACEMENTS.map((p) => (
                    <label key={p} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={form.placements.includes(p)}
                        onChange={() => togglePlacement(p)}
                      />
                      {t(p === "WELCOME_MODAL" ? "banners.form.placementWelcomeModal" : "banners.form.placementHomeSection")}
                    </label>
                  ))}
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                {t("banners.form.activeLabel")}
              </label>
            </div>

            {error && <div style={{ fontSize: 12.5, color: "var(--terracotta-deep)", marginTop: 14 }}>{error}</div>}

            <div className="admin-sheet-actions" style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button type="submit" className="foc" style={{ flex: 1, border: 0, borderRadius: 999, padding: 14, background: "var(--ink)", color: "var(--cream)", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>{t("banners.form.save")}</button>
              <button type="button" onClick={() => setModalOpen(false)} className="foc" style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "14px 20px", background: "transparent", color: "var(--ink)", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>{t("banners.form.cancel")}</button>
            </div>
          </form>
        </AdminFormSheet>
      )}
      <style>{`
        .admin-row:hover{background:#FAF7F0}
        @media (max-width: 720px){
          .admin-banner-row{
            grid-template-columns: 34px 60px 1fr !important;
            grid-template-areas: "arrows thumb title" "arrows toggle actions";
            row-gap: 8px !important;
          }
          .cell-arrows{grid-area: arrows}
          .cell-thumb{grid-area: thumb}
          .cell-title{grid-area: title}
          .cell-toggle{grid-area: toggle}
          .cell-actions{grid-area: actions; justify-self: end}
        }
      `}</style>
    </div>
  );
};
