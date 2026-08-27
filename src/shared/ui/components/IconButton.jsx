import { Icon } from "../Icon";

export const IconButton = ({
  icon,
  size = 40,
  iconSize,
  color,
  badge,
  badgeColor = "var(--botanic-deep)",
  style = {},
  children,
  ...rest
}) => {
  return (
    <button
      style={{
        position: "relative",
        width: size,
        height: size,
        borderRadius: 999,
        border: 0,
        background: "transparent",
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        ...style,
      }}
      {...rest}
    >
      {children ?? <Icon name={icon} size={iconSize ?? Math.round(size * 0.5)} color={color} />}
      {badge != null && badge > 0 && (
        <span
          style={{
            position: "absolute",
            top: 6,
            right: 4,
            background: badgeColor,
            color: "#fff",
            fontSize: 10,
            fontWeight: 600,
            lineHeight: 1,
            padding: "3px 5px",
            borderRadius: 999,
            minWidth: 16,
            textAlign: "center",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
};
