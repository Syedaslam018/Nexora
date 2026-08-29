# syntax=docker/dockerfile:1

# ── Builder ──────────────────────────────────────────────────────────────
# One stage does install + prisma generate + typecheck/build + dev-dep
# pruning, so the final runtime stage only ever copies already-built,
# already-pruned artifacts — no separate "reinstall production deps" step
# that would regenerate (and thus lose) the Prisma client.
FROM node:20-alpine AS builder
WORKDIR /app

# No package-lock.json is committed yet (this repo has never had `npm
# install` run against a real registry — see docs/PROGRESS.md) — `npm ci`
# requires an existing lockfile, so `npm install` is used here instead.
# Switch to `npm ci` once a lockfile exists; it's faster and fully
# reproducible.
COPY package.json ./
RUN npm install

COPY prisma ./prisma
COPY tsconfig.json ./
COPY src ./src

# Prisma Client is generated from schema.prisma into node_modules — this
# has to happen before `tsc`, since compiled service code imports types
# from the generated client.
RUN npx prisma generate

RUN npm run build

# Strips devDependencies (typescript, eslint, vitest, ...) while keeping
# the already-generated Prisma client and compiled dist/ — cheaper than a
# second `npm install --omit=dev`, and can't accidentally regenerate the
# client without the schema being present.
RUN npm prune --omit=dev

# ── Runtime ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Runs as a non-root user — the image ships with one, no need to create it.
USER node

COPY --chown=node:node --from=builder /app/package.json ./
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/dist ./dist
COPY --chown=node:node --from=builder /app/prisma ./prisma
COPY --chown=node:node docker-entrypoint.sh ./

EXPOSE 4000

ENTRYPOINT ["sh", "docker-entrypoint.sh"]
CMD ["node", "dist/server.js"]
