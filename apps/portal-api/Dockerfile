FROM node:23-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4001
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 graphql && \
    mkdir .graphql && \
    chown graphql:nodejs .graphql

COPY --chown=graphql:nodejs node_modules ./node_modules
COPY --chown=graphql:nodejs apps/portal-api/node_modules ./apps/portal-api/node_modules
COPY --chown=graphql:nodejs apps/portal-api/. ./apps/portal-api/
COPY --chown=graphql:nodejs apps/portal-api/config ./config
COPY --chown=graphql:nodejs apps/portal-api/package.json .
COPY --chown=graphql:nodejs apps/portal-api/tests/seeds ./tests/seeds
COPY --chown=graphql:nodejs apps/portal-api/dist .
COPY --chown=graphql:nodejs apps/portal-api/src/server/mail-template ./src/server/mail-template

USER graphql
EXPOSE 4001

CMD ["node", "./index.js"]
