import { TextEncoder, TextDecoder } from "util";
import "@testing-library/jest-dom";

// jsdom no expone TextEncoder/TextDecoder globalmente — react-router-dom (usado por
// cualquier componente con useNavigate/Link, ver WelcomeBannerModal.jsx) lo necesita
// al importarse. Sin este polyfill, cualquier test que importe react-router-dom
// explota con "TextEncoder is not defined".
if (typeof global.TextEncoder === "undefined") {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

// jsdom no implementa IntersectionObserver — Reveal.jsx (usado por casi cualquier
// sección de la landing, ver src/shared/ui/Reveal.jsx) lo necesita para animar al
// entrar en viewport. Sin este stub, cualquier test que monte una sección de home
// (Benefits, etc.) explota con "IntersectionObserver is not defined".
if (typeof window.IntersectionObserver === "undefined") {
  window.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
