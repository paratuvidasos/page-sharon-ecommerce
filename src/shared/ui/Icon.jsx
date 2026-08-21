// Única fuente de verdad de los nombres válidos de ícono. Úsala en código nuevo
// (icon={ICONS.SEARCH}) en vez de escribir el string a mano, para tener autocompletado.
// No es obligatorio migrar los usos existentes: la protección real contra typos
// la da el aviso en consola de abajo (case "default"), que dispara sin importar
// si el nombre vino de aquí o de un string suelto.
export const ICONS = {
  LEAF: "leaf",
  DROP: "drop",
  SPARK: "spark",
  SUN: "sun",
  TRUCK: "truck",
  STAR: "star",
  STAR_EMPTY: "star-empty",
  CART: "cart",
  SEARCH: "search",
  USER: "user",
  HEART: "heart",
  EYE: "eye",
  EYE_SLASH: "eye-slash",
  GOOGLE: "google",
  MENU: "menu",
  CLOSE: "close",
  CAMERA: "camera",
  ARROW: "arrow",
  CHEV_LEFT: "chev-l",
  CHEV_RIGHT: "chev-r",
  PLUS: "plus",
  MINUS: "minus",
  INSTAGRAM: "ig",
  TIKTOK: "tt",
  PIN: "pin",
  FACEBOOK: "fb",
  LEAF_DECO: "leaf-deco",
  WHATSAPP: "wp",
};

const VALID_ICON_NAMES = new Set(Object.values(ICONS));

