FROM node:23-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY apps/portal-api/.yarnrc.yml apps/portal-api/package.json apps/portal-api/yarn.lock ./
RUN corepack enable && \
    yarn install --immutable

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/portal-api/. .
RUN corepack enable

CMD ["yarn", "test:ci"]
