export const Button = ({
  as = "button",
  variant = "dark",
  size = "default",
  className = "",
  children,
  ...rest
}) => {
  const classes = [
    "btn",
    `btn-${variant}`,
    size === "sm" ? "btn-sm" : "",
    className,
  ].filter(Boolean).join(" ");

  const Tag = as;
  return (
    <Tag className={classes} {...rest}>
      {children}
    </Tag>
  );
};
