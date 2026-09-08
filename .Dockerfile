# Etapa 1: Construcción (Build)
FROM node:20-alpine AS build

WORKDIR /app

# Argumentos opcionales de build
ARG VITE_API_BASE_URL
ARG VITE_CLERK_PUBLISHABLE_KEY

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Etapa 2: Servidor de Producción (Nginx)
FROM nginx:stable-alpine
WORKDIR /usr/share/nginx/html

COPY --from=build /app/dist .

# Configuración Nginx para SPA (React Router)
RUN echo 'server { \
    listen 80; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

# Script de inicio que inyecta las variables de entorno de runtime en config.js
RUN echo '#!/bin/sh' > /docker-entrypoint.d/40-env-config.sh && \
    echo 'echo "window.__ENV__ = { VITE_API_BASE_URL: \"${VITE_API_BASE_URL}\", VITE_CLERK_PUBLISHABLE_KEY: \"${VITE_CLERK_PUBLISHABLE_KEY}\" };" > /docker-entrypoint.d/40-env-config.sh && \
    chmod +x /docker-entrypoint.d/40-env-config.sh

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
