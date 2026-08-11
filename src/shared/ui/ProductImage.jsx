import { useState } from "react";

const ACCENT_BGS = {
  rose: "linear-gradient(180deg, #E5EBE2 0%, #D2DFD0 100%)",
  botanic: "linear-gradient(180deg, #E5EBE2 0%, #D2DFD0 100%)",
  gold: "linear-gradient(180deg, #F1E4CB 0%, #E2CDA3 100%)",
};

export const ProductImage = ({
  image,
  thumbnail,
  gallery,
  name = "",
  accent = "botanic",
  type = "bottle",
  category = "",
  big = false,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const hasImage = image && !error;
  const aspect = big ? "1/1.05" : "1/1.1";

  if (!hasImage) {
    return (
      <div
        className={"ph ph-" + type}
        data-label={category}
        style={{
          aspectRatio: aspect,
          borderRadius: 14,
          background: ACCENT_BGS[accent] || ACCENT_BGS.botanic,
        }}
      />
    );
  }

  const src = thumbnail || image;

  return (
    <div
      style={{
        position: "relative",
        aspectRatio: aspect,
        borderRadius: 14,
        overflow: "hidden",
        background: "#f0f0f0",
      }}
    >
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(135deg, var(--cream-2), var(--botanic-muted))",
            animation: "shimmer 1.8s ease-in-out infinite",
            backgroundSize: "200% 100%",
          }}
        />
      )}
      <img
        src={src}
        alt={name || category}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: loaded ? 1 : 0,
          transition: "opacity .4s ease, transform .5s ease",
        }}
        className="product-img"
      />
    </div>
  );
};