FROM node:24.5-alpine3.22 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4001
ENV HOSTNAME="0.0.0.0"

# Create user and directories
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 graphql && \
    mkdir .graphql && \
    chown graphql:nodejs .graphql

# Install production dependencies only
COPY package.json yarn.lock .yarnrc.yml ./
COPY ./apps/portal-api/package.json ./apps/portal-api/
RUN corepack enable && \
    yarn workspaces focus portal-api --production

# Copy pre-built artifacts
COPY --chown=graphql:nodejs ./dist ./
COPY --chown=graphql:nodejs ./config ./config
COPY --chown=graphql:nodejs ./tests/seeds ./tests/seeds
COPY --chown=graphql:nodejs ./src/server/mail-template ./src/server/mail-template

USER graphql
EXPOSE 4001
CMD ["node", "./index.js"]