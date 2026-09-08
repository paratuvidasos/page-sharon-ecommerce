CLAUDE.md — Frontend (E-commerce Productos Capilares)

Guía de contexto para Claude Code al trabajar en este repositorio. Este es el frontend, una **app React + Vite (SPA)** desplegada vía CloudFront. Consume el backend (Node.js + Express plano, sin framework tipo NestJS — TypeORM + Postgres, repo separado `page-sharon-api`) exclusivamente vía HTTPS/API — nunca accede directamente a Postgres/Mongo/Redis.

**Nota:** el diseño original de esta guía se pensó para Next.js (App Router). El código real del repo es Vite + React 18, sin App Router y sin ningún router todavía — hoy la app es una sola página con secciones (`App.jsx`). Esta guía documenta el stack real; si en algún momento se migra a Next.js o se introduce routing, actualízala.

## Arquitectura general

```
┌─────────────┐        HTTPS/API         ┌───────────────────┐
│   Frontend   │ ───────────────────────▶ │     Backend        │
│ (React + Vite│                          │ (Node.js + Express, │
│  SPA), CDN   │                          │  TypeORM + Postgres)│
└─────────────┘                          └───────────────────┘
```

* Repo independiente del backend, con su propio ciclo de despliegue.
* Toda la comunicación con datos reales pasa por la API del backend. Ningún componente debe simular lógica de negocio que pertenece al backend (cálculo de precios, validación de stock, reglas de descuento, etc. — eso se consulta, no se reimplementa en el cliente).
* **Estado real de la integración: la primera llamada HTTP real al backend ya existe — el registro por correo.** `RegisterForm.jsx` llama a `POST /accounts/register` vía `shared/api-client` (base URL en `VITE_API_BASE_URL`, default `http://localhost:3000/api/v1`). Ese endpoint solo crea la cuenta y dispara un correo de verificación; **no** devuelve sesión/token, así que el registro **ya no loguea automáticamente** al terminar — `AuthModal` deja de llamar `onAuthSuccess` en modo `register` y solo muestra el mensaje de "revisa tu correo". Todo lo demás sigue simulado: el catálogo (`src/features/catalog/data/products.js`) es un array estático, el carrito (`src/features/cart`) es estado local en memoria (React state en `App.jsx`), y el "checkout" (`src/features/checkout`) arma un mensaje y abre un deep link de WhatsApp (`wa.me`) — no hay pasarela de pago ni creación de pedidos en un backend todavía. La "sesión" (`src/features/auth`) tampoco es real todavía: login y Google siguen poblando un objeto `user` en memoria en `App.jsx` vía `onAuthSuccess` (se pierde al recargar, sin JWT/cookie) hasta que exista el endpoint de login. `src/features/profile` edita ese mismo objeto en memoria (nombre, teléfono, foto como object URL local). Las direcciones guardadas (`src/features/profile/components/addresses`) son igual de efímeras: un array `addresses` en memoria en `App.jsx`. `src/features/orders` ya existe pero es **solo lectura**: muestra un array `orders` en memoria (`DEMO_ORDERS` para la cuenta demo), sin ninguna forma de crear un pedido real todavía — el "checkout" sigue sin generar pedidos. Ese array de pedidos **no está conectado** con el flag `hasActiveOrder` de `DEMO_ADDRESSES`: son dos simulaciones independientes, a propósito, hasta que exista el backend que las una de verdad.

## Estructura de carpetas (real, post-reestructuración)

Organizada por feature, alineada a los módulos del backend y a los módulos del backlog de historias de usuario:

