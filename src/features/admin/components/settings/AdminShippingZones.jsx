import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@ui/Icon";
import { useAuth } from "@shared/auth/AuthContext";
import { AdminFormSheet } from "../AdminFormSheet";
import {
  listShippingZones,
  createShippingZone,
  updateShippingZone,
  deleteShippingZone,
  setShippingZoneRestrictions,
  listProducts,
} from "@shared/api-client";

const emptyForm = () => ({ id: null, name: "", description: "" });

// Única pestaña del panel admin con CRUD 100% real: las 5 rutas /admin/shipping/
// zones* (ver shared/api-client/admin.js). El nombre exacto de los campos del
// payload (name/description) es la mejor suposición a partir del mockup — a
// confirmar contra el contrato real del backend en la primera prueba end-to-end.
export const AdminShippingZones = () => {
  const { t } = useTranslation("admin");
  const { getAccessToken } = useAuth();
  const [zones, setZones] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [restrictionsZone, setRestrictionsZone] = useState(null);
  const [restrictedIds, setRestrictedIds] = useState(new Set());
  const [savingRestrictions, setSavingRestrictions] = useState(false);
  const [products, setProducts] = useState([]);

  const load = () => {
    setStatus("loading");
    listShippingZones(getAccessToken())
      .then((list) => {
        setZones(Array.isArray(list) ? list : list?.items || []);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  // Catálogo real (antes usaba el arreglo estático PRODUCTS, con ids inventados que
  // no existen en el backend — las restricciones necesitan ids reales de producto).
  useEffect(() => {
    listProducts({ limit: 100 })
      .then((res) => setProducts(res.items))
      .catch(() => setProducts([]));
  }, []);

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const openNew = () => {
    setForm(emptyForm());
    setModalOpen(true);
  };

  const openEdit = (z) => {
    setForm({ id: z.id, name: z.name || "", description: z.description || "" });
    setModalOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) return;
    const payload = { name: form.name.trim(), description: form.description.trim() };
    try {
      if (form.id) {
        const updated = await updateShippingZone(form.id, payload, getAccessToken());
        setZones((zs) => zs.map((z) => (z.id === form.id ? { ...z, ...updated } : z)));
      } else {
        const created = await createShippingZone(payload, getAccessToken());
        setZones((zs) => [...zs, created]);
      }
      setModalOpen(false);
    } catch {
      // Se deja el modal abierto para reintentar; el error puntual del backend
      // (ej. nombre duplicado) todavía no tiene un mensaje de validación definido.
    }
  };

  const remove = async (id) => {
    const prev = zones;
    setZones((zs) => zs.filter((z) => z.id !== id));
    try {
      await deleteShippingZone(id, getAccessToken());
    } catch {
      setZones(prev);
    }
  };

  const openRestrictions = (zone) => {
    setRestrictionsZone(zone);
    setRestrictedIds(new Set(zone.restrictedProductIds || []));
  };

  const toggleRestricted = (productId) => {
    setRestrictedIds((prev) => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  };

  const saveRestrictions = async () => {
    setSavingRestrictions(true);
    try {
      const ids = [...restrictedIds];
      await setShippingZoneRestrictions(restrictionsZone.id, ids, getAccessToken());
      setZones((zs) => zs.map((z) => (z.id === restrictionsZone.id ? { ...z, restrictedProductIds: ids } : z)));
      setRestrictionsZone(null);
    } catch {
      // Igual que save(): se deja el modal abierto para reintentar.
    } finally {
      setSavingRestrictions(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div className="display" style={{ fontSize: 19 }}>{t("shippingZones.title")}</div>
        <button onClick={openNew} className="foc" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--ink)", color: "var(--cream)", border: 0, borderRadius: 999, padding: "12px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Icon name="plus" size={15} color="var(--cream)" />
          {t("shippingZones.newZone")}
        </button>
      </div>

      {status === "error" && (
        <div style={{ padding: "16px 20px", borderRadius: 14, background: "rgba(193,99,63,.08)", border: "1px solid rgba(193,99,63,.3)", color: "#7A3535", fontSize: 13.5, marginBottom: 20 }}>
          {t("shippingZones.loadError")}
        </div>
      )}

      <div style={{ background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", overflow: "hidden" }}>
        <div className="admin-table-head" style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr 140px 90px", padding: "12px 22px", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-soft)", borderBottom: "1px solid var(--line)" }}>
          <span>{t("shippingZones.tableHead.zone")}</span><span>{t("shippingZones.tableHead.description")}</span><span>{t("shippingZones.tableHead.restrictions")}</span><span></span>
        </div>

        {status === "loading" && (
          <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>{t("shippingZones.loading")}</div>
        )}
        {status === "ready" && zones.length === 0 && (
          <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>{t("shippingZones.empty")}</div>
        )}

        {zones.map((z) => (
          <div key={z.id} className="admin-row admin-list-row" style={{ display: "grid", gridTemplateColumns: "1.4fr 1.6fr 140px 90px", padding: "14px 22px", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
            <span style={{ fontWeight: 600, fontSize: 13.5 }}>{z.name}</span>
            <span style={{ fontSize: 13, color: "var(--ink-soft)" }}><span className="cell-label">{t("shippingZones.tableHead.description")}</span>{z.description || t("shippingZones.noDescription")}</span>
            <button onClick={() => openRestrictions(z)} className="foc" style={{ background: "none", border: 0, padding: 0, fontSize: 12.5, color: "var(--botanic-deep)", textDecoration: "underline", cursor: "pointer", justifySelf: "start" }}>
              {t("shippingZones.productsCount", { count: z.restrictedProductIds?.length || 0 })}
            </button>
            <span style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
              <button onClick={() => openEdit(z)} aria-label={t("shippingZones.editAria")} className="foc" style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}>
                <Icon name="pencil" size={14} />
              </button>
              <button onClick={() => remove(z.id)} aria-label={t("shippingZones.deleteAria")} className="foc" style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(193,99,63,.25)", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}>
                <Icon name="trash" size={14} color="var(--terracotta-deep)" />
              </button>
            </span>
          </div>
        ))}
      </div>

      {modalOpen && (
        <AdminFormSheet onClose={() => setModalOpen(false)} eyebrow={t("shippingZones.form.eyebrow")} title={form.id ? t("shippingZones.form.editTitle") : t("shippingZones.form.newTitle")} maxWidth={440}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 700, display: "block", marginBottom: 6 }}>{t("shippingZones.form.nameLabel")}</label>
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="foc" placeholder={t("shippingZones.form.namePlaceholder")} style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 12, background: "#fff", fontSize: 14, fontFamily: "var(--sans)" }} />
            </div>
            <div>
              <label style={{ fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 700, display: "block", marginBottom: 6 }}>{t("shippingZones.form.descriptionLabel")}</label>
              <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="foc" placeholder={t("shippingZones.form.descriptionPlaceholder")} style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 12, background: "#fff", fontSize: 14, fontFamily: "var(--sans)" }} />
            </div>
          </div>
          <div className="admin-sheet-actions" style={{ display: "flex", gap: 10, marginTop: 26 }}>
            <button onClick={save} className="foc" style={{ flex: 1, border: 0, borderRadius: 999, padding: 14, background: "var(--ink)", color: "var(--cream)", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>{t("shippingZones.form.save")}</button>
            <button onClick={() => setModalOpen(false)} className="foc" style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "14px 20px", background: "transparent", color: "var(--ink)", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>{t("shippingZones.form.cancel")}</button>
          </div>
        </AdminFormSheet>
      )}

      {restrictionsZone && (
        <AdminFormSheet onClose={() => setRestrictionsZone(null)} eyebrow={t("shippingZones.form.eyebrow")} title={t("shippingZones.restrictionsForm.title")} maxWidth={460}>
          <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 18 }}>
            {t("shippingZones.restrictionsForm.description", { zone: restrictionsZone.name })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {products.map((p) => (
              <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px", borderRadius: 10, cursor: "pointer", fontSize: 13.5 }}>
                <input type="checkbox" checked={restrictedIds.has(p.id)} onChange={() => toggleRestricted(p.id)} />
                {p.name}
              </label>
            ))}
          </div>
          <div className="admin-sheet-actions" style={{ display: "flex", gap: 10, marginTop: 22 }}>
            <button onClick={saveRestrictions} disabled={savingRestrictions} className="foc" style={{ flex: 1, border: 0, borderRadius: 999, padding: 14, background: "var(--ink)", color: "var(--cream)", fontSize: 13.5, fontWeight: 700, cursor: savingRestrictions ? "wait" : "pointer" }}>
              {savingRestrictions ? t("shippingZones.restrictionsForm.saving") : t("shippingZones.restrictionsForm.save")}
            </button>
            <button onClick={() => setRestrictionsZone(null)} className="foc" style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "14px 20px", background: "transparent", color: "var(--ink)", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>{t("shippingZones.restrictionsForm.cancel")}</button>
          </div>
        </AdminFormSheet>
      )}
      <style>{`
        .admin-row:hover{background:#FAF7F0}
        .cell-label{display:none}
        @media (max-width: 720px){
          .admin-table-head{display:none}
          .admin-list-row{grid-template-columns:1fr !important; gap:6px; align-items:flex-start !important}
          .admin-list-row .cell-label{display:block; font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-soft); margin-bottom:2px}
          .admin-list-row > *{justify-self:start !important}
        }
      `}</style>
    </div>
  );
};
