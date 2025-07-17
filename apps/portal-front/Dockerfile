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
ARG APP_VERSION=0.0.0-dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY apps/portal-front/. .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_APP_VERSION=$APP_VERSION

RUN corepack enable && \
    echo "NEXT_PUBLIC_APP_VERSION=$APP_VERSION" > .env.local && \
    yarn build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Set the correct permission for prerender cache
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir .next && \
    chown nextjs:nodejs .next

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
