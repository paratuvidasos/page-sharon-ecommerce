import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
import { Modal } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { listProducts } from "@shared/api-client";
import { normalizeProduct } from "@features/catalog/utils/normalizeProduct";
import { WishlistRow } from "./WishlistRow";

// Lista de deseos: top-level (como CartDrawer), no anidada dentro de ProfileModal,
// porque agregar/quitar productos es una acción de compra, no de cuenta. El backend
// de wishlist solo devuelve productId + addedAt, así que cada item se resuelve contra
// el catálogo real ([0013][BE]) para mostrar nombre/precio/imagen — se pide una sola
// página grande al abrir el modal en vez de una llamada por producto (ver comentario
// en WishlistRow).
export const WishlistModal = ({ open, onClose, items, onOpenProduct, onRemove }) => {
  const { t } = useTranslation("wishlist");
  const [catalogById, setCatalogById] = useState(new Map());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    setLoadError(false);
    listProducts({ limit: 100 })
      .then((res) => {
        if (cancelled) return;
        setCatalogById(new Map(res.items.map((item) => [item.id, normalizeProduct(item)])));
      })
      .catch(() => {
        if (cancelled) return;
        setCatalogById(new Map());
        setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Si el catálogo no cargó (todavía cargando o falló la llamada), no hay forma de
  // saber si `items` tiene productos válidos o no — mostrar "no tienes favoritos" en
  // ese caso sería engañoso cuando el badge de Nav sí trae un conteo > 0.
  const rows = items
    .map((item) => ({ item, product: catalogById.get(item.productId) }))
    .filter((r) => r.product)
    .sort((a, b) => b.item.addedAt.localeCompare(a.item.addedAt));

  return (
    <Modal
      open={open}
      onClose={onClose}
      zIndex={Z.wishlist}
      width="min(560px, 92vw)"
      labelledBy="wishlist-title"
      panelStyle={{
        maxHeight: "88vh",
        background: "var(--cream)",
        borderRadius: 24,
        boxShadow: "0 32px 80px rgba(27,24,21,.3)",
        border: ".5px solid var(--line)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "22px 26px",
          borderBottom: "1px solid var(--line)",
          flexShrink: 0,
        }}
      >
        <div>
          <span className="eyebrow" style={{ fontSize: 10, letterSpacing: ".14em" }}>{t("modal.eyebrow")}</span>
          <div id="wishlist-title" className="display" style={{ fontSize: 24, marginTop: 6 }}>
            {t("modal.title")}
          </div>
        </div>
        <IconButton icon="close" size={38} iconSize={20} onClick={onClose} aria-label={t("modal.close")} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 26px 20px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 8px", color: "var(--ink-soft)" }}>
            <p style={{ fontSize: 13 }}>{t("modal.loading")}</p>
          </div>
        ) : loadError ? (
          <div style={{ textAlign: "center", padding: "40px 8px", color: "var(--ink-soft)" }}>
            <p style={{ fontSize: 13 }}>{t("modal.loadError")}</p>
          </div>
        ) : rows.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 8px", color: "var(--ink-soft)" }}>
            <Icon name="heart" size={26} />
            <p style={{ fontSize: 13, marginTop: 10 }}>{t("modal.empty")}</p>
          </div>
        ) : (
          rows.map(({ item, product }) => (
            <WishlistRow key={item.productId} product={product} onOpenProduct={onOpenProduct} onRemove={() => onRemove(product)} />
          ))
        )}
      </div>
    </Modal>
  );
};
