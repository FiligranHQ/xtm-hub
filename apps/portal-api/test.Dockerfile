FROM node:23-alpine

WORKDIR /app

COPY .yarnrc.yml package.json yarn.lock ./
COPY packages ./packages/
COPY apps/portal-api/. ./apps/portal-api/
COPY apps/portal-front/package.json ./apps/portal-front/package.json
COPY apps/portal-e2e-tests/package.json ./apps/portal-e2e-tests/
COPY node_modules ./node_modules
COPY tsconfig.json ./tsconfig.json

RUN corepack enable && yarn install --immutable

WORKDIR /app/apps/portal-api

CMD ["yarn", "test:ci"]
