FROM node:23-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package managers
COPY .yarnrc.yml package.json yarn.lock ./
RUN corepack enable && \
    yarn install --immutable

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the backend
RUN corepack enable && \
    yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4001
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 graphql && \
    mkdir .graphql && \
    chown graphql:nodejs .graphql

COPY --from=builder --chown=graphql:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=graphql:nodejs /app/config ./config
COPY --from=builder --chown=graphql:nodejs /app/package.json .
COPY --from=builder --chown=graphql:nodejs /app/tests/seeds ./tests/seeds
COPY --from=builder --chown=graphql:nodejs /app/dist .
COPY --from=builder --chown=graphql:nodejs /app/src/server/mail-template ./src/server/mail-template

USER graphql
EXPOSE 4001

CMD ["node", "./index.js"]
