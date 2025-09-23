FROM node:24.5-alpine3.22 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    mkdir .next && \
    chown nextjs:nodejs .next

# Copy pre-built artifacts
COPY --chown=nextjs:nodejs ./public ./apps/portal-front/public
COPY --chown=nextjs:nodejs ./.next/standalone ./
COPY --chown=nextjs:nodejs ./.next/static ./apps/portal-front/.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "apps/portal-front/server.js"]