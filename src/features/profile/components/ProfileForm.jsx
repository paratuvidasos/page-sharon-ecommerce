import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { PhoneField } from "./PhoneField";
import { PhotoField } from "./PhotoField";
import { COUNTRIES } from "@shared/data/countries";

const FIELD_LABELS = { name: "Nombre completo", phone: "Teléfono" };

function validateName(value) {
  if (!value.trim()) return "Necesitamos tu nombre.";
  if (value.trim().length < 2) return "Cuéntanos tu nombre completo.";
  return "";
}

function validatePhone(value, countryCode) {
  const country = COUNTRIES.find((c) => c.code === countryCode) || COUNTRIES[0];
  if (!value) return "Ingresa tu número de teléfono.";
  if (value.length !== country.phoneDigits) return `Debe tener ${country.phoneDigits} dígitos para ${country.name}.`;
  return "";
}

async function updateProfile(data) {
  // No hay backend todavía: simula el guardado del perfil. La foto en producción se subiría
  // a un storage y se guardaría la URL resultante, no el object URL local que usamos aquí.
  // Reemplazar por la API real cuando exista.
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { ok: true };
}

// Formulario de edición de perfil: nombre, foto (con preview) y teléfono con
// selector de país, autocontenido igual que los formularios de auth (validación
// + submit() imperativo). El correo se muestra de solo lectura: cambiarlo requiere
// reverificación, un flujo que todavía no existe.
export const ProfileForm = forwardRef(({ initialValues }, ref) => {
  const [name, setName] = useState(initialValues.name || "");
  const [countryCode, setCountryCode] = useState(initialValues.countryCode || COUNTRIES[0].code);
  const [phone, setPhone] = useState(initialValues.phone || "");
  const [avatarUrl, setAvatarUrl] = useState(initialValues.avatarUrl || null);
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

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setErrors((prev) => (touched.name ? { ...prev, name: validateName(value) } : prev));
  };
  const handleNameBlur = () => {
    setTouched((prev) => ({ ...prev, name: true }));
    setErrors((prev) => ({ ...prev, name: validateName(name) }));
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
        name: validateName(name),
        phone: validatePhone(phone, countryCode),
      };
      setErrors(nextErrors);
      setTouched({ name: true, phone: true });

      const hasErrors = Object.values(nextErrors).some(Boolean) || Boolean(photoError);
      if (hasErrors) {
        setShowSummary(true);
        setSummaryToken((t) => t + 1);
        return { ok: false };
      }

      setShowSummary(false);
      setServerError("");
      try {
        await updateProfile({ name, countryCode, phone, avatarUrl });
        return { ok: true, profile: { name: name.trim(), countryCode, phone, avatarUrl } };
      } catch {
        setServerError("No pudimos guardar tus cambios. Intenta de nuevo en unos segundos.");
        return { ok: false };
      }
    },
  }));

  const initials = (name.trim()[0] || initialValues.email?.[0] || "?").toUpperCase();

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
        onChange={setAvatarUrl}
        error={photoError}
        onErrorChange={setPhotoError}
        initials={initials}
      />

      <div style={{ marginTop: 20 }}>
        <label htmlFor="profile-name" className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 6 }}>
          Nombre completo
        </label>
        <input
          id="profile-name"
          value={name}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          type="text"
          placeholder="Tu nombre completo"
          autoComplete="name"
          aria-describedby={touched.name && errors.name ? "profile-name-error" : undefined}
          aria-invalid={touched.name && errors.name ? "true" : undefined}
          style={{
            width: "100%",
            padding: "14px 18px",
            border: `.5px solid ${touched.name && errors.name ? "#9C4A4A" : "var(--line)"}`,
            borderRadius: 999,
            background: "#fff",
            fontSize: 14,
            fontFamily: "var(--sans)",
            outline: 0,
          }}
        />
        <div style={{ minHeight: 18, marginTop: 4 }}>
          {touched.name && errors.name && (
            <span id="profile-name-error" role="alert" style={{ fontSize: 11, color: "#9C4A4A" }}>
              {errors.name}
            </span>
          )}
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
