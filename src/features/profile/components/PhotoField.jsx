import { useRef } from "react";
import { Icon } from "@ui/Icon";

const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function validatePhotoFile(file) {
  if (!file.type.startsWith("image/")) return "Sube un archivo de imagen (JPG, PNG o WEBP).";
  if (file.size > MAX_SIZE_BYTES) return "La imagen no puede pesar más de 5MB.";
  return "";
}

// Selector de foto de perfil con previsualización inmediata (object URL local
// mientras no se guarde). El padre es dueño del valor (preview url o null) y del
// error; onChange recibe { file, previewUrl } — file es el File original a mandar
// como parte del FormData al guardar (null si no se cambió o se quitó la foto).
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
    onChange({ file, previewUrl: URL.createObjectURL(file) });
  };

  const handleRemove = () => {
    if (value) URL.revokeObjectURL(value);
    onChange({ file: null, previewUrl: null });
    onErrorChange("");
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "var(--cream-2)",
          borderRadius: 16,
          padding: 16,
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: "50%",
              overflow: "hidden",
              background: "var(--botanic-muted)",
              display: "grid",
              placeItems: "center",
            }}
          >
            {value ? (
              <img
                src={value}
                alt="Previsualización de tu foto de perfil"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontFamily: "var(--serif)", fontSize: 22, color: "var(--botanic-deep)" }}>
                {initials}
              </span>
            )}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: "var(--terracotta)",
              border: "2px solid var(--cream-2)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Icon name="camera" size={11} color="#fff" />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span className="eyebrow" style={{ fontSize: 10 }}>Foto de perfil</span>
          <div style={{ display: "flex", gap: 14 }}>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              style={{
                background: "none",
                border: 0,
                padding: 0,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--terracotta-deep)",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              {value ? "Cambiar foto" : "Subir foto"}
            </button>
            {value && (
              <button
                type="button"
                onClick={handleRemove}
                style={{
                  background: "none",
                  border: 0,
                  padding: 0,
                  fontSize: 13,
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
