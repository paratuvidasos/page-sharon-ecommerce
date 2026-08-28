// Traduce un item crudo de GET /products (o /products/featured, /related, /search)
// a los nombres que ya usan carrito/checkout/wishlist (price, image, productId) —
// esos son conceptos del cliente, no un espejo del backend (ver CLAUDE.md: el
// carrito es estado local). Compartido entre Products y WishlistModal para no
// duplicar el mapeo.
export const normalizeProduct = (item) => ({
  id: item.id,
  productId: item.id,
  slug: item.slug,
  name: item.name,
  price: item.basePrice,
  oldPrice: item.compareAtPrice || null,
  image: item.thumbnailUrl,
  thumbnail: item.thumbnailUrl,
  stockStatus: item.stockStatus,
  ratingAverage: item.rating?.average ?? null,
  ratingCount: item.rating?.count ?? 0,
});
