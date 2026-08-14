import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { COUNTRIES } from "@shared/data/countries";

const FIELD_LABELS = { alias: "Alias", line1: "Dirección", city: "Ciudad", postalCode: "Código postal" };

const selectStyle = {
  width: "100%",
  padding: "14px 18px",
  border: ".5px solid var(--line)",
  borderRadius: 999,
  background: "#fff",
  fontSize: 14,
  fontFamily: "var(--sans)",
  outline: 0,
};

function inputStyle(hasError) {
  return {
    width: "100%",
    padding: "14px 18px",
    border: `.5px solid ${hasError ? "#9C4A4A" : "var(--line)"}`,
    borderRadius: 999,
    background: "#fff",
    fontSize: 14,
    fontFamily: "var(--sans)",
    outline: 0,
    boxSizing: "border-box",
  };
}

function validateAlias(value) {
  if (!value.trim()) return "Ponle un alias para identificarla (ej. Casa, Oficina).";
  return "";
}
function validateLine1(value) {
  if (!value.trim()) return "Necesitamos la dirección.";
  if (value.trim().length < 5) return "Agrega un poco más de detalle a la dirección.";
  return "";
}
function validateCity(value) {
  if (!value.trim()) return "Necesitamos la ciudad.";
  return "";
}
function validatePostalCode(value, countryCode) {
  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
  if (!value.trim()) return "Necesitamos el código postal.";
  if (!country.postalCodeRegex.test(value.trim())) {
    return `Formato inválido para ${country.name} (ej. ${country.postalCodeExample}).`;
  }
  return "";
}

async function saveAddress(data) {
  // No hay backend todavía: simula el guardado. La validación real del código postal
  // (contra un servicio postal) también debería vivir ahí. Reemplazar cuando exista la API.
  await new Promise((resolve) => setTimeout(resolve, 500));
  return { ok: true };
}

