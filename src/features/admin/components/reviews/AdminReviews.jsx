import { useEffect, useState } from "react";
import { Icon, Stars } from "@ui/Icon";
import { useAuth } from "@shared/auth/AuthContext";
import { listAdminReviews, approveReview, rejectReview, hideReview } from "@shared/api-client";
import { Pagination } from "../Pagination";

const TABS = [
  { value: "PENDING", label: "Pendientes" },
  { value: "APPROVED", label: "Aprobadas" },
  { value: "REJECTED", label: "Rechazadas" },
  { value: "HIDDEN", label: "Ocultas" },
];

const formatDate = (iso) => new Date(iso).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

// GET /admin/reviews con tabs de estado + acciones de moderación. Nota: hoy las
// reseñas nuevas se siguen publicando automáticamente (REVIEWS_REQUIRE_MODERATION es
// una variable del backend, no algo que el frontend controle) — este panel sirve para
// cuando esa variable se active, o para ocultar/rechazar reseñas ya publicadas.
export const AdminReviews = () => {
  const { getAccessToken } = useAuth();
  const [tab, setTab] = useState("PENDING");
  const [reviews, setReviews] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("loading");
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = () => {
    setStatus("loading");
    listAdminReviews({ page, limit: 20, status: tab }, getAccessToken())
      .then((res) => {
        setReviews(res.items);
        setMeta(res.meta);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, [page, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const removeFromList = (id) => setReviews((rs) => rs.filter((r) => r.id !== id));

  const approve = async (id) => {
    try {
      await approveReview(id, getAccessToken());
      removeFromList(id);
    } catch {
      // se deja en la lista para reintentar
    }
  };

  const confirmReject = async (id) => {
    if (!rejectReason.trim()) return;
    try {
      await rejectReview(id, rejectReason.trim(), getAccessToken());
      setRejectingId(null);
      setRejectReason("");
      removeFromList(id);
    } catch {
      // se deja el formulario abierto para reintentar
    }
  };

  const hide = async (id) => {
    try {
      await hideReview(id, getAccessToken());
      removeFromList(id);
    } catch {
      // se deja en la lista
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => { setPage(1); setTab(t.value); }}
            className="foc"
            style={{
              borderRadius: 999, padding: "9px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
              background: tab === t.value ? "var(--ink)" : "#fff",
              color: tab === t.value ? "var(--cream)" : "var(--ink)",
              border: tab === t.value ? "none" : "1px solid var(--line)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", overflow: "hidden" }}>
        {status === "loading" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>Cargando reseñas…</div>}
        {status === "error" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--terracotta-deep)" }}>No se pudieron cargar las reseñas.</div>}
        {status === "ready" && reviews.length === 0 && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>No hay reseñas en este estado.</div>}

        {reviews.map((r) => (
          <div key={r.id} style={{ padding: "18px 22px", borderBottom: "1px solid var(--line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <Stars value={r.rating} size={13} />
              <span style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{formatDate(r.createdAt)}</span>
            </div>
            <p style={{ fontSize: 13.5, marginBottom: 10 }}>{r.comment}</p>
            {r.rejectionReason && <p style={{ fontSize: 12, color: "var(--terracotta-deep)", marginBottom: 10 }}>Motivo: {r.rejectionReason}</p>}

            {rejectingId === r.id ? (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Motivo del rechazo" style={{ flex: 1, padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 10, fontSize: 13 }} />
                <button onClick={() => confirmReject(r.id)} className="foc" style={{ border: 0, borderRadius: 999, padding: "9px 16px", background: "var(--terracotta-deep)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Confirmar</button>
                <button onClick={() => { setRejectingId(null); setRejectReason(""); }} className="foc" style={{ border: 0, background: "none", fontSize: 12, cursor: "pointer" }}>Cancelar</button>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                {tab === "PENDING" && (
                  <>
                    <button onClick={() => approve(r.id)} className="foc" style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid var(--line)", borderRadius: 999, padding: "8px 14px", background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      <Icon name="check" size={13} color="var(--botanic-deep)" /> Aprobar
                    </button>
                    <button onClick={() => setRejectingId(r.id)} className="foc" style={{ border: "1px solid rgba(193,99,63,.25)", borderRadius: 999, padding: "8px 14px", background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      Rechazar
                    </button>
                  </>
                )}
                {tab === "APPROVED" && (
                  <button onClick={() => hide(r.id)} className="foc" style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "8px 14px", background: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                    Ocultar
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        <Pagination meta={meta} page={page} onPageChange={setPage} />
      </div>
    </div>
  );
};
