# syntax=docker/dockerfile:1.7

# ---------- builder ----------
FROM node:20-alpine AS builder
RUN apk add --no-cache python3 make g++
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /repo

# Install with workspace context so the api workspace resolves correctly
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile || pnpm install

# Build api only
COPY apps/api apps/api
RUN pnpm --filter api build

# ---------- runtime ----------
FROM node:20-alpine AS runtime
RUN apk add --no-cache tini
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate
WORKDIR /app

ENV NODE_ENV=production \
    PORT=4000 \
    DATABASE_PATH=/data/dev.sqlite

# Copy the built workspace from the builder
COPY --from=builder /repo/pnpm-workspace.yaml /repo/package.json /repo/pnpm-lock.yaml* ./
COPY --from=builder /repo/apps/api/package.json apps/api/
COPY --from=builder /repo/apps/web/package.json apps/web/
COPY --from=builder /repo/node_modules ./node_modules
COPY --from=builder /repo/apps/api/node_modules apps/api/node_modules
COPY --from=builder /repo/apps/api/dist apps/api/dist

RUN mkdir -p /data
VOLUME ["/data"]
EXPOSE 4000

WORKDIR /app/apps/api
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/src/main.js"]
