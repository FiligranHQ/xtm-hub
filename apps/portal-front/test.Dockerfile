ARG APP_VERSION=0.0.0-dev
FROM node:23-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY apps/portal-front/.yarnrc.yml apps/portal-front/package.json apps/portal-front/yarn.lock ./
RUN corepack enable && \
    yarn install --immutable

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/portal-front/. .

# Set the version of the app
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_APP_VERSION=${APP_VERSION}

RUN corepack enable && \
    echo "NEXT_PUBLIC_APP_VERSION=${APP_VERSION}" > .env.local

RUN yarn relay

CMD ["yarn", "test:ci"]
