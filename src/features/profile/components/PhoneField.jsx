import { COUNTRIES } from "../data/countries";

const selectStyle = {
  width: 132,
  flexShrink: 0,
  padding: "14px 12px",
  border: ".5px solid var(--line)",
  borderRadius: 999,
  background: "#fff",
  fontSize: 14,
  fontFamily: "var(--sans)",
  outline: 0,
};

// Combina el selector de país (define el prefijo y la cantidad de dígitos esperada)
// con el input del número. El país vive en el formulario padre porque cambia junto
// con la validación del teléfono.
export const PhoneField = ({ countryCode, phone, error, touched, onCountryChange, onPhoneChange, onBlur }) => {
  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
  const hasError = Boolean(touched && error);

  return (
    <div>
      <label htmlFor="profile-phone" className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
        Teléfono
      </label>
      <div style={{ display: "flex", gap: 8 }}>
        <select
          aria-label="País"
          value={countryCode}
          onChange={(e) => onCountryChange(e.target.value)}
          style={selectStyle}
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.dialCode} {c.code}
            </option>
          ))}
        </select>
        <input
          id="profile-phone"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value.replace(/\D/g, "").slice(0, country.digits))}
          onBlur={onBlur}
          type="tel"
          inputMode="numeric"
          placeholder={"9".repeat(country.digits)}
          aria-describedby={hasError ? "profile-phone-error" : undefined}
          aria-invalid={hasError ? "true" : undefined}
          style={{
            flex: 1,
            minWidth: 0,
            padding: "14px 18px",
            border: `.5px solid ${hasError ? "#9C4A4A" : "var(--line)"}`,
            borderRadius: 999,
            background: "#fff",
            fontSize: 14,
            fontFamily: "var(--sans)",
            outline: 0,
          }}
        />
      </div>
      <div style={{ minHeight: 18, marginTop: 4 }}>
        {hasError ? (
          <span id="profile-phone-error" role="alert" style={{ fontSize: 11, color: "#9C4A4A" }}>
            {error}
          </span>
        ) : (
          <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>
            Formato: {country.dialCode} + {country.digits} dígitos.
          </span>
        )}
      </div>
    </div>
  );
};
