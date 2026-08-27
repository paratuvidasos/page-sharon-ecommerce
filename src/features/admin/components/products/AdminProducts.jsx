import { useEffect, useState } from "react";
import { Icon } from "@ui/Icon";
import { formatCurrency } from "@shared/i18n/currency";
import { useAuth } from "@shared/auth/AuthContext";
import { listProducts, setProductFeatured, deleteProduct } from "@shared/api-client";
import { Pagination } from "../Pagination";
import { AdminProductForm } from "./AdminProductForm";

// No hay un GET /admin/products dedicado en la especificación — se reusa el listado
// público GET /products (mismo que ve la tienda) ya expuesto por catalog.js, con
// paginación real. Crear/editar/borrar y las imágenes sí son endpoints admin reales.
export const AdminProducts = () => {
  const { getAccessToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("loading");
  const [formTarget, setFormTarget] = useState(null); // null=cerrado, {}=nuevo, product=editar
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [archivedNotice, setArchivedNotice] = useState(null);
  const [savingFeaturedId, setSavingFeaturedId] = useState(null);

  const load = () => {
    setStatus("loading");
    listProducts({ page, limit: 20 })
      .then((res) => {
        setProducts(res.items);
        setMeta(res.meta);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFeatured = async (p) => {
    const next = !p.isFeatured;
    setSavingFeaturedId(p.id);
    setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, isFeatured: next } : x)));
    try {
      await setProductFeatured(p.id, next, getAccessToken());
    } catch {
      setProducts((ps) => ps.map((x) => (x.id === p.id ? { ...x, isFeatured: !next } : x)));
    } finally {
      setSavingFeaturedId(null);
    }
  };

  const confirmDelete = async (id) => {
    try {
      const res = await deleteProduct(id, getAccessToken());
      if (res?.archived) {
        setArchivedNotice(id);
        setConfirmingDeleteId(null);
      } else {
        setProducts((ps) => ps.filter((p) => p.id !== id));
      }
    } catch {
      setConfirmingDeleteId(null);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <button onClick={() => setFormTarget({})} className="foc" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--ink)", color: "var(--cream)", border: 0, borderRadius: 999, padding: "12px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Icon name="plus" size={15} color="var(--cream)" />
          Nuevo producto
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "64px 1.6fr 100px 90px 90px", padding: "12px 22px", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-soft)", borderBottom: "1px solid var(--line)", alignItems: "center" }}>
          <span></span><span>Producto</span><span>Precio</span><span>Destacado</span><span></span>
        </div>

        {status === "loading" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>Cargando productos…</div>}
        {status === "error" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--terracotta-deep)" }}>No se pudieron cargar los productos.</div>}

        {products.map((p) => (
          <div key={p.id}>
            <div className="admin-row" style={{ display: "grid", gridTemplateColumns: "64px 1.6fr 100px 90px 90px", padding: "14px 22px", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden", background: "var(--botanic-muted)" }}>
                {p.thumbnailUrl && <img src={p.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
              </div>
              <span style={{ fontWeight: 600, fontSize: 13.5 }}>{p.name}</span>
              <span className="display" style={{ fontSize: 15 }}>{formatCurrency(p.basePrice)}</span>
              <button
                onClick={() => toggleFeatured(p)}
                disabled={savingFeaturedId === p.id}
                aria-label="Alternar destacado"
                className="foc"
                style={{ background: "transparent", border: 0, cursor: "pointer" }}
              >
                <Icon name="star" size={20} color={p.isFeatured ? "var(--gold)" : "var(--line)"} />
              </button>
              <span style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button onClick={() => setFormTarget(p)} aria-label="Editar" className="foc" style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}>
                  <Icon name="pencil" size={14} />
                </button>
                <button onClick={() => setConfirmingDeleteId(p.id)} aria-label="Eliminar" className="foc" style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(193,99,63,.25)", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}>
                  <Icon name="trash" size={14} color="var(--terracotta-deep)" />
                </button>
              </span>
            </div>
            {confirmingDeleteId === p.id && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 22px", background: "rgba(193,99,63,.06)", borderBottom: "1px solid var(--line)" }}>
                <span style={{ fontSize: 12.5, color: "#7A3535", flex: 1 }}>¿Eliminar "{p.name}"? Si tiene pedidos históricos se archivará en vez de borrarse.</span>
                <button onClick={() => confirmDelete(p.id)} className="foc" style={{ border: 0, borderRadius: 999, padding: "8px 16px", background: "var(--terracotta-deep)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Eliminar</button>
                <button onClick={() => setConfirmingDeleteId(null)} className="foc" style={{ border: 0, borderRadius: 999, padding: "8px 16px", background: "transparent", color: "var(--ink)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
              </div>
            )}
            {archivedNotice === p.id && (
              <div style={{ padding: "10px 22px", background: "rgba(201,168,118,.14)", borderBottom: "1px solid var(--line)", fontSize: 12.5, color: "#7A5A20" }}>
                Este producto tiene pedidos históricos — se archivó en vez de eliminarse.
              </div>
            )}
          </div>
        ))}

        <Pagination meta={meta} page={page} onPageChange={setPage} />
      </div>

      {formTarget && (
        <AdminProductForm
          product={formTarget.id ? formTarget : null}
          onClose={() => { setFormTarget(null); load(); }}
          onSaved={() => load()}
        />
      )}
      <style>{`.admin-row:hover{background:#FAF7F0}`}</style>
    </div>
  );
};
