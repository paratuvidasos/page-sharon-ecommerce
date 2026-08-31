import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { COUNTRIES, stripDialCode } from "@shared/data/countries";
import { createAddress, updateAddress, ApiError } from "@shared/api-client";
import { useAuth } from "@shared/auth/AuthContext";

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

function validateAlias(value, t) {
  if (!value.trim()) return t("addresses.form.aliasRequired");
  return "";
}
function validateRecipientName(value, t) {
  if (!value.trim()) return t("addresses.form.recipientRequired");
  return "";
}
function validatePhone(value, countryCode, t) {
  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
  if (!value) return t("addresses.form.phoneRequired");
  if (value.length !== country.phoneDigits) return t("addresses.form.phoneDigits", { digits: country.phoneDigits, country: country.name });
  return "";
}
function validateLine1(value, t) {
  if (!value.trim()) return t("addresses.form.line1Required");
  if (value.trim().length < 5) return t("addresses.form.line1TooShort");
  return "";
}
function validateStateProvince(value, t) {
  if (!value.trim()) return t("addresses.form.stateProvinceRequired");
  return "";
}
function validateCity(value, t) {
  if (!value.trim()) return t("addresses.form.cityRequired");
  return "";
}
function validatePostalCode(value, countryCode, t) {
  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
  if (!value.trim()) return t("addresses.form.postalCodeRequired");
  if (!country.postalCodeRegex.test(value.trim())) {
    return t("addresses.form.postalCodeInvalid", { country: country.name, example: country.postalCodeExample });
  }
  return "";
}