```
src/
├── features/
│   ├── catalog/                ← catálogo, búsqueda y filtros de productos
│   │   ├── components/           (Products, ProductCard, SearchModal)
│   │   └── data/products.js
│   ├── cart/                   ← carrito de compras (estado local)
│   │   └── components/CartDrawer.jsx
│   ├── checkout/                ← flujo de checkout (hoy: formulario + WhatsApp)
│   │   └── components/CheckoutModal.jsx
│   ├── auth/                    ← registro, login y recuperación de contraseña (hoy: simulado, sin backend)
│   │   └── components/
│   │       ├── AuthModal.jsx        (orquestador: modal, tabs, footer, éxito, diálogo Google)
│   │       ├── AuthField.jsx        (único campo de UI compartido entre variantes)
│   │       ├── register/RegisterForm.jsx
│   │       ├── login/LoginForm.jsx
│   │       ├── forgot-password/ForgotPasswordForm.jsx
│   │       ├── reset-password/      (ResetPasswordForm.jsx + ResetPasswordModal.jsx)
│   │       └── verify-email/EmailVerificationModal.jsx
│   ├── profile/                 ← edición de perfil (nombre, teléfono, foto) del usuario en sesión
│   │   └── components/
│   │       ├── ProfileModal.jsx, ProfileForm.jsx, PhoneField.jsx, PhotoField.jsx
│   │       └── addresses/          ← gestor de direcciones de envío, anidado dentro de ProfileModal
│   │           (AddressBookModal, AddressCard, AddressForm, AddressFormModal)
│   └── orders/                  ← historial de pedidos (hoy: solo lectura, sin creación real)
│       ├── components/            (OrderHistoryModal, OrderRow, OrderDetailModal)
│       └── data/statuses.js       ← estados posibles de un pedido (copia + color de badge)
├── shared/
│   ├── ui/                      ← secciones de landing + UI reutilizable, sin lógica de negocio
│   │   ├── components/            (Button, IconButton — primitivas globales)
│   │   ├── data/                  (benefits.js, testimonials.js)
│   │   └── Nav, Footer, Hero, Benefits, BeforeAfter, Testimonials,
│   │       PurchaseProcess, OfferBanner, Newsletter, MobileMenu,
│   │       AnnouncementBar, Icon, Reveal, TweaksPanel, ProductImage
│   ├── data/countries.js        ← países + reglas de teléfono/código postal, usado por profile y addresses
│   └── i18n/currency.js         ← único punto de formato de moneda (es-CO/COP hoy), usado por orders
├── assets/img/
├── App.jsx                      ← raíz de composición (hoy es, de facto, la única "página")
└── main.jsx
```

**Sobre módulos que todavía no existen:** `(shop)/(account)/(admin)` (route groups), `aftersales` y `admin` no tienen carpeta propia porque no hay routing ni panel admin hoy. No crear carpetas vacías para ellos — se agregan cuando haya trabajo real que poner ahí. Cuando se introduzca routing, evaluar `react-router-dom` con carpetas equivalentes a esos route groups. (`orders` sí existe desde [0008], pero solo como pantalla de lectura sobre datos de demo — ver "Pendiente de definir". `shared/api-client` existe desde la integración de registro — ver siguiente sección.)

**Componentes de UI reutilizables entre features:** van en `shared/ui/components/` (p. ej. `Button`, `IconButton`), no se duplican dentro de cada feature. **Datos reutilizables entre features** (sin lógica de negocio real, ej. la lista de países) van en `shared/data/`, por el mismo motivo — `shared/data/countries.js` empezó viviendo solo en `features/profile/data/` y se promovió cuando `features/profile/components/addresses` necesitó la misma lista.

## Reglas de arquitectura

1. Un único cliente API centralizado (`shared/api-client`) — ningún componente hace `fetch` directo a la URL del backend a mano; todo pasa por funciones tipadas del cliente, para poder manejar auth, errores y reintentos en un solo lugar. **Ya existe** (`http.js` con el `fetch` base + `ApiError`, y un archivo por recurso, ej. `accounts.js`), creada al integrar el registro con `POST /accounts/register`. La base URL sale de `VITE_API_BASE_URL` (`.env`, default `http://localhost:3000/api/v1`).
2. Server Components por defecto; usar Client Components solo donde se necesite interactividad real (formularios, carrito, filtros dinámicos). *(Aplica cuando el proyecto use un framework con Server Components, p. ej. si se migra a Next.js. Con Vite SPA, todo componente es cliente por definición.)*
3. No duplicar lógica de negocio del backend. Ejemplos de lo que NO va en el frontend: validar stock real, calcular impuestos finales, decidir si un cupón es válido — el frontend muestra lo que el backend responde y maneja el estado de UI, no reimplementa las reglas.
4. Datos sensibles de pago nunca tocan el estado de la app ni se envían a logs — se manejan mediante los campos tokenizados/iframe que provea la pasarela de pago que se integre.
5. **Dividir componentes proactivamente cuando dejan de ser navegables**, sin esperar a que se pida explícitamente. Señales de que un archivo debe partirse: mezcla orquestación (estado compartido, layout, modal/shell) con la lógica completa de varias variantes independientes, o crece más allá de ~300-400 líneas volviéndose difícil de escanear. Ejemplo real de este repo: `AuthModal.jsx` empezó como un solo componente con registro + login + Google y superó las 700 líneas; se dividió en `AuthModal.jsx` (orquestador delgado: modal, tabs, footer, pantalla de éxito, diálogo de Google) + `RegisterForm.jsx`/`LoginForm.jsx`/`ForgotPasswordForm.jsx` (cada uno dueño de sus propios campos, validación y llamada simulada, expuestos al padre solo vía un `submit()` imperativo) + `AuthField.jsx` (el único pedazo de UI realmente idéntico entre variantes). Reglas para decidir el corte:
   - Separar por **variante independiente** (registro vs. login vs. recuperar contraseña, no por capricho), dejando en el orquestador solo lo que de verdad es compartido (layout, animación, estado que las variantes necesitan).
   - Extraer un componente compartido (tipo `AuthField`) únicamente cuando evita duplicar UI/lógica genuinamente idéntica — si dos variantes solo se parecen "un poco", es preferible aceptar algo de duplicación a forzar una abstracción prematura.
   - Los archivos nuevos van en la misma carpeta del feature (`features/<feature>/components/`), no en `shared/ui` a menos que el componente se vaya a reusar fuera de ese feature.
   - **Cada variante independiente vive en su propia subcarpeta dentro de `components/`, nombrada en kebab-case según la variante** (`register/`, `login/`, `forgot-password/`, `reset-password/`, `verify-email/`), aunque hoy sea un solo archivo — así queda espacio para que crezca (ej. un formulario + el modal que lo aloja, como `reset-password/ResetPasswordForm.jsx` + `reset-password/ResetPasswordModal.jsx`) sin tener que reorganizar después. Solo el orquestador (`AuthModal.jsx`) y lo realmente compartido (`AuthField.jsx`) quedan sueltos en la raíz de `components/`.
   - No dividir por dividir: un componente de 100-200 líneas con una sola responsabilidad clara no necesita partirse.
