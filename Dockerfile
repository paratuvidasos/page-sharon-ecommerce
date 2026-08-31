# Pin la versión de Node para que todo el equipo compile/corra exactamente igual,
# sin depender de lo que cada quien tenga instalado localmente (nvm, brew, etc).
# Vite 6 requiere Node >=18; usamos 20 LTS (alpine = imagen liviana).
ARG NODE_VERSION=20.18-alpine

# ---- deps: instala dependencias una sola vez, cacheable entre builds ----
FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- dev: servidor de desarrollo (Vite) con hot reload ----
# Es el target que usa docker-compose.yml para "npm run dev" dentro del contenedor.
FROM deps AS dev
WORKDIR /app
COPY . .
EXPOSE 5190
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ---- build: genera el build de producción (npm run build) ----
FROM deps AS build
WORKDIR /app
COPY . .
RUN npm run build

# ---- preview: sirve el build de producción con Vite (paridad con "npm run preview") ----
# Nota: el despliegue real hoy es a CloudFront (ver CLAUDE.md), no este contenedor.
# Este target sirve solo para verificar localmente que el build de producción funciona.
FROM node:${NODE_VERSION} AS preview
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
RUN npm install --omit=dev --no-save vite@^6.0.0
EXPOSE 4173
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
