import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon, Stars } from "@ui/Icon";
import { ProductImage } from "@ui/ProductImage";
import { IconButton } from "@ui/components/IconButton";
import { Modal } from "@ui/components/Modal";
import { Z } from "@ui/zIndex";
import { formatCurrency } from "@shared/i18n/currency";
import { getProduct } from "@shared/api-client";
import { useCart } from "@shared/cart/CartContext";
import { ProductRelated } from "./ProductRelated";
import { ProductReviews } from "./ProductReviews";

const variantLabel = (v) => [v.size, v.scent, v.color].filter(Boolean).join(" · ") || v.sku;

// [0014][BE] Detalle de producto por slug, abierto desde ProductCard (click en la
// tarjeta, fuera de los botones de favorito/añadir). [0015][BE] Selección de
// variante: vive sobre la misma respuesta de GET /products/:slug, sin otra llamada
// — cambiar de variante solo actualiza precio/stock/imagen mostrados localmente.
export const ProductDetailModal = ({ slug, onClose, onWish, wishlistIds, orders, onSlugChange, onViewCart }) => {
  const { t } = useTranslation("catalog");
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | error | not-found
  const [variantId, setVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addState, setAddState] = useState(null); // null | "adding" | {ok:true} | {ok:false,...}

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setStatus("loading");
    setProduct(null);
    setAddState(null);
    getProduct(slug)
      .then((data) => {
        if (cancelled) return;
        setProduct(data);
        setVariantId(data.variants?.[0]?.id ?? null);
        setStatus("ready");
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus(err?.status === 404 ? "not-found" : "error");
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Cambiar de variante resetea cantidad + cualquier mensaje de la variante anterior
  // (ej. un 409 de stock insuficiente que ya no aplica a la variante nueva).
  useEffect(() => {
    setQuantity(1);
    setAddState(null);
  }, [variantId]);

  const variant = product?.variants?.find((v) => v.id === variantId) || null;
  const price = variant?.price ?? product?.basePrice;
  const stockStatus = variant?.stockStatus;
  const outOfStock = stockStatus === "OUT_OF_STOCK";
  const image = variant?.imageUrl || product?.images?.[0] || null;
  const wished = product && wishlistIds?.has(product.id);
  const canReview = Boolean(
    product && orders?.some((o) => o.items?.some((it) => it.productId === product.id))
  );

  const handleAdd = async (qty = quantity) => {
    if (!variantId || outOfStock) return;
    setAddState("adding");
    const result = await addItem(variantId, qty);
    setAddState(result);
  };

  return (
    <Modal
      open={Boolean(slug)}
      onClose={onClose}
      zIndex={Z.productDetail}
      width="min(680px, 92vw)"
      labelledBy="product-detail-title"
      panelStyle={{
        maxHeight: "88vh",
        background: "var(--cream)",
        borderRadius: 24,
        boxShadow: "0 32px 80px rgba(27,24,21,.3)",
        border: ".5px solid var(--line)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "flex-end",
          padding: "18px 18px 0",
          flexShrink: 0,
        }}
      >
        <IconButton icon="close" size={38} iconSize={20} onClick={onClose} aria-label={t("detail.close")} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "0 30px 30px" }}>
        {status === "loading" && (
          <div style={{ textAlign: "center", padding: "60px 8px", color: "var(--ink-soft)" }}>
            <p style={{ fontSize: 13 }}>{t("detail.loading")}</p>
          </div>
        )}
        {status === "not-found" && (
          <div style={{ textAlign: "center", padding: "60px 8px", color: "var(--ink-soft)" }}>
            <p style={{ fontSize: 13 }}>{t("detail.notFound")}</p>
          </div>
        )}
        {status === "error" && (
          <div style={{ textAlign: "center", padding: "60px 8px", color: "var(--ink-soft)" }}>
            <p style={{ fontSize: 13 }}>{t("detail.error")}</p>
          </div>
        )}

        {status === "ready" && product && (
          <div className="product-detail-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 260px) 1fr", gap: 28 }}>
            <div style={{ position: "relative" }}>
              <ProductImage image={image} thumbnail={image} name={product.name} big />
              <IconButton
                icon="heart"
                size={36}
                iconSize={16}
                color={wished ? "var(--botanic-deep)" : "var(--ink-soft)"}
                onClick={() => onWish && onWish({ productId: product.id, slug: product.slug, name: product.name })}
                aria-label={t("detail.wishlist")}
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  background: "rgba(255,255,255,.85)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 2px 8px rgba(27,24,21,.06)",
                }}
              />
            </div>

            <div>
              {product.brand && <div className="eyebrow" style={{ fontSize: 10 }}>{product.brand}</div>}
              <h2 id="product-detail-title" className="display" style={{ fontSize: 30, margin: "6px 0 8px", fontWeight: 500 }}>
                {product.name}
              </h2>

              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                <Stars value={product.rating?.average ?? 0} />
                <span className="mono" style={{ color: "var(--ink-soft)" }}>
                  {product.rating?.average != null ? `${product.rating.average.toFixed(1)} · ${product.rating.count}` : t("detail.noReviews")}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 18 }}>
                <span className="display" style={{ fontSize: 28, fontWeight: 500 }}>{formatCurrency(price)}</span>
                {product.compareAtPrice && (
                  <span style={{ color: "var(--ink-soft)", fontSize: 14, textDecoration: "line-through" }}>
                    {formatCurrency(product.compareAtPrice)}
                  </span>
                )}
              </div>

              {product.description && (
                <p style={{ fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 18 }}>{product.description}</p>
              )}

              {product.variants?.length > 1 && (
                <div style={{ marginBottom: 18 }}>
                  <div className="eyebrow" style={{ fontSize: 10, marginBottom: 8 }}>{t("detail.chooseOption")}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setVariantId(v.id)}
                        disabled={v.stockStatus === "OUT_OF_STOCK"}
                        style={{
                          padding: "9px 14px",
                          borderRadius: 999,
                          fontSize: 12.5,
                          border: "1px solid " + (v.id === variantId ? "var(--ink)" : "var(--line)"),
                          background: v.id === variantId ? "var(--ink)" : "transparent",
                          color: v.stockStatus === "OUT_OF_STOCK" ? "var(--ink-soft)" : v.id === variantId ? "var(--cream)" : "var(--ink)",
                          opacity: v.stockStatus === "OUT_OF_STOCK" ? 0.5 : 1,
                          cursor: v.stockStatus === "OUT_OF_STOCK" ? "not-allowed" : "pointer",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {variantLabel(v)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {stockStatus && (
                <div style={{ fontSize: 12.5, color: outOfStock ? "var(--ink-soft)" : "var(--botanic-deep)", marginBottom: 18 }}>
                  {t(`detail.stock.${stockStatus}`, { defaultValue: stockStatus })}
                </div>
              )}

              {product.ingredients && (
                <div style={{ marginBottom: 18 }}>
                  <div className="eyebrow" style={{ fontSize: 10, marginBottom: 6 }}>{t("detail.ingredients")}</div>
                  <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.6 }}>{product.ingredients}</p>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid var(--line)", borderRadius: 999, padding: "4px" }}>
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={outOfStock}
                    style={{ width: 30, height: 30, borderRadius: 999, border: 0, background: "transparent", cursor: outOfStock ? "not-allowed" : "pointer", display: "grid", placeItems: "center" }}
                  >
                    <Icon name="minus" size={13} />
                  </button>
                  <span className="mono" style={{ minWidth: 20, textAlign: "center" }}>{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={outOfStock}
                    style={{ width: 30, height: 30, borderRadius: 999, border: 0, background: "transparent", cursor: outOfStock ? "not-allowed" : "pointer", display: "grid", placeItems: "center" }}
                  >
                    <Icon name="plus" size={13} />
                  </button>
                </div>

                <button
                  onClick={() => handleAdd()}
                  disabled={outOfStock || addState === "adding"}
                  style={{
                    border: 0,
                    cursor: outOfStock || addState === "adding" ? "not-allowed" : "pointer",
                    padding: "13px 22px",
                    borderRadius: 999,
                    background: outOfStock ? "var(--cream-2)" : "var(--ink)",
                    color: outOfStock ? "var(--ink-soft)" : "var(--cream)",
                    opacity: outOfStock || addState === "adding" ? 0.6 : 1,
                    fontSize: 13,
                    fontWeight: 500,
                    letterSpacing: ".04em",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Icon name="plus" size={15} />
                  {addState === "adding" ? t("detail.adding") : t("detail.addToBag")}
                </button>
              </div>

              {addState?.ok && (
                <div role="status" style={{ marginTop: 12, fontSize: 12.5, color: "var(--botanic-deep)" }}>
                  {t("detail.addedToBag")}{" "}
                  <button
                    type="button"
                    onClick={() => onViewCart && onViewCart()}
                    style={{ background: "none", border: 0, padding: 0, color: "inherit", textDecoration: "underline", cursor: "pointer", fontSize: "inherit" }}
                  >
                    {t("detail.viewBag")}
                  </button>
                </div>
              )}

              {addState && addState.ok === false && (
                <div role="alert" style={{ marginTop: 12, fontSize: 12.5, color: "#9C4A4A" }}>
                  {addState.code === "INSUFFICIENT_STOCK"
                    ? t("detail.onlyAvailable", { count: addState.availableQuantity })
                    : addState.message || t("detail.genericAddError")}
                  {addState.code === "INSUFFICIENT_STOCK" && addState.availableQuantity > 0 && (
                    <>
                      {" "}
                      <button
                        type="button"
                        onClick={() => {
                          setQuantity(addState.availableQuantity);
                          handleAdd(addState.availableQuantity);
                        }}
                        style={{ background: "none", border: 0, padding: 0, color: "inherit", textDecoration: "underline", cursor: "pointer", fontSize: "inherit" }}
                      >
                        {t("detail.addAvailable", { count: addState.availableQuantity })}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {status === "ready" && product && (
          <>
            <ProductReviews productId={product.id} canReview={canReview} />
            <ProductRelated
              slug={product.slug}
              onWish={onWish}
              wishlistIds={wishlistIds}
              onSelect={onSlugChange}
            />
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 640px){
          .product-detail-grid{grid-template-columns: 1fr !important}
        }
      `}</style>
    </Modal>
  );
};
