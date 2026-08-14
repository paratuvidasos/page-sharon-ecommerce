import { useState } from "react";
import { Button } from "@ui/components/Button";

const linkBtnStyle = {
  background: "none",
  border: 0,
  padding: 0,
  fontSize: 12.5,
  color: "var(--ink)",
  textDecoration: "underline",
  cursor: "pointer",
};

const badgeStyle = (bg, color) => ({
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: ".06em",
  textTransform: "uppercase",
  color,
  background: bg,
  padding: "3px 8px",
  borderRadius: 999,
});

// Una dirección guardada + sus acciones. blockedByActiveOrder llega ya calculado
// por AddressBookModal (es la única no archivada y tiene un pedido en curso) — acá
// solo se decide qué mostrar: el bloqueo con la opción de archivar, o las acciones normales.
export const AddressCard = ({ address, country, blockedByActiveOrder, onEdit, onSetDefault, onArchive, onRestore, onDelete }) => {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <div
      style={{
        border: ".5px solid var(--line)",
        borderRadius: 16,
        padding: "16px 18px",
        marginBottom: 12,
        opacity: address.archived ? 0.65 : 1,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{address.alias}</span>
        {address.isDefault && <span style={badgeStyle("var(--botanic-muted)", "var(--botanic-deep)")}>Predeterminada</span>}
        {address.archived && <span style={badgeStyle("var(--cream-2)", "var(--ink-soft)")}>Archivada</span>}
      </div>

      <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6, lineHeight: 1.5 }}>
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ""}
        <br />
        {address.city}, {address.postalCode} · {country?.name}
      </p>

      {confirmingDelete ? (
        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            background: "rgba(156,74,74,.08)",
            border: "1px solid rgba(156,74,74,.3)",
            borderRadius: 12,
          }}
        >
          <p style={{ fontSize: 12.5, color: "#7A3535" }}>¿Eliminar esta dirección? No se puede deshacer.</p>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Button type="button" size="sm" onClick={onDelete}>Sí, eliminar</Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmingDelete(false)}>Cancelar</Button>
          </div>
        </div>
      ) : blockedByActiveOrder ? (
        <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--cream-2)", borderRadius: 12 }}>
          <p style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
            No se puede eliminar: tiene un pedido en curso que la referencia. Puedes archivarla en su lugar.
          </p>
          <Button type="button" size="sm" variant="ghost" onClick={onArchive} style={{ marginTop: 8 }}>
            Archivar esta dirección
          </Button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
          {address.archived ? (
            <button type="button" onClick={onRestore} style={linkBtnStyle}>Restaurar</button>
          ) : (
            <>
              <button type="button" onClick={onEdit} style={linkBtnStyle}>Editar</button>
              {!address.isDefault && (
                <button type="button" onClick={onSetDefault} style={linkBtnStyle}>Marcar predeterminada</button>
              )}
              <button type="button" onClick={() => setConfirmingDelete(true)} style={{ ...linkBtnStyle, color: "#9C4A4A" }}>
                Eliminar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
