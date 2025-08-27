FROM node:23-alpine

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4001
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 graphql && \
    mkdir .graphql && \
    chown graphql:nodejs .graphql

COPY --chown=graphql:nodejs node_modules ./node_modules
COPY --chown=graphql:nodejs dist ./dist
COPY --chown=graphql:nodejs packages ./packages
COPY --chown=graphql:nodejs apps/portal-api/. ./apps/portal-api/

USER graphql
EXPOSE 4001

CMD ["node", "./apps/portal-api/dist/index.js"]
