import { useTranslation } from "react-i18next";

export const AnnouncementBar = ({ show }) => {
  const { t } = useTranslation("home");
  if (!show) return null;
  return (
    <div style={{
      background: "var(--ink)", color: "var(--cream)",
      fontSize: 12, letterSpacing: ".08em", padding: "10px 16px",
      textAlign: "center", fontWeight: 400
    }}>
      <span style={{ color: "var(--gold-soft)" }}>✦</span>{" "}
      {t("announcementBar.message")}{" "}
      <a href="#" style={{ textDecoration: "underline", textUnderlineOffset: 3 }}>{t("announcementBar.cta")}</a>
    </div>
  );
};
