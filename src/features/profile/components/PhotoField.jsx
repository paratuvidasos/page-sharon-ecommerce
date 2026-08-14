import { useRef } from "react";
import { Icon } from "@ui/Icon";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function validatePhotoFile(file) {
  if (!file.type.startsWith("image/")) return "Sube un archivo de imagen (JPG, PNG o WEBP).";
  if (file.size > MAX_SIZE_BYTES) return "La imagen no puede pesar más de 5MB.";
  return "";
}

// Selector de foto de perfil con previsualización inmediata (object URL local —
// sin backend todavía no hay adónde subir el archivo). El padre es dueño del
// valor (url o null) y del error, para poder incluir ambos en la validación del formulario.
export const PhotoField = ({ value, onChange, error, onErrorChange, initials }) => {
  const inputRef = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const validationError = validatePhotoFile(file);
    if (validationError) {
      onErrorChange(validationError);
      return;
    }
    onErrorChange("");
    if (value) URL.revokeObjectURL(value);
    onChange(URL.createObjectURL(file));
  };

  const handleRemove = () => {
    if (value) URL.revokeObjectURL(value);
    onChange(null);
    onErrorChange("");
  };

  return (
    <div>
      <span className="eyebrow" style={{ fontSize: 10, display: "block", marginBottom: 8 }}>
        Foto de perfil
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            overflow: "hidden",
            background: "var(--botanic-muted)",
            display: "grid",
            placeItems: "center",
            flexShrink: 0,
          }}
        >
          {value ? (
            <img
              src={value}
              alt="Previsualización de tu foto de perfil"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <span style={{ fontFamily: "var(--serif)", fontSize: 26, color: "var(--botanic-deep)" }}>
              {initials}
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", gap: 14 }}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: 0,
                padding: 0,
                fontSize: 12.5,
                fontWeight: 500,
                color: "var(--ink)",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              <Icon name="camera" size={14} /> {value ? "Cambiar foto" : "Subir foto"}
            </button>
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                style={{
                  background: "none",
                  border: 0,
                  padding: 0,
                  fontSize: 12.5,
                  color: "var(--ink-soft)",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Quitar
              </button>
            )}
          </div>
          <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>JPG, PNG o WEBP. Máximo 5MB.</span>
        </div>
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />

      <div style={{ minHeight: 18, marginTop: 6 }}>
        {error && (
          <span role="alert" style={{ fontSize: 11, color: "#9C4A4A" }}>
            {error}
          </span>
        )}
      </div>
    </div>
  );
};
