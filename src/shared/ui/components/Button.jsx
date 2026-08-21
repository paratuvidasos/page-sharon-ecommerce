import { forwardRef } from "react";

export const Button = forwardRef(({
  as = "button",
  variant = "dark",
  size = "default",
  className = "",
  children,
  ...rest
}, ref) => {
  const classes = [
    "btn",
    `btn-${variant}`,
    size === "sm" ? "btn-sm" : "",
    className,
  ].filter(Boolean).join(" ");

  const Tag = as;
  return (
    <Tag ref={ref} className={classes} {...rest}>
      {children}
    </Tag>
  );
});

Button.displayName = "Button";
