import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { PhoneField } from "./PhoneField";
import { PhotoField } from "./PhotoField";
import { COUNTRIES } from "@shared/data/countries";
import { updateProfile as updateProfileRequest, ApiError } from "@shared/api-client";
import { useAuth } from "@shared/auth/AuthContext";

const FIELD_LABELS = { firstName: "Nombre", lastName: "Apellido", phone: "Teléfono" };

function splitName(fullName) {
  const trimmed = (fullName || "").trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const [firstName, ...rest] = trimmed.split(/\s+/);
  return { firstName, lastName: rest.join(" ") };
}

function validateFirstName(value) {
  if (!value.trim()) return "Necesitamos tu nombre.";
  return "";
}

function validateLastName(value) {
  if (!value.trim()) return "Necesitamos tu apellido.";
  return "";
}

function validatePhone(value, countryCode) {
  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
  if (!value) return "Ingresa tu número de teléfono.";
  if (value.length !== country.phoneDigits) return `Debe tener ${country.phoneDigits} dígitos para ${country.name}.`;
  return "";
}

// El backend devuelve el teléfono normalizado en E.164 (ej. "+573001234567"); la UI
// solo maneja dígitos nacionales + el selector de país, así que hay que despojar el
// dial code de vuelta antes de guardarlo en el estado local.
function stripDialCode(e164Phone, countryCode) {
  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
  return e164Phone?.startsWith(country.dialCode) ? e164Phone.slice(country.dialCode.length) : e164Phone || "";
}