// Formulario de dirección (agregar/editar), autocontenido igual que el resto de
// formularios del repo: validación + submit() imperativo. No incluye "predeterminada"
// ni "archivada": esas son acciones de la lista (AddressCard), no campos del formulario.
export const AddressForm = forwardRef(({ initialValues }, ref) => {
  const [alias, setAlias] = useState(initialValues?.alias || "");
  const [countryCode, setCountryCode] = useState(initialValues?.countryCode || COUNTRIES[0].code);
  const [line1, setLine1] = useState(initialValues?.line1 || "");
  const [line2, setLine2] = useState(initialValues?.line2 || "");
  const [city, setCity] = useState(initialValues?.city || "");
  const [postalCode, setPostalCode] = useState(initialValues?.postalCode || "");

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [summaryToken, setSummaryToken] = useState(0);
  const summaryRef = useRef(null);
  const [serverError, setServerError] = useState("");
  const serverErrorRef = useRef(null);

  useEffect(() => {
    if (summaryToken > 0 && summaryRef.current) summaryRef.current.focus();
  }, [summaryToken]);

  useEffect(() => {
    if (serverError && serverErrorRef.current) serverErrorRef.current.focus();
  }, [serverError]);

  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];

  const handleAliasChange = (e) => {
    const v = e.target.value;
    setAlias(v);
    setErrors((prev) => (touched.alias ? { ...prev, alias: validateAlias(v) } : prev));
  };
  const handleAliasBlur = () => {
    setTouched((prev) => ({ ...prev, alias: true }));
    setErrors((prev) => ({ ...prev, alias: validateAlias(alias) }));
  };

  const handleCountryChange = (e) => {
    const nextCode = e.target.value;
    setCountryCode(nextCode);
    setErrors((prev) => (touched.postalCode ? { ...prev, postalCode: validatePostalCode(postalCode, nextCode) } : prev));
  };

  const handleLine1Change = (e) => {
    const v = e.target.value;
    setLine1(v);
    setErrors((prev) => (touched.line1 ? { ...prev, line1: validateLine1(v) } : prev));
  };
  const handleLine1Blur = () => {
    setTouched((prev) => ({ ...prev, line1: true }));
    setErrors((prev) => ({ ...prev, line1: validateLine1(line1) }));
  };

  const handleCityChange = (e) => {
    const v = e.target.value;
    setCity(v);
    setErrors((prev) => (touched.city ? { ...prev, city: validateCity(v) } : prev));
  };
  const handleCityBlur = () => {
    setTouched((prev) => ({ ...prev, city: true }));
    setErrors((prev) => ({ ...prev, city: validateCity(city) }));
  };

  const handlePostalCodeChange = (e) => {
    const v = e.target.value;
    setPostalCode(v);
    setErrors((prev) => (touched.postalCode ? { ...prev, postalCode: validatePostalCode(v, countryCode) } : prev));
  };
  const handlePostalCodeBlur = () => {
    setTouched((prev) => ({ ...prev, postalCode: true }));
    setErrors((prev) => ({ ...prev, postalCode: validatePostalCode(postalCode, countryCode) }));
  };

  const invalidFields = Object.entries(errors)
    .filter(([, msg]) => msg)
    .map(([field]) => field);

  useImperativeHandle(ref, () => ({
    submit: async () => {
      const nextErrors = {
        alias: validateAlias(alias),
        line1: validateLine1(line1),
        city: validateCity(city),
        postalCode: validatePostalCode(postalCode, countryCode),
      };
      setErrors(nextErrors);
      setTouched({ alias: true, line1: true, city: true, postalCode: true });

      const hasErrors = Object.values(nextErrors).some(Boolean);
      if (hasErrors) {
        setShowSummary(true);
        setSummaryToken((t) => t + 1);
        return { ok: false };
      }

      setShowSummary(false);
      setServerError("");
      try {
        const fields = {
          alias: alias.trim(),
          countryCode,
          line1: line1.trim(),
          line2: line2.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
        };
        await saveAddress(fields);
        return { ok: true, address: fields };
      } catch {
        setServerError("No pudimos guardar la dirección. Intenta de nuevo en unos segundos.");
        return { ok: false };
      }
    },
  }));

  return (
    <div>
      {showSummary && invalidFields.length > 0 && (
        <div
          ref={summaryRef}
          role="alert"
          tabIndex={-1}
          style={{
            background: "rgba(156,74,74,.08)",
            border: "1px solid rgba(156,74,74,.3)",
            borderRadius: 14,
            padding: "14px 18px",
            marginBottom: 20,
            outline: "none",
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 13, color: "#7A3535", marginBottom: 8 }}>
            Hay campos por revisar
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
            {invalidFields.map((field) => (
              <li key={field} style={{ fontSize: 12.5, color: "#7A3535" }}>
                <a href={`#address-${field}`} style={{ textDecoration: "underline" }}>
                  {FIELD_LABELS[field]}: {errors[field]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {serverError && (
        <div
          ref={serverErrorRef}
          role="alert"
          tabIndex={-1}
          style={{
            background: "rgba(156,74,74,.08)",
            border: "1px solid rgba(156,74,74,.3)",
            borderRadius: 14,
            padding: "12px 18px",
            marginBottom: 20,
            fontSize: 13,
            color: "#7A3535",
            outline: "none",
          }}
        >
          {serverError}
        </div>
      )}

      <div>
        <label htmlFor="address-alias" className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
          Alias
        </label>
        <input
          id="address-alias"
          value={alias}
          onChange={handleAliasChange}
          onBlur={handleAliasBlur}
          type="text"
          placeholder="Casa, Oficina…"
          aria-describedby={touched.alias && errors.alias ? "address-alias-error" : undefined}
          aria-invalid={touched.alias && errors.alias ? "true" : undefined}
          style={inputStyle(touched.alias && errors.alias)}
        />
        <div style={{ minHeight: 18, marginTop: 4 }}>
          {touched.alias && errors.alias && (
            <span id="address-alias-error" role="alert" style={{ fontSize: 11, color: "#9C4A4A" }}>
              {errors.alias}
            </span>
          )}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label htmlFor="address-country" className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
          País
        </label>
        <select id="address-country" value={countryCode} onChange={handleCountryChange} style={selectStyle}>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 14 }}>
        <label htmlFor="address-line1" className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
          Dirección
        </label>
        <input
          id="address-line1"
          value={line1}
          onChange={handleLine1Change}
          onBlur={handleLine1Blur}
          type="text"
          placeholder="Calle, número…"
          autoComplete="address-line1"
          aria-describedby={touched.line1 && errors.line1 ? "address-line1-error" : undefined}
          aria-invalid={touched.line1 && errors.line1 ? "true" : undefined}
          style={inputStyle(touched.line1 && errors.line1)}
        />
        <div style={{ minHeight: 18, marginTop: 4 }}>
          {touched.line1 && errors.line1 && (
            <span id="address-line1-error" role="alert" style={{ fontSize: 11, color: "#9C4A4A" }}>
              {errors.line1}
            </span>
          )}
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <label htmlFor="address-line2" className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
          Apto, interior o referencia (opcional)
        </label>
        <input
          id="address-line2"
          value={line2}
          onChange={(e) => setLine2(e.target.value)}
          type="text"
          placeholder="Apto 501, torre 2…"
          autoComplete="address-line2"
          style={inputStyle(false)}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
        <div>
          <label htmlFor="address-city" className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
            Ciudad
          </label>
          <input
            id="address-city"
            value={city}
            onChange={handleCityChange}
            onBlur={handleCityBlur}
            type="text"
            placeholder="Tu ciudad"
            autoComplete="address-level2"
            aria-describedby={touched.city && errors.city ? "address-city-error" : undefined}
            aria-invalid={touched.city && errors.city ? "true" : undefined}
            style={inputStyle(touched.city && errors.city)}
          />
          <div style={{ minHeight: 18, marginTop: 4 }}>
            {touched.city && errors.city && (
              <span id="address-city-error" role="alert" style={{ fontSize: 11, color: "#9C4A4A" }}>
                {errors.city}
              </span>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="address-postal-code" className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
            Código postal
          </label>
          <input
            id="address-postal-code"
            value={postalCode}
            onChange={handlePostalCodeChange}
            onBlur={handlePostalCodeBlur}
            type="text"
            placeholder={country.postalCodeExample}
            autoComplete="postal-code"
            aria-describedby={touched.postalCode && errors.postalCode ? "address-postal-code-error" : undefined}
            aria-invalid={touched.postalCode && errors.postalCode ? "true" : undefined}
            style={inputStyle(touched.postalCode && errors.postalCode)}
          />
          <div style={{ minHeight: 18, marginTop: 4 }}>
            {touched.postalCode && errors.postalCode ? (
              <span id="address-postal-code-error" role="alert" style={{ fontSize: 11, color: "#9C4A4A" }}>
                {errors.postalCode}
              </span>
            ) : (
              <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>Ej. {country.postalCodeExample}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

AddressForm.displayName = "AddressForm";
