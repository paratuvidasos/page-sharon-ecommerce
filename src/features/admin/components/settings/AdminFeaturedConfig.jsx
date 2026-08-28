import { useEffect, useState } from "react";
import { useAuth } from "@shared/auth/AuthContext";
import { getFeaturedConfig, setFeaturedConfig, listProducts } from "@shared/api-client";

const RULE_LABEL = { BEST_SELLERS: "Más vendidos", NEWEST: "Más nuevos" };

// Configura qué productos salen en "Destacados" de la home: manual (checklist fijo)
// o automático (una regla que el backend recalcula solo).
export const AdminFeaturedConfig = () => {
  const { getAccessToken } = useAuth();
  const [status, setStatus] = useState("loading");
  const [mode, setMode] = useState("MANUAL");
  const [manualIds, setManualIds] = useState(new Set());
  const [automaticRule, setAutomaticRule] = useState("BEST_SELLERS");
  const [products, setProducts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([
      getFeaturedConfig(getAccessToken()),
      listProducts({ limit: 100 }),
    ])
      .then(([config, res]) => {
        setMode(config.mode);
        setManualIds(new Set(config.manualProductIds || []));
        setAutomaticRule(config.automaticRule || "BEST_SELLERS");
        setProducts(res.items);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleProduct = (id) => {
    setManualIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const payload = mode === "MANUAL"
        ? { mode, manualProductIds: [...manualIds] }
        : { mode, automaticRule };
      await setFeaturedConfig(payload, getAccessToken());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err?.message || "No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading") return <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>Cargando configuración de destacados…</div>;
  if (status === "error") return <div style={{ fontSize: 13, color: "var(--terracotta-deep)" }}>No se pudo cargar la configuración de destacados.</div>;

  return (
    <div style={{ background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", padding: 24 }}>
      <div className="display" style={{ fontSize: 19, marginBottom: 18 }}>Destacados de la home</div>

      <div style={{ display: "flex", gap: 20, marginBottom: 18 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer" }}>
          <input type="radio" checked={mode === "MANUAL"} onChange={() => setMode("MANUAL")} /> Manual
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13.5, cursor: "pointer" }}>
          <input type="radio" checked={mode === "AUTOMATIC"} onChange={() => setMode("AUTOMATIC")} /> Automático
        </label>
      </div>

      {mode === "MANUAL" ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 260, overflowY: "auto", marginBottom: 18 }}>
          {products.map((p) => (
            <label key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 6px", borderRadius: 10, cursor: "pointer", fontSize: 13.5 }}>
              <input type="checkbox" checked={manualIds.has(p.id)} onChange={() => toggleProduct(p.id)} />
              {p.name}
            </label>
          ))}
        </div>
      ) : (
        <div style={{ marginBottom: 18 }}>
          <select value={automaticRule} onChange={(e) => setAutomaticRule(e.target.value)} style={{ padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 10, background: "#fff", fontSize: 13.5 }}>
            {Object.entries(RULE_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
      )}

      {error && <div style={{ fontSize: 12.5, color: "var(--terracotta-deep)", marginBottom: 12 }}>{error}</div>}
      <button onClick={save} disabled={saving} className="foc" style={{ border: 0, borderRadius: 999, padding: "12px 22px", background: "var(--ink)", color: "var(--cream)", fontSize: 13, fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>
        {saving ? "Guardando…" : saved ? "¡Guardado! ✦" : "Guardar configuración"}
      </button>
    </div>
  );
};