// Formulario de edición de perfil: nombre, apellido, foto (con preview) y teléfono
// con selector de país, autocontenido igual que los formularios de auth (validación
// + submit() imperativo). El correo se muestra de solo lectura: cambiarlo requiere
// reverificación, un flujo que todavía no existe.
export const ProfileForm = forwardRef(({ initialValues }, ref) => {
  const { getAccessToken } = useAuth();
  const initialSplitName = splitName(initialValues.name);
  const [firstName, setFirstName] = useState(initialSplitName.firstName);
  const [lastName, setLastName] = useState(initialSplitName.lastName);
  const [countryCode, setCountryCode] = useState(initialValues.countryCode || COUNTRIES[0].code);
  const [phone, setPhone] = useState(initialValues.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(initialValues.avatarUrl || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [photoError, setPhotoError] = useState("");

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

  const handleFirstNameChange = (e) => {
    const value = e.target.value;
    setFirstName(value);
    setErrors((prev) => (touched.firstName ? { ...prev, firstName: validateFirstName(value) } : prev));
  };
  const handleFirstNameBlur = () => {
    setTouched((prev) => ({ ...prev, firstName: true }));
    setErrors((prev) => ({ ...prev, firstName: validateFirstName(firstName) }));
  };

  const handleLastNameChange = (e) => {
    const value = e.target.value;
    setLastName(value);
    setErrors((prev) => (touched.lastName ? { ...prev, lastName: validateLastName(value) } : prev));
  };
  const handleLastNameBlur = () => {
    setTouched((prev) => ({ ...prev, lastName: true }));
    setErrors((prev) => ({ ...prev, lastName: validateLastName(lastName) }));
  };

  const handlePhotoChange = ({ file, previewUrl }) => {
    setAvatarFile(file);
    setAvatarUrl(previewUrl);
  };

  const handleCountryChange = (nextCode) => {
    setCountryCode(nextCode);
    // El formato de dígitos cambia con el país: mejor limpiar que dejar un número a medias.
    setPhone("");
    setErrors((prev) => ({ ...prev, phone: undefined }));
  };
  const handlePhoneChange = (value) => {
    setPhone(value);
    setErrors((prev) => (touched.phone ? { ...prev, phone: validatePhone(value, countryCode) } : prev));
  };
  const handlePhoneBlur = () => {
    setTouched((prev) => ({ ...prev, phone: true }));
    setErrors((prev) => ({ ...prev, phone: validatePhone(phone, countryCode) }));
  };

  const invalidFields = Object.entries(errors)
    .filter(([, msg]) => msg)
    .map(([field]) => field);

  useImperativeHandle(ref, () => ({
    submit: async () => {
      const nextErrors = {
        firstName: validateFirstName(firstName),
        lastName: validateLastName(lastName),
        phone: validatePhone(phone, countryCode),
      };
      setErrors(nextErrors);
      setTouched({ firstName: true, lastName: true, phone: true });

      const hasErrors = Object.values(nextErrors).some(Boolean) || Boolean(photoError);
      if (hasErrors) {
        setShowSummary(true);
        setSummaryToken((t) => t + 1);
        return { ok: false };
      }

      setShowSummary(false);
      setServerError("");
      try {
        const apiUser = await updateProfileRequest({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone,
          phoneCountryCode: countryCode,
          avatarFile,
          accessToken: getAccessToken(),
        });
        return {
          ok: true,
          profile: {
            name: `${apiUser.firstName} ${apiUser.lastName}`,
            countryCode,
            phone: stripDialCode(apiUser.phone, countryCode),
            avatarUrl: apiUser.avatarUrl,
          },
        };
      } catch (e) {
        if (e instanceof ApiError && e.message) {
          setServerError(e.message);
        } else {
          setServerError("No pudimos guardar tus cambios. Intenta de nuevo en unos segundos.");
        }
        return { ok: false };
      }
    },
  }));

  const initials = (firstName.trim()[0] || initialValues.email?.[0] || "?").toUpperCase();

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
                <a href={`#profile-${field}`} style={{ textDecoration: "underline" }}>
                  {FIELD_LABELS[field]}: {errors[field]}
                </a>
              </li>
            ))}
            {photoError && <li style={{ fontSize: 12.5, color: "#7A3535" }}>Foto de perfil: {photoError}</li>}
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

      <PhotoField
        value={avatarUrl}
        onChange={handlePhotoChange}
        error={photoError}
        onErrorChange={setPhotoError}
        initials={initials}
      />

      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label htmlFor="profile-firstName" className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
            Nombre
          </label>
          <input
            id="profile-firstName"
            value={firstName}
            onChange={handleFirstNameChange}
            onBlur={handleFirstNameBlur}
            type="text"
            placeholder="Tu nombre"
            autoComplete="given-name"
            aria-describedby={touched.firstName && errors.firstName ? "profile-firstName-error" : undefined}
            aria-invalid={touched.firstName && errors.firstName ? "true" : undefined}
            style={{
              width: "100%",
              padding: "14px 18px",
              border: `.5px solid ${touched.firstName && errors.firstName ? "#9C4A4A" : "var(--line)"}`,
              borderRadius: 999,
              background: "#fff",
              fontSize: 14,
              fontFamily: "var(--sans)",
              outline: 0,
            }}
          />
          <div style={{ minHeight: 18, marginTop: 4 }}>
            {touched.firstName && errors.firstName && (
              <span id="profile-firstName-error" role="alert" style={{ fontSize: 11, color: "#9C4A4A" }}>
                {errors.firstName}
              </span>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="profile-lastName" className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
            Apellido
          </label>
          <input
            id="profile-lastName"
            value={lastName}
            onChange={handleLastNameChange}
            onBlur={handleLastNameBlur}
            type="text"
            placeholder="Tu apellido"
            autoComplete="family-name"
            aria-describedby={touched.lastName && errors.lastName ? "profile-lastName-error" : undefined}
            aria-invalid={touched.lastName && errors.lastName ? "true" : undefined}
            style={{
              width: "100%",
              padding: "14px 18px",
              border: `.5px solid ${touched.lastName && errors.lastName ? "#9C4A4A" : "var(--line)"}`,
              borderRadius: 999,
              background: "#fff",
              fontSize: 14,
              fontFamily: "var(--sans)",
              outline: 0,
            }}
          />
          <div style={{ minHeight: 18, marginTop: 4 }}>
            {touched.lastName && errors.lastName && (
              <span id="profile-lastName-error" role="alert" style={{ fontSize: 11, color: "#9C4A4A" }}>
                {errors.lastName}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 14 }}>
        <PhoneField
          countryCode={countryCode}
          phone={phone}
          error={errors.phone}
          touched={touched.phone}
          onCountryChange={handleCountryChange}
          onPhoneChange={handlePhoneChange}
          onBlur={handlePhoneBlur}
        />
      </div>

      <div style={{ marginTop: 14 }}>
        <span className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
          Correo electrónico
        </span>
        <div
          style={{
            width: "100%",
            padding: "14px 18px",
            border: ".5px solid var(--line)",
            borderRadius: 999,
            background: "var(--cream-2)",
            fontSize: 14,
            color: "var(--ink-soft)",
            boxSizing: "border-box",
          }}
        >
          {initialValues.email}
        </div>
        <span style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 4, display: "block" }}>
          Para cambiar tu correo necesitas reverificarlo. Escríbenos a soporte para iniciar ese proceso.
        </span>
      </div>
    </div>
  );
});

ProfileForm.displayName = "ProfileForm";