6. **Un modal anidado dentro de otro (`shared/ui/components/Modal`) siempre se renderiza como hermano del `<Modal>` padre, nunca como hijo dentro de su `children`.** El panel de `Modal` usa `transform` para centrarse, y un `transform` en un ancestro crea un "containing block" para `position: fixed` — un `<Modal>` anidado como hijo queda atrapado dentro del panel del padre (recortado por su `overflow: hidden` y mal posicionado) en vez de cubrir el viewport. Patrón correcto: `return (<><Modal>...</Modal><ModalHijo .../></>)`, como el diálogo de Google dentro de `AuthModal`, `CheckoutModal` dentro de `CartDrawer`, o `AddressBookModal` dentro de `ProfileModal`.

## Autenticación

* El token de sesión se manejará de forma segura (httpOnly cookie recomendado sobre localStorage, a confirmar con backend).
* Rutas de cuenta y admin requerirán sesión válida cuando existan — hoy no hay auth ni esas rutas implementadas.
* **Estado real: la "sesión" es un objeto `user` en memoria en `App.jsx`** (`{ name, email, phone, countryCode, avatarUrl }`), sin JWT/cookie ni persistencia — se pierde al recargar. Se crea en `handleAuthSuccess` cuando `AuthModal` completa **login o Google** (ambos siguen simulados). El registro por correo ya no dispara `handleAuthSuccess`: llama al backend real (`POST /accounts/register`, ver arriba), que no devuelve sesión, así que solo muestra el mensaje de verificación por correo. `features/profile` actualiza `user` al guardar cambios de perfil. El ícono de cuenta en `Nav` decide entre abrir `AuthModal` o `ProfileModal` según si `user` existe. Reemplazar login/Google por sesión real (y por leer/escribir el perfil vía `shared/api-client`) cuando exista el endpoint de login — no antes.
* El correo del usuario no es editable desde `ProfileForm` a propósito (cambiarlo requiere reverificación); hoy solo se muestra de solo lectura, sin flujo de reverificación implementado.

## Internacionalización (a futuro)

El backlog marca multi-idioma/multi-moneda como alcance futuro, no inmediato. No es necesario implementarlo desde el día uno, pero al construir componentes de catálogo, precios y checkout, evitar hardcodear textos y formateo de moneda directamente — usar utilidades centralizadas (`shared/i18n`) aunque hoy solo soporten un idioma/moneda, para no tener que reescribir todo después.

* **Ya existe una primera pieza real:** `shared/i18n/currency.js` exporta `formatCurrency()` (es-CO/COP vía `Intl.NumberFormat`), usado hoy por `features/orders`. `features/catalog` (`ProductCard.jsx`, `OfferBanner.jsx`) y `features/checkout`/`features/cart` siguen formateando moneda a mano de forma inconsistente (con y sin `toLocaleString`, con y sin símbolo) — no se tocaron al construir `orders` porque estaba fuera de alcance de esa historia, pero deberían migrar a `formatCurrency()` la próxima vez que se editen.

## Testing

* Unit/component: Jest + Testing Library para componentes y hooks.
* E2E: Playwright (o Cypress) para los flujos críticos: agregar al carrito, checkout completo, login/registro.
* Los flujos de pago deben probarse contra el entorno sandbox de la pasarela una vez esté definida — nunca contra producción.
* **Estado real: nada de esto está instalado todavía.** `package.json` no tiene Jest, Testing Library, Playwright ni ESLint configurados.

## Trazabilidad con el backlog

Las historias de usuario viven en ClickUp (Space "sharon"), numeradas `[0001]` a `[0072]`, con historias marcadas `[FE]` correspondientes a trabajo de este repositorio. Referenciar el ID en el commit o PR (ej. `[0037] Revisar resumen del pedido antes de confirmar`) para mantener trazabilidad.

