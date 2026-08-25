import { COUNTRIES } from "@shared/data/countries";
import { selectStyle, inputStyle, fieldLabelStyle, fieldErrorStyle, fieldHintStyle } from "../fieldStyles";

// Inputs puros de dirección de envío, controlados 100% por props — sin estado propio,
// para poder reusarlos tanto en el formulario "Escribir otra dirección" de AddressStep
// como en cualquier otro lugar que necesite los mismos campos. Los nombres de campo
// (streetLine1/streetLine2) son el contrato que espera POST /orders/checkout, distinto
// a propósito de line1/line2 que usa la libreta de direcciones del perfil.
export const ShippingAddressFields = ({ values, errors, touched, onChange, onBlur }) => {
  const country = COUNTRIES.find((c) => c.code === values.countryCode) || COUNTRIES[0];

  const set = (field) => (e) => onChange(field, e.target.value);
  const blur = (field) => () => onBlur(field);

  return (
    <div>
      <div>
        <label htmlFor="checkout-recipientName" className="eyebrow" style={fieldLabelStyle}>
          Nombre de quien recibe
        </label>
        <input
          id="checkout-recipientName"
          value={values.recipientName}
          onChange={set("recipientName")}
          onBlur={blur("recipientName")}
          type="text"
          placeholder="Quién recibe el pedido"
          autoComplete="name"
          style={inputStyle(touched.recipientName && errors.recipientName)}
        />
        <div style={{ minHeight: 18, marginTop: 4 }}>
          {touched.recipientName && errors.recipientName && (
            <span role="alert" style={fieldErrorStyle}>{errors.recipientName}</span>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="checkout-grid">
        <div>
          <label htmlFor="checkout-country" className="eyebrow" style={fieldLabelStyle}>País</label>
          <select
            id="checkout-country"
            value={values.countryCode}
            onChange={(e) => {
              onChange("countryCode", e.target.value);
              onChange("phone", "");
            }}
            style={selectStyle}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="checkout-phone" className="eyebrow" style={fieldLabelStyle}>Teléfono</label>
          <input
            id="checkout-phone"
            value={values.phone}
            onChange={(e) => onChange("phone", e.target.value.replace(/\D/g, "").slice(0, country.phoneDigits))}
            onBlur={blur("phone")}
            type="tel"
            inputMode="numeric"
            placeholder={"9".repeat(country.phoneDigits)}
            style={inputStyle(touched.phone && errors.phone)}
          />
          <div style={{ minHeight: 18, marginTop: 4 }}>
            {touched.phone && errors.phone && <span role="alert" style={fieldErrorStyle}>{errors.phone}</span>}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label htmlFor="checkout-streetLine1" className="eyebrow" style={fieldLabelStyle}>Dirección</label>
        <input
          id="checkout-streetLine1"
          value={values.streetLine1}
          onChange={set("streetLine1")}
          onBlur={blur("streetLine1")}
          type="text"
          placeholder="Calle, número…"
          autoComplete="address-line1"
          style={inputStyle(touched.streetLine1 && errors.streetLine1)}
        />
        <div style={{ minHeight: 18, marginTop: 4 }}>
          {touched.streetLine1 && errors.streetLine1 && <span role="alert" style={fieldErrorStyle}>{errors.streetLine1}</span>}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label htmlFor="checkout-streetLine2" className="eyebrow" style={fieldLabelStyle}>
          Apto, interior o referencia (opcional)
        </label>
        <input
          id="checkout-streetLine2"
          value={values.streetLine2}
          onChange={set("streetLine2")}
          type="text"
          placeholder="Apto 501, torre 2…"
          autoComplete="address-line2"
          style={inputStyle(false)}
        />
      </div>

      <div style={{ marginTop: 14 }}>
        <label htmlFor="checkout-stateProvince" className="eyebrow" style={fieldLabelStyle}>
          Departamento / estado
        </label>
        <input
          id="checkout-stateProvince"
          value={values.stateProvince}
          onChange={set("stateProvince")}
          onBlur={blur("stateProvince")}
          type="text"
          placeholder="Tu departamento o estado"
          autoComplete="address-level1"
          style={inputStyle(touched.stateProvince && errors.stateProvince)}
        />
        <div style={{ minHeight: 18, marginTop: 4 }}>
          {touched.stateProvince && errors.stateProvince && <span role="alert" style={fieldErrorStyle}>{errors.stateProvince}</span>}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }} className="checkout-grid">
        <div>
          <label htmlFor="checkout-city" className="eyebrow" style={fieldLabelStyle}>Ciudad</label>
          <input
            id="checkout-city"
            value={values.city}
            onChange={set("city")}
            onBlur={blur("city")}
            type="text"
            placeholder="Tu ciudad"
            autoComplete="address-level2"
            style={inputStyle(touched.city && errors.city)}
          />
          <div style={{ minHeight: 18, marginTop: 4 }}>
            {touched.city && errors.city && <span role="alert" style={fieldErrorStyle}>{errors.city}</span>}
          </div>
        </div>
        <div>
          <label htmlFor="checkout-postalCode" className="eyebrow" style={fieldLabelStyle}>Código postal</label>
          <input
            id="checkout-postalCode"
            value={values.postalCode}
            onChange={set("postalCode")}
            onBlur={blur("postalCode")}
            type="text"
            placeholder={country.postalCodeExample}
            autoComplete="postal-code"
            style={inputStyle(touched.postalCode && errors.postalCode)}
          />
          <div style={{ minHeight: 18, marginTop: 4 }}>
            {touched.postalCode && errors.postalCode ? (
              <span role="alert" style={fieldErrorStyle}>{errors.postalCode}</span>
            ) : (
              <span style={fieldHintStyle}>Ej. {country.postalCodeExample}</span>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 560px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};
