import { useState } from "react";
import { Reveal } from "./Reveal";
import { Icon } from "./Icon";
import { ProductCard } from "./ProductCard";
import { PRODUCTS, CATEGORIES } from "../data/products";

export const Products = ({ onAdd, onWish }) => {
  const [cat, setCat] = useState("Todo");
  const list = cat === "Todo" ? PRODUCTS : PRODUCTS.filter(p => p.category === cat);

  return (
    <section id="shop" data-screen-label="Shop" style={{ padding: "120px 0 80px", position: "relative" }}>
      <div className="wrap">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: 48 }}>
          <Reveal>
            <div>
              <div className="eyebrow">Selección destacada</div>
              <h2 className="display" style={{ fontSize: "clamp(40px, 5vw, 64px)", margin: "8px 0 0", maxWidth: 700 }}>
                Productos pensados para<br />
                <span className="script" style={{ color: "var(--botanic-deep)" }}>cada tipo de cabello</span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <a href="#" style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, letterSpacing: ".06em", textTransform: "uppercase", borderBottom: "1px solid var(--ink)", paddingBottom: 4 }}>
              Ver catálogo completo <Icon name="arrow" size={14} />
            </a>
          </Reveal>
        </div>

        <Reveal>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 36 }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding: "10px 18px", borderRadius: 999, fontSize: 13,
                border: "1px solid " + (cat === c ? "var(--ink)" : "var(--line)"),
                background: cat === c ? "var(--ink)" : "transparent",
                color: cat === c ? "var(--cream)" : "var(--ink)",
                cursor: "pointer", whiteSpace: "nowrap",
                fontWeight: 500, letterSpacing: ".02em",
                transition: "all .25s ease"
              }}>{c}</button>
            ))}
          </div>
        </Reveal>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: 24
        }}>
          {list.map((p, i) => (
            <Reveal key={p.id} delay={i * 60}>
              <ProductCard product={p} onAdd={onAdd} onWish={onWish} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
