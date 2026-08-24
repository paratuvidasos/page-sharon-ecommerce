import { useState, useEffect, useRef } from "react";
import { Icon } from "@ui/Icon";
import { ProductImage } from "@ui/ProductImage";
import { Z } from "@ui/zIndex";

export const SearchModal = ({ open, onClose, products, onPick }) => {
  const [q, setQ] = useState("");
  const inputRef = useRef(null);
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current && inputRef.current.focus(), 50);
    if (!open) setQ("");
  }, [open]);

  const results = q.trim()
    ? products.filter(p => (p.name + " " + p.category + " " + p.sub).toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : products.slice(0, 4);

  return (
    <>
      <div onClick={onClose} style={{
        position: "fixed", inset: 0, background: "rgba(27,24,21,.5)",
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity .3s ease", zIndex: Z.search, backdropFilter: "blur(6px)"
      }} />
      <div style={{
        position: "fixed", top: 80, left: "50%", transform: `translateX(-50%) ${open ? "translateY(0)" : "translateY(-20px)"}`,
        width: "min(640px, 92vw)", background: "#fff", borderRadius: 20, zIndex: Z.search + 1,
        opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
        transition: "opacity .3s ease, transform .3s ease",
        boxShadow: "0 24px 80px rgba(27,24,21,.25)",
        border: "1px solid var(--line)", overflow: "hidden"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "18px 22px", borderBottom: "1px solid var(--line)" }}>
          <Icon name="search" size={20} color="var(--ink-soft)" />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
                 placeholder="Buscar productos, hábitos, ingredientes…"
                 style={{ flex: 1, border: 0, outline: 0, background: "transparent", fontSize: 16, fontFamily: "var(--sans)" }} />
          <button onClick={onClose} style={{ border: 0, background: "transparent", cursor: "pointer", color: "var(--ink-soft)", fontSize: 12, padding: "4px 10px", borderRadius: 6 }}>esc</button>
        </div>
        <div style={{ padding: "10px 12px", maxHeight: 420, overflowY: "auto" }}>
          {results.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--ink-soft)" }}>Sin resultados para &ldquo;{q}&rdquo;</div>
          )}
          {results.map(p => (
            <button key={p.id} onClick={() => { onPick && onPick(p); onClose(); }}
              style={{ width: "100%", display: "grid", gridTemplateColumns: "44px 1fr auto", gap: 14, alignItems: "center", padding: "10px 12px", border: 0, background: "transparent", textAlign: "left", borderRadius: 12, cursor: "pointer" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--cream-2)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <div style={{ width: 44, height: 44, borderRadius: 10, overflow: "hidden" }}>
                <ProductImage product={p} />
              </div>
              <div>
                <div style={{ fontWeight: 500 }}>{p.name}</div>
                <div style={{ color: "var(--ink-soft)", fontSize: 12 }}>{p.category} · ${p.price}</div>
              </div>
              <Icon name="arrow" size={16} color="var(--ink-soft)" />
            </button>
          ))}
        </div>
        {!q && (
          <div style={{ padding: "10px 22px 18px", display: "flex", flexWrap: "wrap", gap: 8 }}>
            <span className="eyebrow" style={{ width: "100%", marginBottom: 4 }}>Búsquedas frecuentes</span>
            {["Anti-caída", "Sin sulfatos", "Aceite de argán", "Mascarilla", "Kit completo"].map(t => (
              <button key={t} onClick={() => setQ(t)} style={{ padding: "6px 12px", borderRadius: 999, border: "1px solid var(--line)", background: "transparent", cursor: "pointer", fontSize: 12 }}>{t}</button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
