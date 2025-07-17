FROM mcr.microsoft.com/playwright:v1.53.2-noble

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY ./apps/portal-e2e-tests/.yarnrc.yml ./apps/portal-e2e-tests/package.json ./apps/portal-e2e-tests/yarn.lock ./apps/portal-e2e-tests/playwright.config.ts ./
COPY ./apps/portal-e2e-tests/migrations ./migrations
COPY ./apps/portal-e2e-tests/seeds ./seeds
COPY ./apps/portal-e2e-tests/tests ./tests
RUN corepack enable && \
    yarn install --immutable


CMD ["yarn", "playwright", "test"]
