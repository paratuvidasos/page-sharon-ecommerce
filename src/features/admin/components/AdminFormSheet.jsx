import { useTranslation } from "react-i18next";
import { Icon } from "@ui/Icon";

// Shell compartido para los formularios de crear/editar del panel admin. Antes cada
// uno armaba a mano su propio overlay `position:fixed;inset:0` + tarjeta centrada — se
// ve bien en escritorio, pero una tarjeta centrada con maxHeight:88vh queda apretada
// en un celular y no tiene un patrón de "volver" claro. En escritorio este shell se ve
// igual que antes (tarjeta centrada, botón X). Bajo 720px pasa a ser un panel de
// pantalla completa con header de "atrás" + eyebrow/título apilados — mismo patrón
// que "Nuevo producto" en el mockup de Claude Design (Sharon Movil.dc.html).
//
// El botón/fila de acciones (Guardar/Cancelar) NO vive acá: cada consumidor sigue
// dueño de su propio `<form onSubmit>` y sus botones — solo hay que darle a esa fila
// `className="admin-sheet-actions"` para que el CSS de abajo la vuelva fija abajo en
// móvil (position:fixed), sin moverla de dónde ya vive en el árbol (evita duplicar
// inputs/refs de archivo, que solo pueden montarse una vez).
export const AdminFormSheet = ({ onClose, eyebrow, title, children, maxWidth = 560 }) => {
  const { t } = useTranslation("admin");
  return (
  <div className="admin-sheet-overlay" style={{ position: "fixed", inset: 0, background: "rgba(27,24,21,.4)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
    <div className="admin-sheet-panel" style={{ width: "100%", maxWidth, maxHeight: "88vh", background: "var(--cream)", borderRadius: 24, boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div className="admin-sheet-header" style={{ display: "flex", alignItems: "center", gap: 12, padding: "32px 32px 0", flexShrink: 0 }}>
        <button type="button" onClick={onClose} aria-label={t("formSheet.back")} className="admin-sheet-back foc" style={{ display: "none", width: 40, height: 40, borderRadius: 12, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", placeItems: "center", flexShrink: 0 }}>
          <Icon name="chev-l" size={16} />
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          {eyebrow && <div className="admin-sheet-eyebrow eyebrow" style={{ fontSize: 9, display: "none", marginBottom: 4 }}>{eyebrow}</div>}
          <div className="display" style={{ fontSize: 24 }}>{title}</div>
        </div>
        <button type="button" onClick={onClose} aria-label={t("formSheet.close")} className="admin-sheet-close foc" style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--cream-2)", border: 0, cursor: "pointer", display: "grid", placeItems: "center", flexShrink: 0 }}>
          <Icon name="close" size={13} />
        </button>
      </div>

      <div className="ns admin-sheet-body" style={{ flex: 1, overflowY: "auto", padding: "22px 32px 32px" }}>
        {children}
      </div>
    </div>

    <style>{`
      @media (max-width: 720px){
        .admin-sheet-overlay{padding: 0 !important}
        .admin-sheet-panel{max-width: 100% !important; width: 100% !important; height: 100% !important; max-height: 100% !important; border-radius: 0 !important}
        .admin-sheet-header{padding: calc(16px + env(safe-area-inset-top)) 20px 16px !important; border-bottom: 1px solid var(--line) !important}
        .admin-sheet-back{display: grid !important}
        .admin-sheet-close{display: none !important}
        .admin-sheet-eyebrow{display: block !important}
        .admin-sheet-body{padding: 18px 20px 110px !important}
        .admin-sheet-actions{
          position: fixed !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
          background: rgba(251,247,242,.97) !important; backdrop-filter: blur(18px);
          border-top: 1px solid var(--line); margin: 0 !important;
          padding: 14px 20px calc(14px + env(safe-area-inset-bottom)) !important;
        }
      }
    `}</style>
  </div>
  );
};