// Formulario de dirección (agregar/editar), autocontenido igual que el resto de
// formularios del repo: validación + submit() imperativo, llamando directo a
// createAddress/updateAddress (mismo patrón que ProfileForm con updateProfile). No
// incluye "predeterminada" ni "archivada": esas son acciones de la lista (AddressCard),
// no campos del formulario — las decide el backend (primera activa = predeterminada).
export const AddressForm = forwardRef(({ initialValues }, ref) => {
  const { t } = useTranslation("profile");
  const { getAccessToken } = useAuth();
  const isEditing = Boolean(initialValues?.id);
  const [alias, setAlias] = useState(initialValues?.alias || "");
  const [recipientName, setRecipientName] = useState(initialValues?.recipientName || "");
  const [countryCode, setCountryCode] = useState(initialValues?.countryCode || COUNTRIES[0].code);
  const [phone, setPhone] = useState(
    initialValues?.phone ? stripDialCode(initialValues.phone, initialValues.countryCode || COUNTRIES[0].code) : ""
  );
  const [line1, setLine1] = useState(initialValues?.line1 || "");
  const [line2, setLine2] = useState(initialValues?.line2 || "");
  const [stateProvince, setStateProvince] = useState(initialValues?.stateProvince || "");
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

  const handleRecipientNameChange = (e) => {
    const v = e.target.value;
    setRecipientName(v);
    setErrors((prev) => (touched.recipientName ? { ...prev, recipientName: validateRecipientName(v) } : prev));
  };
  const handleRecipientNameBlur = () => {
    setTouched((prev) => ({ ...prev, recipientName: true }));
    setErrors((prev) => ({ ...prev, recipientName: validateRecipientName(recipientName) }));
  };

  const handlePhoneChange = (value) => {
    setPhone(value);
    setErrors((prev) => (touched.phone ? { ...prev, phone: validatePhone(value, countryCode) } : prev));
  };
  const handlePhoneBlur = () => {
    setTouched((prev) => ({ ...prev, phone: true }));
    setErrors((prev) => ({ ...prev, phone: validatePhone(phone, countryCode) }));
  };

  const handleStateProvinceChange = (e) => {
    const v = e.target.value;
    setStateProvince(v);
    setErrors((prev) => (touched.stateProvince ? { ...prev, stateProvince: validateStateProvince(v) } : prev));
  };
  const handleStateProvinceBlur = () => {
    setTouched((prev) => ({ ...prev, stateProvince: true }));
    setErrors((prev) => ({ ...prev, stateProvince: validateStateProvince(stateProvince) }));
  };

  const handleCountryChange = (e) => {
    const nextCode = e.target.value;
    setCountryCode(nextCode);
    // El formato de dígitos cambia con el país: mejor limpiar que dejar un número a medias.
    setPhone("");
    setErrors((prev) => ({
      ...prev,
      phone: undefined,
      postalCode: touched.postalCode ? validatePostalCode(postalCode, nextCode) : prev.postalCode,
    }));
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
        recipientName: validateRecipientName(recipientName),
        phone: validatePhone(phone, countryCode),
        line1: validateLine1(line1),
        stateProvince: validateStateProvince(stateProvince),
        city: validateCity(city),
        postalCode: validatePostalCode(postalCode, countryCode),
      };
      setErrors(nextErrors);
      setTouched({
        alias: true,
        recipientName: true,
        phone: true,
        line1: true,
        stateProvince: true,
        city: true,
        postalCode: true,
      });

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
          recipientName: recipientName.trim(),
          phone,
          countryCode,
          stateProvince: stateProvince.trim(),
          line1: line1.trim(),
          line2: line2.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
        };
        const apiAddress = isEditing
          ? await updateAddress(initialValues.id, fields, getAccessToken())
          : await createAddress(fields, getAccessToken());
        return { ok: true, address: apiAddress };
      } catch (e) {
        if (e instanceof ApiError && e.message) {
          setServerError(e.message);
        } else {
          setServerError("No pudimos guardar la dirección. Intenta de nuevo en unos segundos.");
        }
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
        <label htmlFor="address-recipientName" className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
          Nombre de quien recibe
        </label>
        <input
          id="address-recipientName"
          value={recipientName}
          onChange={handleRecipientNameChange}
          onBlur={handleRecipientNameBlur}
          type="text"
          placeholder="Quién recibe el pedido"
          autoComplete="name"
          aria-describedby={touched.recipientName && errors.recipientName ? "address-recipientName-error" : undefined}
          aria-invalid={touched.recipientName && errors.recipientName ? "true" : undefined}
          style={inputStyle(touched.recipientName && errors.recipientName)}
        />
        <div style={{ minHeight: 18, marginTop: 4 }}>
          {touched.recipientName && errors.recipientName && (
            <span id="address-recipientName-error" role="alert" style={{ fontSize: 11, color: "#9C4A4A" }}>
              {errors.recipientName}
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
        <label htmlFor="address-phone" className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
          Teléfono de contacto
        </label>
        <input
          id="address-phone"
          value={phone}
          onChange={(e) => handlePhoneChange(e.target.value.replace(/\D/g, "").slice(0, country.phoneDigits))}
          onBlur={handlePhoneBlur}
          type="tel"
          inputMode="numeric"
          placeholder={"9".repeat(country.phoneDigits)}
          aria-describedby={touched.phone && errors.phone ? "address-phone-error" : undefined}
          aria-invalid={touched.phone && errors.phone ? "true" : undefined}
          style={inputStyle(touched.phone && errors.phone)}
        />
        <div style={{ minHeight: 18, marginTop: 4 }}>
          {touched.phone && errors.phone ? (
            <span id="address-phone-error" role="alert" style={{ fontSize: 11, color: "#9C4A4A" }}>
              {errors.phone}
            </span>
          ) : (
            <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>
              Formato: {country.dialCode} + {country.phoneDigits} dígitos.
            </span>
          )}
        </div>
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

      <div style={{ marginTop: 14 }}>
        <label htmlFor="address-stateProvince" className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
          Departamento / estado
        </label>
        <input
          id="address-stateProvince"
          value={stateProvince}
          onChange={handleStateProvinceChange}
          onBlur={handleStateProvinceBlur}
          type="text"
          placeholder="Tu departamento o estado"
          autoComplete="address-level1"
          aria-describedby={touched.stateProvince && errors.stateProvince ? "address-stateProvince-error" : undefined}
          aria-invalid={touched.stateProvince && errors.stateProvince ? "true" : undefined}
          style={inputStyle(touched.stateProvince && errors.stateProvince)}
        />
        <div style={{ minHeight: 18, marginTop: 4 }}>
          {touched.stateProvince && errors.stateProvince && (
            <span id="address-stateProvince-error" role="alert" style={{ fontSize: 11, color: "#9C4A4A" }}>
              {errors.stateProvince}
            </span>
          )}
        </div>
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
