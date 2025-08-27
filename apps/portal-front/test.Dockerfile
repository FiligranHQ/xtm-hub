ARG APP_VERSION=0.0.0-dev
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
COPY --from=deps /app/apps/portal-front/node_modules ./apps/portal-front/node_modules
COPY apps/portal-front/. ./apps/portal-front/
COPY .yarnrc.yml package.json yarn.lock ./

# Set the version of the app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_APP_VERSION=${APP_VERSION}

# Copy root node_modules for proper dependencies resolution
COPY --from=deps /app/node_modules ./node_modules

WORKDIR /app/apps/portal-front
RUN corepack enable && \
    echo "NEXT_PUBLIC_APP_VERSION=${APP_VERSION}" > .env.local

RUN yarn relay

CMD ["yarn", "test:ci"]
