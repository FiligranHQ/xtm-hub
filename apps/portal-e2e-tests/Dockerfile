FROM mcr.microsoft.com/playwright:v1.55.0-noble
WORKDIR /app

# Copy package files for dependency installation
COPY .yarnrc.yml package.json yarn.lock ./
COPY ./apps/portal-e2e-tests/package.json ./apps/portal-e2e-tests/

# Install dependencies for e2e tests only
RUN corepack enable && \
    yarn workspaces focus portal-e2e-tests

# Copy test files and configs
COPY ./apps/portal-e2e-tests/playwright.config.ts ./apps/portal-e2e-tests/
COPY ./apps/portal-e2e-tests/tests ./apps/portal-e2e-tests/tests

# Create directories for migrations and seeds
RUN mkdir -p ./apps/portal-e2e-tests/migrations ./apps/portal-e2e-tests/seeds

# Copy migrations and seeds from artifacts
COPY ./migrations ./apps/portal-e2e-tests/migrations/
COPY ./seeds ./apps/portal-e2e-tests/seeds/

WORKDIR /app/apps/portal-e2e-tests
CMD ["yarn", "test:e2e"]