# Compila el bundle de Vite; pnpm fijado a la version que genero el lockfile
FROM node:24-alpine AS build
WORKDIR /src
RUN npm install -g pnpm@11.1.1
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM nginx:1.27-alpine
COPY --from=build /src/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