## Git: commits y push

Claude Code **nunca** debe ejecutar `git commit` ni `git push` (ni ningún comando que publique o cree commits) en este repositorio, aunque el usuario lo pida explícitamente. El usuario hace sus propios commits y pushes manualmente. Lo único que Claude puede hacer es **redactar el texto/mensaje del commit** cuando se le pida, para que el usuario lo use él mismo.

## PRs y ramas: todo pasa por `Laboratory`, con `gh stack`

* **`Laboratory` es el trunk real de este repo, no `main`.** Todo PR/rama de feature debe basarse — directa o transitivamente, a través de la cadena del stack — en `Laboratory`. `main` solo recibe merges de `Laboratory` en otro flujo separado; ninguna PR de feature debe apuntar a `main` directamente.
* El flujo de ramas se maneja con la extensión **`gh stack`** (`gh stack init`, `gh stack checkout`, `gh stack rebase`, `gh stack submit`, `gh stack view`), no con ramas/PRs sueltas fuera de un stack. Nombrar las ramas nuevas con el mismo patrón que ya usa el repo: `fe-00XX-descripcion-corta` (kebab-case, con el/los número(s) de historia de ClickUp).
* **Cuidado al mergear un stack con el botón "Merge stack" de GitHub cuando la rama base del stack (la que conecta con `Laboratory`) ya se mergeó por separado**: si esa rama base se mergeó y se borró en un PR aparte, "Merge stack" en las PRs de arriba solo las mergea *entre sí* dentro de esa rama borrada — **no** las hace llegar a `Laboratory`. Señal de alerta: en la lista de PRs de GitHub, la PR de más abajo del stack no muestra el indicador `N/N` que sí muestran las de arriba. Antes de confiar en que un stack quedó bien integrado, verificar con `git log --oneline origin/Laboratory..origin/<rama-tope-del-stack>` que no queden commits pendientes de llegar a `Laboratory`.

## Pendiente de definir (no asumir en el código)

* Pasarela de pago (define qué SDK/componentes de checkout se integran en el frontend). Hoy el "checkout" solo abre un link de WhatsApp.
* Manejo exacto de sesión (cookie vs token en cliente) — confirmar con el equipo de backend. Hoy no hay endpoint de login ni sesión real (el registro por correo sí es real desde [0001][BE], pero no loguea).
* Alcance real de multi-idioma/multi-moneda y librería a usar (next-intl, react-intl, etc.).
* Routing: hoy la app es una sola página sin router. Definir si/cuándo se introduce `react-router-dom` para cuenta/admin.
* Testing (Jest/Testing Library/Playwright/ESLint) — no instalado todavía.
* Proceso de reverificación de correo (cambiar el email de la cuenta). Hoy `ProfileForm` solo lo muestra de solo lectura.
* Subida real de la foto de perfil (storage + URL final). Hoy `PhotoField` solo genera un object URL local para la previsualización, que nunca se sube a ningún lado.
* Validación real de teléfono y código postal por país (rangos por operador, validación postal contra un servicio real, etc.). Hoy `shared/data/countries.js` solo valida "N dígitos exactos" / una regex simple por país, como guía de UI.
* Pantalla de verificación de correo: ya existe, sin routing. `features/auth/components/verify-email/EmailVerificationModal.jsx` se abre directo desde `App.jsx` leyendo `?token=...` de la URL (mismo patrón que `ResetPasswordModal` con `?resetToken=...`, pero acá el nombre del query param es `token` porque así lo genera el backend en `RegisterUser.ts`: `${FRONTEND_URL}/verify-email?token=...`, igual que el propio endpoint `GET /accounts/verify-email?token=...`), llama a `verifyEmail(token)` y muestra éxito/error.
* Creación real de pedidos. `features/orders` hoy solo lee `DEMO_ORDERS` (`App.jsx`); nada en la app crea un pedido nuevo — el checkout sigue terminando en un mensaje de WhatsApp, no en una fila de `orders`. Cuando exista el backend, además de leer pedidos reales, conectar `hasActiveOrder` en `features/profile/components/addresses` con el estado real del pedido (hoy son dos simulaciones independientes que no se tocan entre sí).

## Comandos

```bash
npm run dev       # servidor de desarrollo (Vite), fijo en el puerto 5190 (--strictPort, ver package.json).
                  # El backend en dev tiene FRONTEND_URL/CORS apuntando a http://localhost:5190 fijo,
                  # así que este puerto no puede driftear a otro si 5190 ya está ocupado por otro proyecto.
npm run build     # build de producción
npm run preview   # sirve el build de producción localmente
```

No hay `npm run test`, `npm run test:e2e` ni `npm run lint` porque esas herramientas no están instaladas todavía (ver "Pendiente de definir").
