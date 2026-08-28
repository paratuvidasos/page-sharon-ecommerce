import { useEffect, useRef, useState } from "react";
import { Icon } from "@ui/Icon";
import { useAuth } from "@shared/auth/AuthContext";
import {
  listBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
  uploadBannerImage,
} from "@shared/api-client";

const emptyForm = () => ({ id: null, imageUrl: "", linkUrl: "", title: "", startsAt: "", endsAt: "", isActive: true });
const fieldStyle = { width: "100%", boxSizing: "border-box", padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 12, background: "#fff", fontSize: 14, fontFamily: "var(--sans)" };
const labelStyle = { fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 700, display: "block", marginBottom: 6 };

// Sin paginar (incluye inactivos/programados). El reordenamiento usa botones subir/
// bajar en vez de drag-and-drop, para no sumar una dependencia nueva solo por esto —
// cada movimiento manda el arreglo COMPLETO reordenado a PUT /admin/banners/order.
export const AdminBanners = () => {
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
    setForm({ id: b.id, imageUrl: b.imageUrl, linkUrl: b.linkUrl || "", title: b.title, startsAt: b.startsAt?.slice(0, 10) || "", endsAt: b.endsAt?.slice(0, 10) || "", isActive: b.isActive });
    setError(null);
    setModalOpen(true);
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
      setError(err?.message || "No se pudo subir la imagen.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.imageUrl || !form.title.trim()) {
      setError("La imagen y el título son obligatorios.");
      return;
    }
    const payload = {
      imageUrl: form.imageUrl,
      linkUrl: form.linkUrl.trim() || undefined,
      title: form.title.trim(),
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
      setError(err?.message || "No se pudo guardar el banner.");
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
          Nuevo banner
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", overflow: "hidden" }}>
        {status === "loading" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>Cargando banners…</div>}
        {status === "error" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--terracotta-deep)" }}>No se pudieron cargar los banners.</div>}
        {status === "ready" && banners.length === 0 && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>Todavía no hay banners creados.</div>}

        {banners.map((b, i) => (
          <div key={b.id}>
            <div className="admin-row" style={{ display: "grid", gridTemplateColumns: "60px 80px 1fr 90px 160px", padding: "12px 22px", alignItems: "center", borderBottom: "1px solid var(--line)", gap: 12 }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <button onClick={() => move(i, -1)} disabled={i === 0} className="foc" style={{ border: 0, background: "none", cursor: i === 0 ? "not-allowed" : "pointer", opacity: i === 0 ? 0.3 : 1 }}>▲</button>
                <button onClick={() => move(i, 1)} disabled={i === banners.length - 1} className="foc" style={{ border: 0, background: "none", cursor: i === banners.length - 1 ? "not-allowed" : "pointer", opacity: i === banners.length - 1 ? 0.3 : 1 }}>▼</button>
              </div>
              <div style={{ width: 60, height: 40, borderRadius: 8, overflow: "hidden", background: "var(--cream-2)" }}>
                <img src={b.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <span style={{ fontWeight: 600, fontSize: 13.5 }}>{b.title}</span>
              <button
                onClick={() => toggleActive(b)}
                disabled={togglingId === b.id}
                title="Activar/desactivar banner"
                className="foc"
                style={{ border: 0, cursor: togglingId === b.id ? "wait" : "pointer", padding: "5px 11px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, background: b.isActive ? "var(--botanic-muted)" : "var(--cream-2)", color: b.isActive ? "#3A4A34" : "var(--ink-soft)", justifySelf: "start" }}
              >
                {b.isActive ? "Activo" : "Inactivo"}
              </button>
              <span style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button onClick={() => openEdit(b)} aria-label="Editar banner" title="Editar banner" className="foc" style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}>
                  <Icon name="pencil" size={14} />
                </button>
                <button onClick={() => setConfirmingDeleteId(b.id)} aria-label="Eliminar banner" title="Eliminar banner" className="foc" style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(193,99,63,.25)", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}>
                  <Icon name="trash" size={14} color="var(--terracotta-deep)" />
                </button>
              </span>
            </div>
            {confirmingDeleteId === b.id && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 22px", background: "rgba(193,99,63,.06)", borderBottom: "1px solid var(--line)" }}>
                <span style={{ fontSize: 12.5, color: "#7A3535", flex: 1 }}>¿Eliminar el banner "{b.title}"? No se puede deshacer.</span>
                <button onClick={() => remove(b.id)} className="foc" style={{ border: 0, borderRadius: 999, padding: "8px 16px", background: "var(--terracotta-deep)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Eliminar</button>
                <button onClick={() => setConfirmingDeleteId(null)} className="foc" style={{ border: 0, borderRadius: 999, padding: "8px 16px", background: "transparent", color: "var(--ink)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(27,24,21,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
          <form onSubmit={save} style={{ width: "100%", maxWidth: 460, background: "var(--cream)", borderRadius: 24, padding: 32, boxShadow: "var(--shadow-lg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <div className="display" style={{ fontSize: 24 }}>{form.id ? "Editar banner" : "Nuevo banner"}</div>
              <button type="button" onClick={() => setModalOpen(false)} className="foc" style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--cream-2)", border: 0, cursor: "pointer", display: "grid", placeItems: "center" }}>
                <Icon name="close" size={13} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={labelStyle}>Imagen</label>
                {form.imageUrl && (
                  <div style={{ width: "100%", height: 100, borderRadius: 12, overflow: "hidden", marginBottom: 8, background: "var(--cream-2)" }}>
                    <img src={form.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                )}
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="foc" style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid var(--line)", borderRadius: 999, padding: "10px 16px", background: "#fff", fontSize: 12.5, fontWeight: 600, cursor: uploading ? "wait" : "pointer" }}>
                  <Icon name="image" size={14} />
                  {uploading ? "Subiendo…" : "Subir imagen"}
                </button>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleUpload} style={{ display: "none" }} />
              </div>
              <div>
                <label style={labelStyle}>Título</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} style={fieldStyle} />
              </div>
              <div>
                <label style={labelStyle}>Link (opcional)</label>
                <input value={form.linkUrl} onChange={(e) => setForm((f) => ({ ...f, linkUrl: e.target.value }))} style={fieldStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Desde</label>
                  <input value={form.startsAt} onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))} type="date" style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Hasta</label>
                  <input value={form.endsAt} onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))} type="date" style={fieldStyle} />
                </div>
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
                Activo
              </label>
            </div>

            {error && <div style={{ fontSize: 12.5, color: "var(--terracotta-deep)", marginTop: 14 }}>{error}</div>}

            <div style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button type="submit" className="foc" style={{ flex: 1, border: 0, borderRadius: 999, padding: 14, background: "var(--ink)", color: "var(--cream)", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>Guardar banner</button>
              <button type="button" onClick={() => setModalOpen(false)} className="foc" style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "14px 20px", background: "transparent", color: "var(--ink)", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      <style>{`.admin-row:hover{background:#FAF7F0}`}</style>
    </div>
  );
};
