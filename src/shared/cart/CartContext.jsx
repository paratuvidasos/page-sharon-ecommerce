import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  ApiError,
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon as applyCouponRequest,
  removeCoupon as removeCouponRequest,
  mergeCart,
} from "@shared/api-client";
import { useAuth } from "@shared/auth/AuthContext";

const EMPTY_CART = { items: [], subtotal: 0, couponCode: null, discount: 0, total: 0, couponInvalid: false };

const CartContext = createContext(null);

// Sin mensaje propio para errores que no son ApiError (ej. falla de red): los
// consumidores (ver CouponForm.jsx) ya tienen su propio fallback traducido vía
// `result.message || t("...genericError")` — devolver un string en español acá
// pisaría ese fallback y se colaría sin traducir.
function toResult(e) {
  if (e instanceof ApiError) {
    return { ok: false, code: e.code, message: e.message, availableQuantity: e.availableQuantity };
  }
  return { ok: false };
}

// El carrito de invitado viaja solo por la cookie httpOnly guest_cart_id (el
// backend la emite/lee solo, `request()` ya manda credentials:"include" siempre).
// Se espera a que AuthContext resuelva el refresh-token silencioso (status !==
// "loading") antes de pedir el carrito, para no traer el carrito de invitado por
// error en un reload donde el usuario en realidad sigue logueado.
export function CartProvider({ children }) {
  const { getAccessToken, status } = useAuth();
  const [cart, setCart] = useState(EMPTY_CART);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    let cancelled = false;
    setLoading(true);
    getCart(getAccessToken())
      .then((next) => {
        if (!cancelled) setCart(next);
      })
      .catch(() => {
        if (!cancelled) setCart(EMPTY_CART);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [status, getAccessToken]);

  const addItem = useCallback(
    async (variantId, quantity = 1) => {
      try {
        const next = await addCartItem({ variantId, quantity }, getAccessToken());
        setCart(next);
        return { ok: true };
      } catch (e) {
        return toResult(e);
      }
    },
    [getAccessToken]
  );

  const updateItem = useCallback(
    async (itemId, quantity) => {
      try {
        const next = await updateCartItem(itemId, { quantity }, getAccessToken());
        setCart(next);
        return { ok: true };
      } catch (e) {
        return toResult(e);
      }
    },
    [getAccessToken]
  );

  const removeItem = useCallback(
    async (itemId) => {
      try {
        const next = await removeCartItem(itemId, getAccessToken());
        setCart(next);
        return { ok: true };
      } catch (e) {
        return toResult(e);
      }
    },
    [getAccessToken]
  );

  const clear = useCallback(async () => {
    try {
      const next = await clearCart(getAccessToken());
      setCart(next);
      return { ok: true };
    } catch (e) {
      return toResult(e);
    }
  }, [getAccessToken]);

  const applyCoupon = useCallback(
    async (code) => {
      try {
        const next = await applyCouponRequest(code, getAccessToken());
        setCart(next);
        return { ok: true };
      } catch (e) {
        return toResult(e);
      }
    },
    [getAccessToken]
  );

  const removeCoupon = useCallback(async () => {
    try {
      const next = await removeCouponRequest(getAccessToken());
      setCart(next);
      return { ok: true };
    } catch (e) {
      return toResult(e);
    }
  }, [getAccessToken]);

  // Recarga el carrito contra el backend sin mutarlo (a diferencia de add/update/remove,
  // que ya devuelven el carrito actualizado). Se usa tras un error de checkout como
  // CHECKOUT_PRICE_CHANGED / CHECKOUT_ITEM_UNAVAILABLE, cuando lo que cambió fue el
  // catálogo (precio/stock) y no una acción del usuario sobre su propio carrito.
  const refreshCart = useCallback(async () => {
    try {
      const next = await getCart(getAccessToken());
      setCart(next);
      return { ok: true };
    } catch (e) {
      return toResult(e);
    }
  }, [getAccessToken]);

  const mergeGuestCart = useCallback(async (accessToken) => {
    try {
      const next = await mergeCart(accessToken);
      setCart(next);
    } catch {
      // Silencioso: si el merge falla, el carrito de la cuenta sigue siendo el
      // que ya trajo el GET /cart disparado por el cambio de status a authenticated.
    }
  }, []);

  const itemCount = cart.items.reduce((sum, it) => sum + it.quantity, 0);

  const value = {
    cart,
    loading,
    itemCount,
    addItem,
    updateItem,
    removeItem,
    clear,
    applyCoupon,
    removeCoupon,
    refreshCart,
    mergeGuestCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
