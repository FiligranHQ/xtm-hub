FROM node:23-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy monorepo configuration files
COPY .yarnrc.yml package.json yarn.lock ./
COPY packages ./packages
COPY apps/portal-api/package.json ./apps/portal-api/package.json
COPY apps/portal-e2e-tests/package.json ./apps/portal-e2e-tests/package.json
COPY apps/portal-front/package.json ./apps/portal-front/package.json

# Install all dependencies at the workspace level
RUN corepack enable && \
    yarn install --immutable

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/portal-api/node_modules ./apps/portal-api/node_modules
COPY .yarnrc.yml package.json yarn.lock ./
COPY apps/portal-api/. ./apps/portal-api/

# Build the backend
WORKDIR /app/apps/portal-api
RUN corepack enable && \
    yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4001
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 graphql && \
    mkdir .graphql && \
    chown graphql:nodejs .graphql

COPY --from=builder --chown=graphql:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=graphql:nodejs /app/apps/portal-api/config ./config
COPY --from=builder --chown=graphql:nodejs /app/apps/portal-api/package.json .
COPY --from=builder --chown=graphql:nodejs /app/apps/portal-api/tests/seeds ./tests/seeds
COPY --from=builder --chown=graphql:nodejs /app/apps/portal-api/dist .
COPY --from=builder --chown=graphql:nodejs /app/apps/portal-api/src/server/mail-template ./src/server/mail-template

USER graphql
EXPOSE 4001

CMD ["node", "./index.js"]
