import { useEffect, useRef } from "react";

export function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

export const Reveal = ({ as = "div", delay = 0, children, ...rest }) => {
  const ref = useReveal();
  const Tag = as;
  return (
    <Tag ref={ref} className={"reveal " + (rest.className || "")} style={{ animationDelay: delay + "ms", ...(rest.style || {}) }} {...rest}>
      {children}
    </Tag>
  );
};
