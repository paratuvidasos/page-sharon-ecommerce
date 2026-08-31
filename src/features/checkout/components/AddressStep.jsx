import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { selectStyle, fieldLabelStyle, optionCardStyle } from "../fieldStyles";
import { ShippingAddressFields } from "./ShippingAddressFields";

const MANUAL_ADDRESS = "manual";

// Dirección de envío: si hay sesión con direcciones guardadas, se preselecciona la
// predeterminada y se muestra resumida dentro de una card con un link "Cambiar
// dirección" que despliega el menú desplegable con las guardadas + "Escribir otra
// dirección". Sin sesión o sin direcciones guardadas, se salta directo al
// formulario en blanco para crear la dirección ahí mismo — nunca un modal (acá el
// checkout ya es una página aparte, no hace falta anidar).
export const AddressStep = ({ addresses, selectedAddressId, onSelectAddress, manual, errors, touched, onManualChange, onManualBlur }) => {
  const { t } = useTranslation("checkout");
  const [changing, setChanging] = useState(false);
  const savedAddresses = useMemo(() => (addresses || []).filter((a) => !a.archived), [addresses]);
  const selected = savedAddresses.find((a) => a.id === selectedAddressId);
  const isManual = selectedAddressId === MANUAL_ADDRESS || savedAddresses.length === 0;

  if (!isManual && selected && !changing) {
    return (
      <div style={{ ...optionCardStyle, padding: "16px 18px" }}>
        <div className="eyebrow" style={fieldLabelStyle}>{t("addressStep.deliverTo")}</div>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          <strong>{selected.alias}</strong> — {selected.recipientName}
          <br />
          {selected.line1}{selected.line2 ? `, ${selected.line2}` : ""}
          <br />
          {selected.city}, {selected.stateProvince}
        </div>
        <button
          type="button"
          onClick={() => setChanging(true)}
          style={{ background: "none", border: 0, padding: 0, marginTop: 10, color: "var(--botanic-deep)", fontSize: 12, fontWeight: 600, textDecoration: "underline", cursor: "pointer" }}
        >
          {t("addressStep.changeAddress")}
        </button>
      </div>
    );
  }

  return (
    <div>
      {savedAddresses.length > 0 && (
        <label style={{ display: "block", marginBottom: 14 }}>
          <span className="eyebrow" style={fieldLabelStyle}>{t("addressStep.savedAddress")}</span>
          <select
            value={selectedAddressId}
            onChange={(e) => {
              onSelectAddress(e.target.value);
              if (e.target.value !== MANUAL_ADDRESS) setChanging(false);
            }}
            style={selectStyle}
          >
            {savedAddresses.map((a) => (
              <option key={a.id} value={a.id}>
                {a.alias}{a.isDefault ? t("addressStep.defaultSuffix") : ""}
              </option>
            ))}
            <option value={MANUAL_ADDRESS}>{t("addressStep.addNew")}</option>
          </select>
        </label>
      )}

      {isManual && (
        <ShippingAddressFields
          values={manual}
          errors={errors}
          touched={touched}
          onChange={onManualChange}
          onBlur={onManualBlur}
        />
      )}
    </div>
  );
};

export { MANUAL_ADDRESS };
