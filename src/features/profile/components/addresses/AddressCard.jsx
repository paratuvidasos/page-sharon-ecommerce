import { useState } from "react";
import { useTranslation } from "react-i18next";
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
// pending llega true mientras una acción (default/archive/restore/delete) está en
// vuelo contra el backend, para no dejar hacer doble click sobre la misma tarjeta.
export const AddressCard = ({ address, country, blockedByActiveOrder, pending, onEdit, onSetDefault, onArchive, onRestore, onDelete }) => {
  const { t } = useTranslation("profile");
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
        {address.isDefault && <span style={badgeStyle("var(--botanic-muted)", "var(--botanic-deep)")}>{t("addresses.card.default")}</span>}
        {address.archived && <span style={badgeStyle("var(--cream-2)", "var(--ink-soft)")}>{t("addresses.card.archived")}</span>}
      </div>

      <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 6, lineHeight: 1.5 }}>
        {address.recipientName} · {address.phone}
        <br />
        {address.line1}
        {address.line2 ? `, ${address.line2}` : ""}
        <br />
        {address.city}, {address.stateProvince}, {address.postalCode} · {country?.name}
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
          <p style={{ fontSize: 12.5, color: "#7A3535" }}>{t("addresses.card.confirmDelete")}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Button type="button" size="sm" onClick={onDelete} disabled={pending}>
              {pending ? t("addresses.card.deleting") : t("addresses.card.confirmYes")}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmingDelete(false)} disabled={pending}>
              {t("addresses.card.cancel")}
            </Button>
          </div>
        </div>
      ) : blockedByActiveOrder ? (
        <div style={{ marginTop: 12, padding: "10px 12px", background: "var(--cream-2)", borderRadius: 12 }}>
          <p style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>
            {t("addresses.card.blockedNotice")}
          </p>
          <Button type="button" size="sm" variant="ghost" onClick={onArchive} disabled={pending} style={{ marginTop: 8 }}>
            {pending ? t("addresses.card.archiving") : t("addresses.card.archiveInstead")}
          </Button>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 14, marginTop: 12, flexWrap: "wrap" }}>
          {address.archived ? (
            <button type="button" onClick={onRestore} disabled={pending} style={linkBtnStyle}>
              {pending ? t("addresses.card.restoring") : t("addresses.card.restore")}
            </button>
          ) : (
            <>
              <button type="button" onClick={onEdit} disabled={pending} style={linkBtnStyle}>{t("addresses.card.edit")}</button>
              {!address.isDefault && (
                <button type="button" onClick={onSetDefault} disabled={pending} style={linkBtnStyle}>
                  {pending ? t("addresses.card.settingDefault") : t("addresses.card.setDefault")}
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                disabled={pending}
                style={{ ...linkBtnStyle, color: "#9C4A4A" }}
              >
                {t("addresses.card.delete")}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
