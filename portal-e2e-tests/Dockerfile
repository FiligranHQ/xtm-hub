FROM mcr.microsoft.com/playwright:v1.49.1-noble

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY .yarn/releases ./.yarn/releases
COPY .yarnrc.yml package.json yarn.lock playwright.config.ts ./
RUN yarn install --immutable


COPY ./tests ./tests

CMD ["yarn", "playwright", "test"]
