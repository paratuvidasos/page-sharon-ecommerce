import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
import { Modal } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { PRODUCTS } from "@features/catalog/data/products";
import { WishlistRow } from "./WishlistRow";

// Lista de deseos: top-level (como CartDrawer), no anidada dentro de ProfileModal,
// porque agregar/quitar productos es una acción de compra, no de cuenta. El backend
// de wishlist solo devuelve productId + addedAt, así que cada item se resuelve contra
// el catálogo local para mostrar nombre/precio/imagen (ver comentario en WishlistRow).
export const WishlistModal = ({ open, onClose, items, onAdd, onRemove }) => {
  const rows = items
    .map((item) => ({ item, product: PRODUCTS.find((p) => p.productId === item.productId) }))
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
          <span className="eyebrow" style={{ fontSize: 10, letterSpacing: ".14em" }}>Favoritos</span>
          <div id="wishlist-title" className="display" style={{ fontSize: 24, marginTop: 6 }}>
            Tu lista de deseos
          </div>
        </div>
        <IconButton icon="close" size={38} iconSize={20} onClick={onClose} aria-label="Cerrar" />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 26px 20px" }}>
        {rows.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 8px", color: "var(--ink-soft)" }}>
            <Icon name="heart" size={26} />
            <p style={{ fontSize: 13, marginTop: 10 }}>Todavía no guardas productos.</p>
          </div>
        ) : (
          rows.map(({ item, product }) => (
            <WishlistRow key={item.productId} product={product} onAdd={onAdd} onRemove={() => onRemove(product)} />
          ))
        )}
      </div>
    </Modal>
  );
};
