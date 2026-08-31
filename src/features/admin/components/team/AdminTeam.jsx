import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@ui/Icon";
import { IconButton } from "@ui/components/IconButton";
import { useAuth } from "@shared/auth/AuthContext";
import { listEmployees, createEmployee, updateEmployee, deleteEmployee } from "@shared/api-client";
import { Pagination } from "../Pagination";
import { AdminFormSheet } from "../AdminFormSheet";

const STATUS_STYLE_META = {
  ACTIVE: { bg: "var(--botanic-muted)", color: "#3A4A34" },
  INACTIVE: { bg: "var(--cream-2)", color: "var(--ink-soft)" },
  SUSPENDED: { bg: "rgba(193,99,63,.14)", color: "var(--terracotta-deep)" },
  DELETED: { bg: "var(--cream-2)", color: "var(--ink-soft)" },
};

const ROLE_STYLE_META = {
  ADMIN: { bg: "rgba(74,111,165,.14)", color: "#2E4C73" },
  EMPLOYEE: { bg: "var(--cream-2)", color: "var(--ink-soft)" },
};

const filterStyle = { padding: "9px 12px", border: "1px solid var(--line)", borderRadius: 10, background: "#fff", fontSize: 12.5, fontFamily: "var(--sans)" };
const fieldStyle = { width: "100%", boxSizing: "border-box", padding: "12px 14px", border: "1px solid var(--line)", borderRadius: 12, background: "#fff", fontSize: 14, fontFamily: "var(--sans)" };
const labelStyle = { fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 700, display: "block", marginBottom: 6 };

const emptyForm = () => ({ id: null, firstName: "", lastName: "", email: "", password: "", role: "EMPLOYEE", jobTitle: "" });

