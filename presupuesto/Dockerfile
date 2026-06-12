# syntax=docker/dockerfile:1

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# ---- lint (CI only): docker build --target lint ./presupuesto ----
FROM build AS lint
RUN npm run lint

# ---- bundle ----
FROM build AS bundle
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- runtime (non-root nginx, port 8080) ----
FROM nginxinc/nginx-unprivileged:alpine
COPY --from=bundle /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
