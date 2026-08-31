import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@ui/Icon";
import { useAuth } from "@shared/auth/AuthContext";
import {
  listAdminCategories,
  createCategory,
  deleteCategory,
  listAttributes,
  createAttribute,
  deleteAttribute,
} from "@shared/api-client";
import { Pagination } from "../Pagination";

const fieldStyle = { width: "100%", boxSizing: "border-box", padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 10, background: "#fff", fontSize: 13, fontFamily: "var(--sans)" };

const CategoriesSection = () => {
  const { t } = useTranslation("admin");
  const { getAccessToken } = useAuth();
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("loading");
  const [form, setForm] = useState({ name: "", slug: "" });
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const load = () => {
    setStatus("loading");
    listAdminCategories({ page, limit: 20 }, getAccessToken())
      .then((res) => {
        setCategories(res.items);
        setMeta(res.meta);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) return;
    setError(null);
    try {
      await createCategory({ name: form.name.trim(), slug: form.slug.trim() }, getAccessToken());
      setForm({ name: "", slug: "" });
      setPage(1);
      load();
    } catch (err) {
      setError(err?.message || "No se pudo crear la categoría.");
    }
  };

  const remove = async (cat) => {
    setDeleteError(null);
    try {
      await deleteCategory(cat.id, getAccessToken());
      setCategories((cs) => cs.filter((c) => c.id !== cat.id));
    } catch (err) {
      // 409: tiene productos ACTIVE asociados — se muestra el error tal cual, no se
      // adivina una reasignación automática.
      setDeleteError({ id: cat.id, message: err?.status === 409 ? "Esta categoría tiene productos activos — reasígnalos antes de borrarla." : "No se pudo eliminar la categoría." });
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", overflow: "hidden" }}>
      <div style={{ padding: "22px 26px" }}>
        <div className="display" style={{ fontSize: 19 }}>Categorías</div>
      </div>

      <form onSubmit={submit} style={{ display: "flex", gap: 10, padding: "0 26px 20px", flexWrap: "wrap" }}>
        <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nombre" style={{ ...fieldStyle, flex: "1 1 160px" }} />
        <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} placeholder="slug" style={{ ...fieldStyle, flex: "1 1 140px" }} />
        <button type="submit" className="foc" style={{ border: 0, borderRadius: 999, padding: "10px 18px", background: "var(--ink)", color: "var(--cream)", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Agregar</button>
      </form>
      {error && <div style={{ fontSize: 12.5, color: "var(--terracotta-deep)", padding: "0 26px 14px" }}>{error}</div>}

      {status === "loading" && <div style={{ padding: "0 26px 20px", fontSize: 13, color: "var(--ink-soft)" }}>Cargando categorías…</div>}
      {status === "ready" && categories.map((c) => (
        <div key={c.id}>
          <div className="admin-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 26px", borderTop: "1px solid var(--line)" }}>
            <span style={{ fontSize: 13.5, fontWeight: 600 }}>{c.name}</span>
            <span className="mono" style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{c.slug}</span>
            <button onClick={() => remove(c)} className="foc" style={{ background: "none", border: 0, cursor: "pointer" }}>
              <Icon name="trash" size={14} color="var(--terracotta-deep)" />
            </button>
          </div>
          {deleteError?.id === c.id && (
            <div style={{ padding: "8px 26px", fontSize: 12, color: "var(--terracotta-deep)", background: "rgba(193,99,63,.06)" }}>{deleteError.message}</div>
          )}
        </div>
      ))}
      <Pagination meta={meta} page={page} onPageChange={setPage} />
      <style>{`.admin-row:hover{background:#FAF7F0}`}</style>
    </div>
  );
};

const AttributesSection = () => {
  const { getAccessToken } = useAuth();
  const [attributes, setAttributes] = useState([]);
  const [status, setStatus] = useState("loading");
  const [form, setForm] = useState({ key: "", label: "", values: "" });
  const [error, setError] = useState(null);

  const load = () => {
    setStatus("loading");
    listAttributes(getAccessToken())
      .then((res) => {
        setAttributes(res.items);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async (e) => {
    e.preventDefault();
    if (!form.key.trim() || !form.label.trim()) return;
    setError(null);
    try {
      const values = form.values.split(",").map((v) => v.trim()).filter(Boolean).map((v) => ({ value: v, label: v }));
      await createAttribute({ key: form.key.trim(), label: form.label.trim(), values }, getAccessToken());
      setForm({ key: "", label: "", values: "" });
      load();
    } catch (err) {
      setError(err?.message || "No se pudo crear el atributo.");
    }
  };

  const remove = async (attr) => {
    setAttributes((as) => as.filter((a) => a.id !== attr.id));
    try {
      await deleteAttribute(attr.id, getAccessToken());
    } catch {
      load();
    }
  };

  return (
    <div style={{ background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", overflow: "hidden" }}>
      <div style={{ padding: "22px 26px" }}>
        <div className="display" style={{ fontSize: 19 }}>Atributos</div>
      </div>

      <form onSubmit={submit} style={{ display: "flex", gap: 10, padding: "0 26px 20px", flexWrap: "wrap" }}>
        <input value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} placeholder="key (ej. hairType)" style={{ ...fieldStyle, flex: "1 1 140px" }} />
        <input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder="Etiqueta" style={{ ...fieldStyle, flex: "1 1 140px" }} />
        <input value={form.values} onChange={(e) => setForm((f) => ({ ...f, values: e.target.value }))} placeholder="Valores separados por coma" style={{ ...fieldStyle, flex: "1 1 200px" }} />
        <button type="submit" className="foc" style={{ border: 0, borderRadius: 999, padding: "10px 18px", background: "var(--ink)", color: "var(--cream)", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Agregar</button>
      </form>
      {error && <div style={{ fontSize: 12.5, color: "var(--terracotta-deep)", padding: "0 26px 14px" }}>{error}</div>}

      {status === "loading" && <div style={{ padding: "0 26px 20px", fontSize: 13, color: "var(--ink-soft)" }}>Cargando atributos…</div>}
      {status === "ready" && attributes.map((a) => (
        <div key={a.id} className="admin-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 26px", borderTop: "1px solid var(--line)" }}>
          <span style={{ fontSize: 13.5, fontWeight: 600 }}>{a.label} <span className="mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>({a.key})</span></span>
          <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>{a.values?.map((v) => v.label).join(", ")}</span>
          <button onClick={() => remove(a)} className="foc" style={{ background: "none", border: 0, cursor: "pointer" }}>
            <Icon name="trash" size={14} color="var(--terracotta-deep)" />
          </button>
        </div>
      ))}
      <style>{`.admin-row:hover{background:#FAF7F0}`}</style>
    </div>
  );
};

export const AdminCategories = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <CategoriesSection />
    <AttributesSection />
  </div>
);
