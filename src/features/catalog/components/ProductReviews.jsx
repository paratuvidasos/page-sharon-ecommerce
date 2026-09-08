import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, Stars } from "@ui/Icon";
import { useAuth } from "@shared/auth/AuthContext";
import { listReviews, createReview, ApiError } from "@shared/api-client";
import { formatDate } from "@shared/i18n/date";

// [0021][BE] Reseñas: listar (público) + escribir (requiere sesión y haber comprado
// el producto). `canReview` lo calcula el padre a partir de `orders` (ya vive en
// App.jsx) para no pedirle a este componente que conozca el historial de pedidos
// completo — solo recibe el booleano que ya decide si mostrar el formulario.
export const ProductReviews = ({ productId, canReview }) => {
  const { t } = useTranslation("catalog");
  const { user, getAccessToken } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [formOpen, setFormOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const load = () => {
    setStatus("loading");
    listReviews(productId, { limit: 20 })
      .then((res) => {
        setReviews(res.items);
        setSummary(res.ratingSummary);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(() => {
    if (productId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await createReview(productId, { rating, comment }, getAccessToken());
      setComment("");
      setRating(5);
      setFormOpen(false);
      load();
    } catch (err) {
      if (err instanceof ApiError && err.code === "DUPLICATE_REVIEW") {
        setSubmitError(t("reviews.errors.duplicate"));
      } else if (err instanceof ApiError && err.code === "REVIEW_REQUIRES_VERIFIED_PURCHASE") {
        setSubmitError(t("reviews.errors.requiresPurchase"));
      } else {
        setSubmitError(t("reviews.errors.generic"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: 30, paddingTop: 26, borderTop: "1px solid var(--line)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div className="eyebrow" style={{ fontSize: 10 }}>{t("reviews.eyebrow")}</div>
          {summary && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <Stars value={summary.average ?? 0} />
              <span className="mono" style={{ color: "var(--ink-soft)", fontSize: 13 }}>
                {summary.average != null ? t("reviews.countSummary", { average: summary.average.toFixed(1), count: summary.count }) : t("reviews.noReviewsYet")}
              </span>
            </div>
          )}
        </div>
        {user && canReview && !formOpen && (
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            style={{ background: "none", border: "1px solid var(--line)", borderRadius: 999, padding: "8px 14px", fontSize: 12.5, cursor: "pointer" }}
          >
            {t("reviews.writeReview")}
          </button>
        )}
      </div>

      {!user && (
        <p style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 14 }}>{t("reviews.loginToReview")}</p>
      )}

      {formOpen && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 20, padding: 16, background: "#fff", borderRadius: 14, border: "1px solid var(--line)" }}>
          <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={t("reviews.starsLabel", { count: n })}
                style={{ background: "none", border: 0, cursor: "pointer", padding: 2 }}
              >
                <Icon name={n <= rating ? "star" : "star-empty"} size={20} color="var(--gold)" />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t("reviews.commentPlaceholder")}
            required
            rows={3}
            style={{ width: "100%", padding: 10, border: "1px solid var(--line)", borderRadius: 10, fontFamily: "var(--sans)", fontSize: 13, resize: "vertical" }}
          />
          {submitError && <p style={{ color: "var(--garnet, #9c4a4a)", fontSize: 12.5, marginTop: 8 }}>{submitError}</p>}
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              type="submit"
              disabled={submitting}
              style={{ border: 0, cursor: submitting ? "not-allowed" : "pointer", padding: "9px 16px", borderRadius: 999, background: "var(--ink)", color: "var(--cream)", fontSize: 12.5, opacity: submitting ? 0.6 : 1 }}
            >
              {submitting ? t("reviews.publishing") : t("reviews.publish")}
            </button>
            <button
              type="button"
              onClick={() => { setFormOpen(false); setSubmitError(null); }}
              style={{ border: 0, cursor: "pointer", padding: "9px 16px", borderRadius: 999, background: "transparent", color: "var(--ink-soft)", fontSize: 12.5 }}
            >
              {t("reviews.cancel")}
            </button>
          </div>
        </form>
      )}

      {status === "loading" && <p style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{t("reviews.loading")}</p>}
      {status === "error" && <p style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{t("reviews.loadError")}</p>}
      {status === "ready" && reviews.length === 0 && (
        <p style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{t("reviews.empty")}</p>
      )}
      {status === "ready" && reviews.map((r) => (
        <div key={r.id} style={{ padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <Stars value={r.rating} size={12} />
            <span style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{formatDate(r.createdAt)}</span>
            {r.verifiedPurchase && (
              <span style={{ fontSize: 10, color: "var(--botanic-deep)", fontWeight: 600 }}>{t("reviews.verifiedPurchase")}</span>
            )}
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.5 }}>{r.comment}</p>
        </div>
      ))}
    </div>
  );
};
