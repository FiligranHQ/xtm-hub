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
    yarn install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/portal-api/node_modules ./apps/portal-api/node_modules
COPY apps/portal-api/. ./apps/portal-api/
COPY .yarnrc.yml package.json yarn.lock ./
RUN corepack enable

# Copy root node_modules for proper dependencies resolution
COPY --from=deps /app/node_modules ./node_modules

# Run tests from the portal-api directory
WORKDIR /app/apps/portal-api
CMD ["yarn", "test:ci"]
