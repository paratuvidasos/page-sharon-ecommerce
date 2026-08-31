import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "./Icon";
import { IconButton } from "./components/IconButton";
import { Z } from "./zIndex";
import { useLocalization } from "@shared/i18n/LocalizationContext";

const LOCALE_LABELS = { es: "Español", en: "English" };

// Dropdown de idioma/moneda en Nav, mismo patrón de click-outside que AccountMenu
// (no es un <Modal>: es un panel chico anclado al ícono, no algo que necesite
// overlay ni bloquear el resto de la página). Cambiar cualquiera de los dos
// selects dispara un reload completo (ver LocalizationContext.applyPreferences),
// así que el panel se deshabilita mientras "pending" para no disparar dos cambios
// a la vez.
export const LocalizationSwitcher = ({ triggerStyle }) => {
  const { t } = useTranslation("nav");
  const { locale, currency, locales, currencies, setLocale, setCurrency } = useLocalization();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  if (!locales.length || !currencies.length) return null;

  const handleLocaleChange = (e) => {
    setPending(true);
    setLocale(e.target.value).catch(() => setPending(false));
  };

  const handleCurrencyChange = (e) => {
    setPending(true);
    setCurrency(e.target.value).catch(() => setPending(false));
  };

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <IconButton
        icon="globe"
        iconSize={18}
        onClick={() => setOpen((v) => !v)}
        aria-label={t("localization.trigger")}
        aria-expanded={open}
        style={triggerStyle}
      />

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 10px)",
            right: 0,
            width: 200,
            background: "#fff",
            borderRadius: 16,
            border: ".5px solid var(--line)",
            boxShadow: "var(--shadow-lg)",
            padding: 14,
            zIndex: Z.localizationSwitcher,
            display: "grid",
            gap: 12,
          }}
        >
          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--ink-soft)" }}>
              {t("localization.language")}
            </span>
            <select
              value={locale}
              onChange={handleLocaleChange}
              disabled={pending}
              style={selectStyle}
            >
              {locales.map((l) => (
                <option key={l.code} value={l.code}>
                  {LOCALE_LABELS[l.code] || l.code}
                </option>
              ))}
            </select>
          </label>

          <label style={{ display: "grid", gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: ".04em", textTransform: "uppercase", color: "var(--ink-soft)" }}>
              {t("localization.currency")}
            </span>
            <select
              value={currency}
              onChange={handleCurrencyChange}
              disabled={pending}
              style={selectStyle}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
};

const selectStyle = {
  fontFamily: "var(--sans)",
  fontSize: 13,
  fontWeight: 500,
  color: "var(--ink)",
  padding: "8px 10px",
  borderRadius: 10,
  border: ".5px solid var(--line)",
  background: "var(--cream-2)",
};
