import { forwardRef, useEffect } from "react";

// Duración (ms) de la transición "normal" del panel — usar para sincronizar
// timeouts externos (ej. limpiar un formulario después de que termina la animación de cierre).
export const MODAL_CLOSE_MS = 350;

const SPEEDS = {
  normal: { opacity: ".3s ease", transform: ".35s cubic-bezier(.2,.7,.2,1)" },
  fast: { opacity: ".2s ease", transform: ".25s cubic-bezier(.2,.7,.2,1)" },
};

// Primitiva compartida para overlay + panel centrado con la animación ya
// establecida en el resto de la app (opacity/pointerEvents + transform según `open`).
// Solo encapsula la mecánica de apertura/cierre — el fondo, radio, sombra, padding
// y layout interno del panel se definen por consumidor vía `panelStyle`.
//
// `variant="sheet"` es la variante para móvil (bottom sheet): el panel se ancla
// abajo del viewport, ocupa el ancho completo y entra/sale con translateY en vez de
// escalar desde el centro. Se usa junto a `width`/`panelStyle` igual que "center" —
// el consumidor sigue controlando radio/padding/max-height del panel.
//
// No absorbe devolución de foco al cerrar (eso depende del motivo del cierre y
// queda a criterio de cada consumidor). Sí soporta enfocar el panel al abrir:
// pasa un `ref` y actívalo tú mismo con un efecto, igual que antes.
export const Modal = forwardRef(
  (
    {
      open,
      onClose,
      zIndex,
      variant = "center", // "center" | "sheet"
      width = "min(560px, 92vw)",
      panelStyle = {},
      overlayStyle = {},
      closeOnOverlayClick = true,
      closeOnEscape = false,
      speed = "normal",
      labelledBy,
      ariaLabel,
      children,
    },
    ref
  ) => {
    const t = SPEEDS[speed] || SPEEDS.normal;
    const isSheet = variant === "sheet";

    useEffect(() => {
      if (!open || !closeOnEscape) return;
      const onKeyDown = (e) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }, [open, closeOnEscape, onClose]);

    return (
      <>
        <div
          onClick={closeOnOverlayClick ? onClose : undefined}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(27,24,21,.5)",
            opacity: open ? 1 : 0,
            pointerEvents: open ? "auto" : "none",
            transition: `opacity ${t.opacity}`,
            zIndex,
            backdropFilter: "blur(6px)",
            ...overlayStyle,
          }}
        />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          aria-label={labelledBy ? undefined : ariaLabel}
          tabIndex={-1}
          style={
            isSheet
              ? {
                  position: "fixed",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  width: "100%",
                  zIndex: zIndex + 1,
                  opacity: open ? 1 : 0,
                  pointerEvents: open ? "auto" : "none",
                  transform: `translateY(${open ? "0" : "100%"})`,
                  transition: `opacity ${t.opacity}, transform ${t.transform}`,
                  outline: "none",
                  ...panelStyle,
                }
              : {
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  width,
                  zIndex: zIndex + 1,
                  opacity: open ? 1 : 0,
                  pointerEvents: open ? "auto" : "none",
                  transform: `translate(-50%, -50%) ${open ? "scale(1)" : "scale(.96)"}`,
                  transition: `opacity ${t.opacity}, transform ${t.transform}`,
                  outline: "none",
                  ...panelStyle,
                }
          }
        >
          {children}
        </div>
      </>
    );
  }
);

Modal.displayName = "Modal";
