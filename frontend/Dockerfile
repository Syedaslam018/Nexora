# syntax=docker/dockerfile:1

# ── Builder ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Install from the committed lockfile so production builds are reproducible
# and cannot silently pick up a newly-published dependency version.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* variables into the built JS at BUILD time, not
# runtime — unlike the backend, there's no process.env to read from once
# this is just static files served by nginx. VITE_API_URL and
# VITE_SOCKET_URL are deliberately left unset here (both default to a
# relative path — see src/api/client.ts and src/lib/socket.ts — which is
# exactly right for this setup, since nginx.conf proxies /api and
# /socket.io to the backend container). Only the Stripe key needs to be
# supplied, since there's no sensible default for it.
ARG VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY

RUN npm run build

# ── Runtime ──────────────────────────────────────────────────────────────
# The build output is static files — nginx serves them directly, no
# Node runtime needed in the final image.
FROM nginx:1.27-alpine AS runtime

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
