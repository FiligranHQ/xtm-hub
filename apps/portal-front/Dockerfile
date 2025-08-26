FROM node:23-alpine

WORKDIR /app
ARG APP_VERSION=0.0.0-dev
ENV NEXT_PUBLIC_APP_VERSION=$APP_VERSION
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir .next && \
    chown nextjs:nodejs .next

COPY --chown=nextjs:nodejs node_modules ./node_modules
COPY --chown=nextjs:nodejs apps/portal-front/node_modules ./apps/portal-front/node_modules
COPY .yarnrc.yml package.json yarn.lock ./
COPY --chown=nextjs:nodejs apps/portal-front/. ./apps/portal-front/

# Set the correct permission for prerender cache

COPY --from=builder /app/apps/portal-front/public ./apps/portal-front/public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal-front/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/portal-front/.next/static ./apps/portal-front/.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "apps/portal-front/server.js"]
