import { useEffect, useRef, useState } from "react";
import { Icon } from "@ui/Icon";
import { useAuth } from "@shared/auth/AuthContext";
import {
  listAdminCategories,
  createProduct,
  updateProduct,
  createProductVariant,
  deleteProductVariant,
  uploadProductImages,
} from "@shared/api-client";

const fieldStyle = { width: "100%", boxSizing: "border-box", padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 12, background: "#fff", fontSize: 14, fontFamily: "var(--sans)" };
const labelStyle = { fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 700, display: "block", marginBottom: 6 };

const Field = ({ label, children }) => (
  <div>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

// slug/SKU se generan solos (no se le piden al admin — ver el pedido al backend para
// que los genere del lado del servidor; mientras tanto se arman acá como relleno).
const slugify = (s) =>
  s.toLowerCase().trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const generateSku = () => `SKU-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

// Preview local antes de que exista un id de producto. Iba por URL.createObjectURL,
// pero un blob: URL puede quedar bloqueado por la CSP/sandbox del entorno donde se
// prueba (el <img> falla en silencio: no hay error visible, solo el cuadro vacío de
// fondo, que se confunde con "no pasó nada") — data: URI vía FileReader no depende de
// blob: y no necesita revocarse a mano.
const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error || new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });

const emptyDetails = (p) => ({
  name: p?.name || "",
  description: p?.description || "",
  brand: p?.brand || "",
  categoryId: p?.categoryId || p?.category?.id || "",
  basePrice: p?.basePrice != null ? String(p.basePrice) : "",
});

const emptyVariant = () => ({ size: "", scent: "", color: "", priceOverride: "", stockQuantity: "" });

// Crea/edita un producto contra POST|PATCH /admin/products. `parcel` (dimensiones de
// envío por variante) no tiene shape definido en la especificación del backend — se
// omite del formulario en vez de adivinarlo. La creación exige >=1 variante en el
// mismo POST; editar variantes (PATCH, sin stock — eso vive en Inventario) y subir
// imágenes (multipart) solo están disponibles una vez existe un id real de producto,
// así que en modo "crear" esas secciones aparecen recién después del primer submit.
export const AdminProductForm = ({ product, onClose, onSaved }) => {
  const { getAccessToken } = useAuth();
  const [categories, setCategories] = useState([]);
  const [details, setDetails] = useState(emptyDetails(product));
  const [newVariant, setNewVariant] = useState(emptyVariant());
  const [variants, setVariants] = useState(product?.variants || []);
  const [savedId, setSavedId] = useState(product?.id || null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState(product?.images || []);
  // Antes de que exista un id de producto no se puede subir nada todavía (POST
  // /admin/products/:id/images necesita el id) — las imágenes elegidas en "Nuevo
  // producto" se guardan acá como preview local y se suben recién cuando se crea el
  // producto, en el mismo submit, para que el admin no tenga que hacerlo en dos pasos.
  const [pendingImages, setPendingImages] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    listAdminCategories({ limit: 100 }, getAccessToken())
      .then((res) => setCategories(res.items))
      .catch(() => setCategories([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitDetails = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: details.name.trim(),
        slug: slugify(details.name),
        description: details.description.trim(),
        brand: details.brand.trim() || undefined,
        categoryId: details.categoryId,
        basePrice: Number(details.basePrice),
      };
      if (savedId) {
        const updated = await updateProduct(savedId, payload, getAccessToken());
        onSaved(updated);
      } else {
        if (!newVariant.stockQuantity) {
          setError("Indica el stock inicial.");
          setSaving(false);
          return;
        }
        payload.variants = [{
          sku: generateSku(),
          size: newVariant.size.trim() || undefined,
          scent: newVariant.scent.trim() || undefined,
          color: newVariant.color.trim() || undefined,
          priceOverride: newVariant.priceOverride ? Number(newVariant.priceOverride) : undefined,
          stockQuantity: Number(newVariant.stockQuantity),
        }];
        const created = await createProduct(payload, getAccessToken());
        setSavedId(created.id);
        onSaved(created);
        if (pendingImages.length > 0) {
          setUploading(true);
          try {
            const res = await uploadProductImages(created.id, pendingImages.map((p) => p.file), getAccessToken());
            setImages(res.images);
            setPendingImages([]);
          } catch {
            setError("El producto se creó, pero no se pudieron subir las imágenes. Puedes reintentarlo abajo.");
          } finally {
            setUploading(false);
          }
        }
      }
    } catch (err) {
      setError(err?.message || "No se pudo guardar el producto.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    if (!savedId) {
      // Todavía no hay id de producto: solo se guarda la preview, la subida real pasa
      // en submitDetails() apenas se crea el producto. Nunca en silencio: si falla la
      // lectura del archivo (FileReader), se avisa con setError en vez de no hacer nada.
      try {
        const newPending = await Promise.all(
          [...files].map(async (file) => ({ file, previewUrl: await readAsDataUrl(file) }))
        );
        setPendingImages((prev) => [...prev, ...newPending]);
      } catch (err) {
        setError(err?.message || "No se pudo generar la vista previa de la imagen.");
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const res = await uploadProductImages(savedId, files, getAccessToken());
      setImages(res.images);
    } catch (err) {
      setError(err?.message || "No se pudieron subir las imágenes.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removePendingImage = (previewUrl) => {
    setPendingImages((prev) => prev.filter((p) => p.previewUrl !== previewUrl));
  };

  // No hay endpoint de borrado individual de imagen — se manda el arreglo completo
  // sin esa URL a PATCH /admin/products/:id, como indica el backend.
  const removeUploadedImage = async (url) => {
    const prev = images;
    const next = images.filter((u) => u !== url);
    setImages(next);
    try {
      await updateProduct(savedId, { images: next }, getAccessToken());
    } catch (err) {
      setImages(prev);
      setError(err?.message || "No se pudo quitar la imagen.");
    }
  };

  const addVariant = async () => {
    if (!savedId || !newVariant.stockQuantity) return;
    try {
      const created = await createProductVariant(savedId, {
        sku: generateSku(),
        size: newVariant.size.trim() || undefined,
        scent: newVariant.scent.trim() || undefined,
        color: newVariant.color.trim() || undefined,
        priceOverride: newVariant.priceOverride ? Number(newVariant.priceOverride) : undefined,
        stockQuantity: Number(newVariant.stockQuantity),
      }, getAccessToken());
      setVariants((vs) => [...vs, { ...newVariant, id: created.id, sku: created.sku }]);
      setNewVariant(emptyVariant());
    } catch {
      setError("No se pudo crear la variante.");
    }
  };

  const removeVariant = async (variantId) => {
    if (variants.length <= 1) {
      setError("No se puede eliminar la última variante del producto.");
      return;
    }
    const prev = variants;
    setVariants((vs) => vs.filter((v) => v.id !== variantId));
    try {
      await deleteProductVariant(savedId, variantId, getAccessToken());
    } catch {
      setVariants(prev);
      setError("No se pudo eliminar la variante.");
    }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(27,24,21,.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 560, maxHeight: "88vh", overflowY: "auto", background: "var(--cream)", borderRadius: 24, padding: 32, boxShadow: "var(--shadow-lg)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div className="display" style={{ fontSize: 24 }}>{savedId ? "Editar producto" : "Nuevo producto"}</div>
          <button onClick={onClose} className="foc" style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--cream-2)", border: 0, cursor: "pointer", display: "grid", placeItems: "center" }}>
            <Icon name="close" size={13} />
          </button>
        </div>

        <form onSubmit={submitDetails} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Nombre">
            <input value={details.name} onChange={(e) => setDetails((d) => ({ ...d, name: e.target.value }))} placeholder="Shampoo Anticaída 300ml" style={fieldStyle} required />
          </Field>
          <Field label="Categoría">
            <select value={details.categoryId} onChange={(e) => setDetails((d) => ({ ...d, categoryId: e.target.value }))} style={fieldStyle} required>
              <option value="">Selecciona…</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </Field>
          <Field label="Descripción">
            <textarea value={details.description} onChange={(e) => setDetails((d) => ({ ...d, description: e.target.value }))} rows={3} style={{ ...fieldStyle, resize: "vertical", fontFamily: "var(--sans)" }} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Marca">
              <input value={details.brand} onChange={(e) => setDetails((d) => ({ ...d, brand: e.target.value }))} placeholder="Sharon" style={fieldStyle} />
            </Field>
            <Field label="Precio">
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--ink-soft)", fontSize: 14, pointerEvents: "none" }}>$</span>
                <input value={details.basePrice} onChange={(e) => setDetails((d) => ({ ...d, basePrice: e.target.value }))} type="number" min="0" placeholder="49900" style={{ ...fieldStyle, paddingLeft: 26 }} required />
              </div>
            </Field>
          </div>

          {!savedId && (
            <Field label="Imágenes">
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: pendingImages.length ? 10 : 0 }}>
                {pendingImages.map((p) => (
                  <div key={p.previewUrl} style={{ position: "relative", width: 56, height: 56, borderRadius: 10, overflow: "hidden", background: "var(--cream-2)" }}>
                    <img src={p.previewUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button type="button" onClick={() => removePendingImage(p.previewUrl)} aria-label="Quitar imagen" style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", background: "rgba(27,24,21,.75)", border: 0, color: "#fff", cursor: "pointer", display: "grid", placeItems: "center", padding: 0 }}>
                      <Icon name="close" size={9} color="#fff" />
                    </button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="foc" style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid var(--line)", borderRadius: 999, padding: "10px 16px", background: "#fff", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
                <Icon name="image" size={14} />
                Agregar imágenes
              </button>
              <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleUpload} style={{ display: "none" }} />
            </Field>
          )}

          {!savedId && (
            <div style={{ border: "1px dashed var(--line)", borderRadius: 14, padding: 16 }}>
              <div className="eyebrow" style={{ fontSize: 10, marginBottom: 12 }}>Presentación</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <Field label="Stock">
                  <input value={newVariant.stockQuantity} onChange={(e) => setNewVariant((v) => ({ ...v, stockQuantity: e.target.value }))} placeholder="20" type="number" min="0" style={fieldStyle} />
                </Field>
                <Field label="Tamaño (opcional)">
                  <input value={newVariant.size} onChange={(e) => setNewVariant((v) => ({ ...v, size: e.target.value }))} placeholder="300ml" style={fieldStyle} />
                </Field>
                <Field label="Aroma (opcional)">
                  <input value={newVariant.scent} onChange={(e) => setNewVariant((v) => ({ ...v, scent: e.target.value }))} placeholder="Lavanda" style={fieldStyle} />
                </Field>
                <Field label="Color (opcional)">
                  <input value={newVariant.color} onChange={(e) => setNewVariant((v) => ({ ...v, color: e.target.value }))} style={fieldStyle} />
                </Field>
              </div>
            </div>
          )}

          {error && <div style={{ fontSize: 12.5, color: "var(--terracotta-deep)" }}>{error}</div>}

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={saving} className="foc" style={{ flex: 1, border: 0, borderRadius: 999, padding: 14, background: "var(--ink)", color: "var(--cream)", fontSize: 13.5, fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>
              {saving ? "Guardando…" : savedId ? "Guardar cambios" : "Crear producto"}
            </button>
            {!savedId && (
              <button type="button" onClick={onClose} className="foc" style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "14px 20px", background: "transparent", color: "var(--ink)", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
            )}
          </div>
        </form>

        {savedId && (
          <>
            <div className="stitch" style={{ margin: "24px 0" }} />

            <div className="eyebrow" style={{ fontSize: 10, marginBottom: 10 }}>Imágenes</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              {images.map((url, i) => (
                <div key={i} style={{ position: "relative", width: 56, height: 56, borderRadius: 10, overflow: "hidden", background: "var(--cream-2)" }}>
                  <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button type="button" onClick={() => removeUploadedImage(url)} aria-label="Quitar imagen" style={{ position: "absolute", top: 2, right: 2, width: 18, height: 18, borderRadius: "50%", background: "rgba(27,24,21,.75)", border: 0, color: "#fff", cursor: "pointer", display: "grid", placeItems: "center", padding: 0 }}>
                    <Icon name="close" size={9} color="#fff" />
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="foc" style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid var(--line)", borderRadius: 999, padding: "10px 16px", background: "#fff", fontSize: 12.5, fontWeight: 600, cursor: uploading ? "wait" : "pointer" }}>
              <Icon name="image" size={14} />
              {uploading ? "Subiendo…" : "Subir imágenes"}
            </button>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleUpload} style={{ display: "none" }} />

            <div className="stitch" style={{ margin: "24px 0" }} />

            <div className="eyebrow" style={{ fontSize: 10, marginBottom: 10 }}>Presentaciones</div>
            {variants.map((v) => (
              <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px dashed rgba(27,24,21,.16)" }}>
                <span style={{ fontSize: 13 }}>{[v.size, v.color, v.scent].filter(Boolean).join(" · ") || "Presentación única"}</span>
                <button type="button" onClick={() => removeVariant(v.id)} className="foc" style={{ background: "none", border: 0, cursor: "pointer" }}>
                  <Icon name="trash" size={14} color="var(--terracotta-deep)" />
                </button>
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
              <input value={newVariant.size} onChange={(e) => setNewVariant((v) => ({ ...v, size: e.target.value }))} placeholder="Tamaño (opcional)" style={fieldStyle} />
              <input value={newVariant.stockQuantity} onChange={(e) => setNewVariant((v) => ({ ...v, stockQuantity: e.target.value }))} placeholder="Stock" type="number" min="0" style={fieldStyle} />
            </div>
            <button type="button" onClick={addVariant} className="foc" style={{ marginTop: 10, border: "1px solid var(--line)", borderRadius: 999, padding: "9px 16px", background: "#fff", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
              + Agregar otra presentación
            </button>
          </>
        )}
      </div>
    </div>
  );
};
