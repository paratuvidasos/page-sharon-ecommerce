import { useTranslation } from "react-i18next";
import { Icon } from "@ui/Icon";

// Controles de paginación compartidos por todos los listados admin (convención
// page/limit → {items, meta:{page,limit,total,totalPages}}).
export const Pagination = ({ meta, page, onPageChange }) => {
  const { t } = useTranslation("admin");
  if (!meta || meta.totalPages <= 1) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 22px", borderTop: "1px solid var(--line)" }}>
      <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
        {t("pagination.summary", { page: meta.page, totalPages: meta.totalPages, total: meta.total })}
      </span>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="foc"
          style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid var(--line)", background: "#fff", cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.4 : 1, display: "grid", placeItems: "center" }}
        >
          <Icon name="chev-l" size={14} />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= meta.totalPages}
          className="foc"
          style={{ width: 32, height: 32, borderRadius: 9, border: "1px solid var(--line)", background: "#fff", cursor: page >= meta.totalPages ? "not-allowed" : "pointer", opacity: page >= meta.totalPages ? 0.4 : 1, display: "grid", placeItems: "center" }}
        >
          <Icon name="chev-r" size={14} />
        </button>
      </div>
    </div>
  );
};
