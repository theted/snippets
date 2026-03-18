# ── Stage 1: build the React app ─────────────────────────────────────────────
FROM node:20-alpine AS build

WORKDIR /app

# VITE_ vars are embedded at build time, not runtime
ARG VITE_API_BASE=/api
ARG VITE_GOOGLE_AUTH_ENABLED=false
ARG VITE_GOOGLE_CLIENT_ID=
ENV VITE_API_BASE=$VITE_API_BASE
ENV VITE_GOOGLE_AUTH_ENABLED=$VITE_GOOGLE_AUTH_ENABLED
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ── Stage 2: serve with nginx ─────────────────────────────────────────────────
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
