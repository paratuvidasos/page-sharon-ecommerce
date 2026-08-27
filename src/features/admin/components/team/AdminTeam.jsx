import { MOCK_TEAM } from "../../data/mock";

// No hay endpoint de empleados/accesos todavía — data de ejemplo (ver plan de implementación).
export const AdminTeam = () => (
  <div style={{ background: "#fff", borderRadius: 20, border: ".5px solid var(--line)", overflow: "hidden" }}>
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1.4fr 1fr", padding: "12px 22px", fontSize: 11, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ink-soft)", borderBottom: "1px solid var(--line)" }}>
      <span>Nombre</span><span>Correo</span><span>Rol</span>
    </div>
    {MOCK_TEAM.map((m) => (
      <div key={m.email} className="admin-row" style={{ display: "grid", gridTemplateColumns: "1.4fr 1.4fr 1fr", padding: "14px 22px", alignItems: "center", borderBottom: "1px solid var(--line)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 600, fontSize: 13.5 }}>
          <span className="script" style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--cream-2)", color: "var(--ink-soft)", display: "grid", placeItems: "center", fontSize: 15 }}>
            {m.initial}
          </span>
          {m.name}
        </span>
        <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{m.email}</span>
        <span style={{ fontSize: 13 }}>{m.role}</span>
      </div>
    ))}
    <style>{`.admin-row:hover{background:#FAF7F0}`}</style>
  </div>
);
