# Etapa 1: Construir la aplicación React con Node.js
FROM node:20-alpine as build
WORKDIR /app

# Copiar configuración y paquetes
COPY package.json package-lock.json ./
RUN npm install

# Copiar el código fuente y compilar
COPY . .
RUN npm run build

# Etapa 2: Servir la aplicación estática con Nginx
FROM nginx:alpine
# Copiar la build generada a la carpeta pública de Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Exponer el puerto 80 del contenedor
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