export const AdminTeam = () => {
  const { t } = useTranslation("admin");
  const { getAccessToken } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [meta, setMeta] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const load = () => {
    setStatus("loading");
    listEmployees({ page, limit: 20, search: search || undefined }, getAccessToken())
      .then((res) => {
        setEmployees(res.items);
        setMeta(res.meta);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const openNew = () => { setForm(emptyForm()); setError(null); setPasswordVisible(false); setModalOpen(true); };
  const openEdit = (emp) => {
    setForm({ id: emp.id, firstName: emp.firstName, lastName: emp.lastName, email: emp.email, password: "", role: emp.role, jobTitle: emp.jobTitle || "" });
    setError(null);
    setPasswordVisible(false);
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError(t("team.form.requiredNameError"));
      return;
    }
    if (!form.id && (!form.email.trim() || form.password.length < 8)) {
      setError(t("team.form.requiredCreateError"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      if (form.id) {
        await updateEmployee(form.id, {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          role: form.role,
          jobTitle: form.jobTitle.trim() || null,
        }, getAccessToken());
      } else {
        await createEmployee({
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
          jobTitle: form.jobTitle.trim() || null,
        }, getAccessToken());
      }
      setModalOpen(false);
      load();
    } catch (err) {
      if (err?.code === "EMPLOYEE_EMAIL_ALREADY_EXISTS") setError(t("team.form.emailExistsError"));
      else setError(err?.message || t("team.form.saveErrorGeneric"));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    const prev = employees;
    setEmployees((es) => es.filter((e) => e.id !== id));
    setConfirmingDeleteId(null);
    try {
      await deleteEmployee(id, getAccessToken());
      load();
    } catch {
      setEmployees(prev);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <form onSubmit={submitSearch} style={{ display: "flex", gap: 10, flex: "1 1 240px" }}>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("team.searchPlaceholder")} style={{ ...filterStyle, flex: "1 1 240px" }} />
          <button type="submit" className="foc" style={{ border: 0, borderRadius: 999, padding: "9px 18px", background: "var(--ink)", color: "var(--cream)", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>{t("team.search")}</button>
        </form>
        <button onClick={openNew} className="foc" style={{ display: "flex", alignItems: "center", gap: 8, background: "var(--ink)", color: "var(--cream)", border: 0, borderRadius: 999, padding: "12px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
          <Icon name="plus" size={15} color="var(--cream)" />
          {t("team.newEmployee")}
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", overflow: "hidden" }}>
        <div className="admin-table-head" style={{ display: "grid", gridTemplateColumns: "1.4fr 1.4fr 1fr 100px 100px 90px", padding: "12px 22px", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-soft)", borderBottom: "1px solid var(--line)" }}>
          <span>{t("team.tableHead.name")}</span><span>{t("team.tableHead.email")}</span><span>{t("team.tableHead.jobTitle")}</span><span>{t("team.tableHead.role")}</span><span>{t("team.tableHead.status")}</span><span></span>
        </div>

        {status === "loading" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>{t("team.loading")}</div>}
        {status === "error" && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--terracotta-deep)" }}>{t("team.error")}</div>}
        {status === "ready" && employees.length === 0 && <div style={{ padding: "24px 22px", fontSize: 13, color: "var(--ink-soft)" }}>{t("team.empty")}</div>}

        {employees.map((emp) => {
          const stMeta = STATUS_STYLE_META[emp.status] || STATUS_STYLE_META.ACTIVE;
          const roleMeta = ROLE_STYLE_META[emp.role] || ROLE_STYLE_META.EMPLOYEE;
          return (
            <div key={emp.id}>
              <div className="admin-row admin-list-row" style={{ display: "grid", gridTemplateColumns: "1.4fr 1.4fr 1fr 100px 100px 90px", padding: "14px 22px", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
                <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 13.5 }}>
                  <span className="script" style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--cream-2)", color: "var(--ink-soft)", display: "grid", placeItems: "center", fontSize: 15, flexShrink: 0 }}>
                    {emp.firstName?.[0]?.toUpperCase() || "?"}
                  </span>
                  {emp.firstName} {emp.lastName}
                </span>
                <span style={{ fontSize: 13, color: "var(--ink-soft)" }}><span className="cell-label">{t("team.tableHead.email")}</span>{emp.email}</span>
                <span style={{ fontSize: 13 }}><span className="cell-label">{t("team.tableHead.jobTitle")}</span>{emp.jobTitle || "—"}</span>
                <span style={{ padding: "5px 11px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, background: roleMeta.bg, color: roleMeta.color, justifySelf: "start" }}>{t(`team.role.${emp.role}`)}</span>
                <span style={{ padding: "5px 11px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, background: stMeta.bg, color: stMeta.color, justifySelf: "start" }}>{t(`team.status.${emp.status}`)}</span>
                <span style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button onClick={() => openEdit(emp)} aria-label={t("team.editAria")} title={t("team.editAria")} className="foc" style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}>
                    <Icon name="pencil" size={14} />
                  </button>
                  <button onClick={() => setConfirmingDeleteId(emp.id)} aria-label={t("team.deleteAria")} title={t("team.deleteAria")} className="foc" style={{ width: 34, height: 34, borderRadius: 9, border: "1px solid rgba(193,99,63,.25)", background: "transparent", cursor: "pointer", display: "grid", placeItems: "center" }}>
                    <Icon name="trash" size={14} color="var(--terracotta-deep)" />
                  </button>
                </span>
              </div>
              {confirmingDeleteId === emp.id && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 22px", background: "rgba(193,99,63,.06)", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ fontSize: 12.5, color: "#7A3535", flex: 1 }}>{t("team.confirmDelete", { name: `${emp.firstName} ${emp.lastName}` })}</span>
                  <button onClick={() => remove(emp.id)} className="foc" style={{ border: 0, borderRadius: 999, padding: "8px 16px", background: "var(--terracotta-deep)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{t("team.delete")}</button>
                  <button onClick={() => setConfirmingDeleteId(null)} className="foc" style={{ border: 0, borderRadius: 999, padding: "8px 16px", background: "transparent", color: "var(--ink)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{t("team.cancel")}</button>
                </div>
              )}
            </div>
          );
        })}
        <Pagination meta={meta} page={page} onPageChange={setPage} />
      </div>

      {modalOpen && (
        <AdminFormSheet onClose={() => setModalOpen(false)} eyebrow={t("team.form.eyebrow")} title={form.id ? t("team.form.editTitle") : t("team.form.newTitle")} maxWidth={480}>
          <form onSubmit={save}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>{t("team.form.firstNameLabel")}</label>
                  <input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} style={fieldStyle} />
                </div>
                <div>
                  <label style={labelStyle}>{t("team.form.lastNameLabel")}</label>
                  <input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} style={fieldStyle} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>{t("team.form.emailLabel")}</label>
                {form.id ? (
                  <div style={{ ...fieldStyle, background: "var(--cream-2)", color: "var(--ink-soft)" }}>{form.email}</div>
                ) : (
                  <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={fieldStyle} />
                )}
              </div>
              {!form.id && (
                <div>
                  <label style={labelStyle}>{t("team.form.passwordLabel")}</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={passwordVisible ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      style={{ ...fieldStyle, paddingRight: 46 }}
                      minLength={8}
                      maxLength={72}
                      autoComplete="new-password"
                    />
                    <IconButton
                      type="button"
                      icon={passwordVisible ? "eye-slash" : "eye"}
                      size={32}
                      iconSize={16}
                      onClick={() => setPasswordVisible((v) => !v)}
                      aria-label={passwordVisible ? t("team.form.hidePassword") : t("team.form.showPassword")}
                      style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)" }}
                    />
                  </div>
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>{t("team.form.roleLabel")}</label>
                  <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} style={fieldStyle}>
                    <option value="EMPLOYEE">{t("team.role.EMPLOYEE")}</option>
                    <option value="ADMIN">{t("team.role.ADMIN")}</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>{t("team.form.jobTitleLabel")}</label>
                  <input value={form.jobTitle} onChange={(e) => setForm((f) => ({ ...f, jobTitle: e.target.value }))} placeholder={t("team.form.jobTitlePlaceholder")} style={fieldStyle} />
                </div>
              </div>
            </div>

            {error && <div style={{ fontSize: 12.5, color: "var(--terracotta-deep)", marginTop: 14 }}>{error}</div>}

            <div className="admin-sheet-actions" style={{ display: "flex", gap: 10, marginTop: 22 }}>
              <button type="submit" disabled={saving} className="foc" style={{ flex: 1, border: 0, borderRadius: 999, padding: 14, background: "var(--ink)", color: "var(--cream)", fontSize: 13.5, fontWeight: 700, cursor: saving ? "wait" : "pointer" }}>
                {saving ? t("team.form.saving") : t("team.form.save")}
              </button>
              <button type="button" onClick={() => setModalOpen(false)} className="foc" style={{ border: "1px solid var(--line)", borderRadius: 999, padding: "14px 20px", background: "transparent", color: "var(--ink)", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>{t("team.form.cancel")}</button>
            </div>
          </form>
        </AdminFormSheet>
      )}
      <style>{`
        .admin-row:hover{background:#FAF7F0}
        .cell-label{display:none}
        @media (max-width: 720px){
          .admin-table-head{display:none}
          .admin-list-row{grid-template-columns:1fr !important; gap:6px; align-items:flex-start !important}
          .admin-list-row .cell-label{display:block; font-size:10px; letter-spacing:.08em; text-transform:uppercase; color:var(--ink-soft); margin-bottom:2px}
          .admin-list-row > *{justify-self:start !important}
        }
      `}</style>
    </div>
  );
};
