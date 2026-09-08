# Etapa 1: Construcción (Build)
FROM node:20-alpine AS build

WORKDIR /app

# Declarar los argumentos que vienen desde Dokploy / Docker build
ARG VITE_API_BASE_URL
ARG VITE_CLERK_PUBLISHABLE_KEY

# Convertirlos en variables de entorno para la compilación de Vite
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# Copiamos dependencias e instalamos
COPY package*.json ./
RUN npm install

# Copiamos código y construimos (Vite ya tendrá acceso a las variables)
COPY . .
RUN npm run build

# Etapa 2: Servidor de Producción (Nginx)
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
