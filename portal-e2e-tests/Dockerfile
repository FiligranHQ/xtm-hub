FROM mcr.microsoft.com/playwright:v1.52.0-noble

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY .yarnrc.yml package.json yarn.lock playwright.config.ts ./
RUN corepack enable && \
    yarn install --immutable

COPY ./tests ./tests

CMD ["yarn", "playwright", "test"]