export const Icon = ({ name, size = 22, stroke = 1.5, color = "currentColor" }) => {
  const s = { width: size, height: size, color };
  const p = { fill: "none", stroke: "currentColor", strokeWidth: stroke, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "leaf":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M20 4c-2 11-9 16-16 16 0-8 6-15 16-16Z"/><path {...p} d="M4 20c4-4 8-7 16-16"/></svg>);
    case "drop":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 3c4 5 7 9 7 12a7 7 0 1 1-14 0c0-3 3-7 7-12Z"/><path {...p} d="M9 15c0 1.5 1.2 3 3 3"/></svg>);
    case "spark":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>);
    case "sun":
      return (<svg viewBox="0 0 24 24" style={s}><circle {...p} cx="12" cy="12" r="4"/><path {...p} d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg>);
    case "truck":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 7h10v9H3zM13 10h4l3 3v3h-7"/><circle {...p} cx="7" cy="18" r="1.6"/><circle {...p} cx="17" cy="18" r="1.6"/></svg>);
    case "star":
      return (<svg viewBox="0 0 24 24" style={s}><path fill="currentColor" stroke="none" d="m12 17.3-5.6 3.4 1.5-6.4L3 9.9l6.5-.6L12 3.3l2.5 6 6.5.6-4.9 4.4 1.5 6.4z"/></svg>);
    case "star-empty":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="m12 17.3-5.6 3.4 1.5-6.4L3 9.9l6.5-.6L12 3.3l2.5 6 6.5.6-4.9 4.4 1.5 6.4z"/></svg>);
    case "cart":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M3 5h2l2.5 11h11L21 8H7"/><circle {...p} cx="9" cy="20" r="1.4"/><circle {...p} cx="18" cy="20" r="1.4"/></svg>);
    case "search":
      return (<svg viewBox="0 0 24 24" style={s}><circle {...p} cx="11" cy="11" r="6.5"/><path {...p} d="m20 20-4.5-4.5"/></svg>);
    case "user":
      return (<svg viewBox="0 0 24 24" style={s}><circle {...p} cx="12" cy="8" r="4"/><path {...p} d="M4 21c1-4.5 4.5-7 8-7s7 2.5 8 7"/></svg>);
    case "heart":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 20s-7-4.4-7-10a4.5 4.5 0 0 1 8-2.7A4.5 4.5 0 0 1 21 10c0 5.6-9 10-9 10Z"/></svg>);
    case "eye":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle {...p} cx="12" cy="12" r="3"/></svg>);
    case "eye-slash":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"/><circle {...p} cx="12" cy="12" r="3"/><path {...p} d="M4 4l16 16"/></svg>);
    case "google":
      return (<svg viewBox="0 0 24 24" style={{ width: size, height: size }}>
        <path fill="#4285F4" d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82Z"/>
        <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.26v3.1A12 12 0 0 0 12 24Z"/>
        <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.26A12 12 0 0 0 0 12c0 1.94.47 3.77 1.26 5.38l4.01-3.1Z"/>
        <path fill="#EA4335" d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.26 6.62l4.01 3.1C6.22 6.88 8.87 4.77 12 4.77Z"/>
      </svg>);
    case "menu":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M4 7h16M4 12h16M4 17h16"/></svg>);
    case "close":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M6 6l12 12M18 6 6 18"/></svg>);
    case "camera":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M4 8h3l1.5-2.5h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle {...p} cx="12" cy="13" r="3.5"/></svg>);
    case "arrow":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M5 12h14M13 6l6 6-6 6"/></svg>);
    case "chev-l":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="m15 6-6 6 6 6"/></svg>);
    case "chev-r":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="m9 6 6 6-6 6"/></svg>);
    case "plus":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 5v14M5 12h14"/></svg>);
    case "minus":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M5 12h14"/></svg>);
    case "ig":
      return (<svg viewBox="0 0 24 24" style={s}><rect {...p} x="3.5" y="3.5" width="17" height="17" rx="5"/><circle {...p} cx="12" cy="12" r="4"/><circle fill="currentColor" stroke="none" cx="17.5" cy="6.5" r="1"/></svg>);
    case "tt":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5"/><path {...p} d="M14 4c.5 2.5 2.5 4.5 5 5"/></svg>);
    case "pin":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M12 21V14M9 11a3 3 0 1 1 6 0c0 4-3 4-3 7M9 11C6.5 9 6 6 7.5 4.5 9 3 12 3.5 13 5.5"/></svg>);
    case "fb":
      return (<svg viewBox="0 0 24 24" style={s}><path {...p} d="M14 9V7c0-1 .5-2 2-2h2M10 12h7M14 21V9"/></svg>);
    case "leaf-deco":
      return (<svg viewBox="0 0 100 200" style={s}><path fill="currentColor" d="M50 5C30 30 18 70 26 110c6 30 22 50 24 80 0-30 14-50 24-78 12-40 0-80-24-107z" opacity=".6"/><path stroke="#fff" strokeWidth="1" fill="none" d="M50 20v160M50 40c-8 4-14 10-18 18M50 40c8 4 14 10 18 18M50 70c-10 4-18 12-22 22M50 70c10 4 18 12 22 22M50 105c-10 4-18 12-22 22M50 105c10 4 18 12 22 22M50 140c-8 4-14 10-18 18M50 140c8 4 14 10 18 18"/></svg>);
    case "wp":
      return (<svg viewBox="0 0 24 24" style={s} fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M3.50002 12C3.50002 7.30558 7.3056 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C10.3278 20.5 8.77127 20.0182 7.45798 19.1861C7.21357 19.0313 6.91408 18.9899 6.63684 19.0726L3.75769 19.9319L4.84173 17.3953C4.96986 17.0955 4.94379 16.7521 4.77187 16.4751C3.9657 15.176 3.50002 13.6439 3.50002 12ZM12 1.5C6.20103 1.5 1.50002 6.20101 1.50002 12C1.50002 13.8381 1.97316 15.5683 2.80465 17.0727L1.08047 21.107C0.928048 21.4637 0.99561 21.8763 1.25382 22.1657C1.51203 22.4552 1.91432 22.5692 2.28599 22.4582L6.78541 21.1155C8.32245 21.9965 10.1037 22.5 12 22.5C17.799 22.5 22.5 17.799 22.5 12C22.5 6.20101 17.799 1.5 12 1.5ZM14.2925 14.1824L12.9783 15.1081C12.3628 14.7575 11.6823 14.2681 10.9997 13.5855C10.2901 12.8759 9.76402 12.1433 9.37612 11.4713L10.2113 10.7624C10.5697 10.4582 10.6678 9.94533 10.447 9.53028L9.38284 7.53028C9.23954 7.26097 8.98116 7.0718 8.68115 7.01654C8.38113 6.96129 8.07231 7.046 7.84247 7.24659L7.52696 7.52195C6.76823 8.18414 6.3195 9.2723 6.69141 10.3741C7.07698 11.5163 7.89983 13.314 9.58552 14.9997C11.3991 16.8133 13.2413 17.5275 14.3186 17.8049C15.1866 18.0283 16.008 17.7288 16.5868 17.2572L17.1783 16.7752C17.4313 16.5691 17.5678 16.2524 17.544 15.9269C17.5201 15.6014 17.3389 15.308 17.0585 15.1409L15.3802 14.1409C15.0412 13.939 14.6152 13.9552 14.2925 14.1824Z" fill="#ffffff"/>
</svg>)
    default:
      if (import.meta.env.DEV && !VALID_ICON_NAMES.has(name)) {
        console.warn(`Icon: nombre de ícono desconocido "${name}". Revisa ICONS en shared/ui/Icon.jsx.`);
      }
      return null;
  }
};

export const Stars = ({ value = 5, size = 12, color = "var(--gold)" }) => {
  const full = Math.floor(value);
  const arr = [0, 1, 2, 3, 4];
  return (
    <span style={{ display: "inline-flex", gap: 2, color }}>
      {arr.map(i => (
        <Icon key={i} name={i < full ? "star" : "star-empty"} size={size} />
      ))}
    </span>
  );
};
