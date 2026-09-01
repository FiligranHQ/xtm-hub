# Getting started - XTM Hub Development

This guide will help you quickly set up XTM Hub for local development and contribution.

## Prerequisites

Before you start, make sure you have the following installed:

- **Node.js** (v24.19.0; see `.nvmrc`)
- **Yarn** (v4.18.0 via Corepack; see `package.json#packageManager`)
- **Docker** and **Docker Compose**
- **Git**

## Project structure

XTM Hub is composed of three main packages:

- **`portal-api`** - Backend API (Node.js + GraphQL + Apollo Server)
- **`portal-front`** - Frontend (Next.js + React + Relay)
- **`portal-e2e-tests`** - End-to-end tests (Playwright)
- **`xtm-hub-dev`** - Development Docker Compose setup

## Quick setup

### 1. Clone the repository

```bash
git clone https://github.com/FiligranHQ/xtm-hub.git
cd xtm-hub
```

### 2. Configure local settings

Create a local configuration file at `portal-api/config/local.json`:

```json
{
  "oidc_provider": {
    "issuer": "https://your-auth-provider.com",
    "client_id": "your-client-id",
    "client_secret": "your-client-secret",
    "redirect_uris": ["http://localhost:3002/auth/oidc/callback"],
    "logout_callback_url": ["http://localhost:3002/oidc/callback"],
    "response_types": ["code"]
  },
  "minio": {
    "bucketName": "xtmhubbucket",
    "region": "us-east-1",
    "endpoint": "localhost",
    "port": 9002,
    "accessKeyId": "portal",
    "secretAccessKey": "changeme",
    "useSsl": false
  },
  "database": {
    "host": "localhost",
    "port": 5434,
    "user": "portal",
    "password": "portal-password",
    "database": "cloud-portal"
  },
  "port": 4002,
  "smtp_options": {
    "host": "localhost",
    "port": 1025,
    "secure": false,
    "from": "no-reply@localhost"
  },
  "session": { // Used to keep sessions in memory for development when the backend keeps restarting.
    "name": "cloud-portal",
    "secret": "anythingShouldWorkForDev" 
  }
}
```

> **Note**: For OIDC authentication, you'll need to configure your own identity provider or use a local development setup.

### 3. Start development environment

The development environment requires **three separate terminals**:

#### Terminal 1: Start docker services

```bash
docker compose -f ./xtm-hub-dev/docker-compose.yml up
```

This starts:
- **PostgreSQL** on port `5434`
- **MinIO** on port `9002` (console on `8902`)
- **PgAdmin** on port `8888`
- **MailPit** on port `8025`

#### Terminal 2: Start backend server

```bash
cd portal-api
yarn install
yarn build
yarn start-dev
```

The API will be available at `http://localhost:4002`

Note: the first time, you need to enable corepack
```bash
corepack enable
corepack prepare yarn@4.12.0 --activate
```

#### Terminal 3: Start frontend server

```bash
cd portal-front
yarn install
yarn build
yarn dev
```

The frontend will be available at `http://localhost:3002`

### 4. Access the application

Once everything is running:

- **Frontend**: http://localhost:3002
- **API**: http://localhost:4002
- **MinIO Console**: http://localhost:8902
- **PgAdmin**: http://localhost:8888 (portal@filigran.io / portal-password)
- **MailPit**: http://localhost:8025

You can log in with default user admin@filigran.io / admin

## Development workflow

### API development

- **Development mode**: `yarn start-dev`
- **Run tests**: `yarn test`
- **Database migrations**: `yarn migrate:latest`
- **Generate types**: `yarn generate-pg-to-ts && yarn generate:ts`
- **Lint & format**: `yarn lint:fix && yarn format`

### Frontend development

- **Development mode**: `yarn dev`
- **Run tests**: `yarn test`
- **Generate GraphQL types**: `yarn relay`
- **Build**: `yarn build`
- **Lint & format**: `yarn lint && yarn format`

### E2E testing

```bash
cd portal-e2e-tests
yarn install

# Run E2E tests (make sure both API and frontend are running)
yarn test:e2e

# Run with UI
yarn test:e2e:ui

# Generate new tests
yarn generate-test-e2e
```

**Important**: For E2E testing, start the API in test mode:
```bash
cd portal-api
yarn start-dev-e2e-test
```

## Contributing

### Development setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Create a feature branch**: `git checkout -b feature/my-feature`
4. **Make your changes** and test them
5. **Commit** following the commit format below
6. **Push** to your fork and create a Pull Request

### Commit format

All commit messages must follow this format:

```
[package] <type>(<scope>): Message (#issueNumber)
```

**Types**: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`
**Packages**: `backend`, `frontend`, `doc`

**Examples**:
- `[frontend] feat(dashboard): add new card component (#123)`
- `[backend] fix(auth): handle missing token (#456)`

### Testing

Before submitting a PR, run all tests:

```bash
# Backend tests
cd portal-api
yarn test:ci

# Frontend tests
cd portal-front
yarn test:ci

# E2E tests
cd portal-e2e-tests
yarn test:e2e
```

## Troubleshooting

### Common issues

1. **Port conflicts**: Ensure ports 3002, 4002, 5434, 8888, 9002, 8902, 8025, 1025 are available
2. **Docker issues**: Verify Docker daemon is running and `docker-compose` is installed
3. **Build required**: Both packages require `yarn build` before starting development servers
4. **MinIO credentials**: Ensure `accessKeyId` and `secretAccessKey` in `local.json` match `docker-compose.yml`

### Reset development environment

```bash
# Stop and remove all containers
docker compose -f ./xtm-hub-dev/docker-compose.yml down -v

# Restart services
docker compose -f ./xtm-hub-dev/docker-compose.yml up -d

# Rebuild packages if needed
cd portal-api && yarn install && yarn build
cd ../portal-front && yarn install && yarn build
```

### Database issues

```bash
# Reset database
cd portal-api
yarn clean-db-test
yarn migrate:latest
```

### Package manager issues

If you're using an IDE like IntelliJ/WebStorm, make sure it's configured to use `yarn` instead of `npm` for running scripts.

### Authentication setup

For local development, you have a few options for OIDC authentication:

1. **Use a development auth provider** (Auth0, Keycloak, etc.)
2. **Mock authentication** for local testing
3. **Skip auth temporarily** by modifying the local configuration

Refer to the authentication documentation for detailed setup instructions.

## Getting help

- **Issues**: [GitHub Issues](https://github.com/FiligranHQ/xtm-hub/issues)
- **Beginner Issues**: [Good First Issues](https://github.com/FiligranHQ/xtm-hub/issues?q=is%3Aissue+state%3Aopen+label%3A%22good+first+issue%22)
- **Community**: [Slack Channel](https://community.filigran.io)
- **Documentation**: [Official Docs](https://docs.hub.filigran.io)

---

**Ready to contribute?** Check out our [beginner-friendly issues](https://github.com/FiligranHQ/xtm-hub/issues?q=is%3Aissue+state%3Aopen+label%3A%22good+first+issue%22) and [contributing guide](https://github.com/FiligranHQ/xtm-hub/blob/development/CONTRIBUTING.md).
