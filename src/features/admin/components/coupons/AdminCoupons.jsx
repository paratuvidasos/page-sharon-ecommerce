import { useEffect, useState } from "react";
import { Icon } from "@ui/Icon";
import { useAuth } from "@shared/auth/AuthContext";
import { listCoupons, createCoupon, updateCoupon } from "@shared/api-client";
import { formatCurrency } from "@shared/i18n/currency";
import { Pagination } from "../Pagination";

const emptyForm = () => ({ code: "", discountType: "PERCENTAGE", discountValue: "", minPurchaseAmount: "", startsAt: "", endsAt: "", maxRedemptions: "" });

const fieldStyle = { width: "100%", boxSizing: "border-box", padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 12, background: "#fff", fontSize: 14, fontFamily: "var(--sans)" };
const labelStyle = { fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 700, display: "block", marginBottom: 6 };

const discountLabel = (c) => (c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : formatCurrency(c.discountValue));

// El payload de creación es {code, discountType, discountValue, minPurchaseAmount?,
// startsAt?, endsAt?, maxRedemptions?, applicableProductIds?} — el que se había
// adivinado ({code, percentOff}) no correspondía al contrato real del backend.
export const AdminCoupons = () => {
  const { getAccessToken } = useAuth();
  const [coupons, setCoupons] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("loading");
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [togglingCode, setTogglingCode] = useState(null);

  const load = () => {
    setStatus("loading");
    listCoupons({ page, limit: 20 }, getAccessToken())
      .then((res) => {
        setCoupons(res.items);
        setMeta(res.meta);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discountValue) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
      };
      if (form.minPurchaseAmount) payload.minPurchaseAmount = Number(form.minPurchaseAmount);
      if (form.startsAt) payload.startsAt = form.startsAt;
      if (form.endsAt) payload.endsAt = form.endsAt;
      if (form.maxRedemptions) payload.maxRedemptions = Number(form.maxRedemptions);
      await createCoupon(payload, getAccessToken());
      setForm(emptyForm());
      setPage(1);
      load();
    } catch (err) {
      setError(err?.message || "No se pudo crear el cupón. Intenta de nuevo.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon) => {
    setTogglingCode(coupon.code);
    const next = !coupon.isActive;
    setCoupons((cs) => cs.map((c) => (c.code === coupon.code ? { ...c, isActive: next } : c)));
    try {
      await updateCoupon(coupon.code, { isActive: next }, getAccessToken());
    } catch {
      setCoupons((cs) => cs.map((c) => (c.code === coupon.code ? { ...c, isActive: !next } : c)));
    } finally {
      setTogglingCode(null);
    }
  };

  return (
    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
      <div style={{ flex: "1 1 460px", minWidth: 320, background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr 90px 90px", padding: "12px 22px", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-soft)", borderBottom: "1px solid var(--line)" }}>
          <span>Código</span><span>Descuento</span><span>Usos</span><span>Estado</span><span></span>
        </div>

        {status === "loading" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>Cargando cupones…</div>}
        {status === "error" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--terracotta-deep)" }}>No se pudieron cargar los cupones.</div>}
        {status === "ready" && coupons.length === 0 && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>Todavía no hay cupones creados.</div>}

        {coupons.map((c) => (
          <div key={c.code} className="admin-row" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr 90px 90px", padding: "14px 22px", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
            <span className="mono" style={{ fontWeight: 700, fontSize: 13 }}>{c.code}</span>
            <span className="display" style={{ fontSize: 15 }}>{discountLabel(c)}</span>
            <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{c.redemptionsCount}{c.maxRedemptions ? ` / ${c.maxRedemptions}` : ""}</span>
            <span style={{ padding: "5px 11px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, background: c.isActive ? "var(--botanic-muted)" : "var(--cream-2)", color: c.isActive ? "#3A4A34" : "var(--ink-soft)", justifySelf: "start" }}>
              {c.isActive ? "Activo" : "Inactivo"}
            </span>
            <button onClick={() => toggleActive(c)} disabled={togglingCode === c.code} className="foc" style={{ background: "none", border: "1px solid var(--line)", borderRadius: 999, padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", justifySelf: "end" }}>
              {c.isActive ? "Desactivar" : "Activar"}
            </button>
          </div>
        ))}
        <Pagination meta={meta} page={page} onPageChange={setPage} />
      </div>

      <form onSubmit={submit} style={{ flex: "0 1 340px", minWidth: 300, background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", padding: 24 }}>
        <div className="display" style={{ fontSize: 19, marginBottom: 18 }}>Nuevo cupón</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Código</label>
            <input value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} placeholder="OTONO15" style={fieldStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Tipo</label>
              <select value={form.discountType} onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value }))} style={fieldStyle}>
                <option value="PERCENTAGE">% Porcentaje</option>
                <option value="FIXED_AMOUNT">Monto fijo</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Valor</label>
              <input value={form.discountValue} onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))} type="number" min="1" style={fieldStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Compra mínima (opcional)</label>
            <input value={form.minPurchaseAmount} onChange={(e) => setForm((f) => ({ ...f, minPurchaseAmount: e.target.value }))} type="number" min="0" style={fieldStyle} />
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
          <div>
            <label style={labelStyle}>Máx. de usos (opcional)</label>
            <input value={form.maxRedemptions} onChange={(e) => setForm((f) => ({ ...f, maxRedemptions: e.target.value }))} type="number" min="1" style={fieldStyle} />
          </div>
        </div>
        {error && <div style={{ fontSize: 12.5, color: "var(--terracotta-deep)", marginTop: 12 }}>{error}</div>}
        <button type="submit" disabled={saving} className="foc" style={{ width: "100%", marginTop: 18, border: 0, borderRadius: 999, padding: 14, background: "var(--ink)", color: "var(--cream)", fontSize: 13.5, fontWeight: 700, cursor: saving ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="plus" size={15} color="var(--cream)" />
          {saving ? "Creando…" : "Crear cupón"}
        </button>
      </form>

      <style>{`.admin-row:hover{background:#FAF7F0}`}</style>
    </div>
  );
};
