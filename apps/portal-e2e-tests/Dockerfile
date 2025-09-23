FROM mcr.microsoft.com/playwright:v1.55.0-noble

WORKDIR /app

# Copy monorepo configuration files
COPY .yarnrc.yml package.json yarn.lock ./
COPY apps/portal-api/package.json ./apps/portal-api/package.json
COPY apps/portal-e2e-tests/package.json ./apps/portal-e2e-tests/package.json
COPY apps/portal-front/package.json ./apps/portal-front/package.json

# Install all dependencies at the workspace level
RUN corepack enable && \
    yarn install --immutable

# Copy e2e test files
COPY ./apps/portal-e2e-tests/playwright.config.ts ./apps/portal-e2e-tests/
COPY ./apps/portal-e2e-tests/tests ./apps/portal-e2e-tests/tests

# Create directories first
RUN mkdir -p ./apps/portal-e2e-tests/migrations ./apps/portal-e2e-tests/seeds

# Copy migrations and seeds if they exist (using wildcard trick)
COPY ./apps/portal-api/src/migrations* ./apps/portal-e2e-tests/migrations/
COPY ./apps/portal-api/tests/seeds* ./apps/portal-e2e-tests/seeds/

WORKDIR /app/apps/portal-e2e-tests

CMD ["yarn", "test:e2e"]
