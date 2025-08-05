FROM mcr.microsoft.com/playwright:v1.54.2-noble

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

# Copy migrations and seeds (these are copied by the CI pipeline before the Docker build)
COPY ./apps/portal-e2e-tests/migrations ./apps/portal-e2e-tests/migrations
COPY ./apps/portal-e2e-tests/seeds ./apps/portal-e2e-tests/seeds

WORKDIR /app/apps/portal-e2e-tests

CMD ["yarn", "test:e2e"]
