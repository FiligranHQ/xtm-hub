FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY .yarn ./.yarn
COPY .yarnrc.yml package.json yarn.lock ./
RUN yarn install --immutable

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the backend
RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 graphql

# Set the correct permission for prerender cache
RUN mkdir .graphql
RUN chown graphql:nodejs .graphql

COPY --from=builder --chown=graphql:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=graphql:nodejs /app/config ./config
COPY --from=builder --chown=graphql:nodejs /app/package.json .
COPY --from=builder --chown=graphql:nodejs /app/tests/seeds ./tests/seeds
COPY --from=builder --chown=graphql:nodejs /app/dist .

USER graphql

EXPOSE 4001

ENV PORT 4001
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "./index.js"]
