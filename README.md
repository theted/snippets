# Snippets

A lightweight web app for storing and browsing code snippets, built with React 19, TypeScript, and Vite.

---

## Requirements

- [Node.js](https://nodejs.org/) ≥ 20.19 (use [nvm](https://github.com/nvm-sh/nvm): `nvm use`)
- npm ≥ 10

---

## Local development

### 1. Install dependencies

```bash
npm install
```

### 2. Start the mock API (json-server)

The frontend talks to a REST API. In development this is powered by
[json-server](https://github.com/typicode/json-server), which reads from
`data/db.json`.

```bash
npm run dev-server
# → API available at http://localhost:3200
```

`json-server` remains the default development path. The new real-database API
is feature-flagged behind `SNIPPETS_API_BACKEND=database`.

### 3. Start the frontend

In a second terminal:

```bash
npm start
# → App available at http://localhost:5173
```

The app reads `VITE_API_BASE` (defaults to `http://localhost:3200`) to know
where the API lives. You can override it in a local `.env` file:

```bash
cp .env.example .env
# edit VITE_API_BASE if needed
```

### Other commands

| Command | Description |
|---|---|
| `npm run build` | Production build → `dist/` |
| `npm run build:api` | Compile the database-backed API server → `server-dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run tests once and exit |
| `npm run test:watch` | Run tests in watch mode (vitest) |
| `npm run typecheck` | Type-check both the frontend and the database-backed API |
| `npm run lint` | Lint with ESLint |
| `npm run analyze` | Bundle size visualiser (requires a prior `build`) |

---

## Local Postgres (optional, feature-flagged API)

The repository now includes a typed backend API that talks to Postgres while
preserving the current `/snippets` REST contract used by the frontend.
The default dev flow still uses `json-server`, but you can opt into the real
database path when needed.

```bash
cp .env.example .env
docker compose -f docker-compose.postgres.yml up -d
```

The `postgres_data` named volume keeps data across container restarts.

To run the database-backed API locally against that Postgres instance:

```bash
SNIPPETS_API_BACKEND=database npm run dev-server
```

Or run both Postgres and the database API in Docker:

```bash
docker compose -f docker-compose.postgres.yml --profile database-api up -d
```

The database is initialised from the SQL files in `db/migrations/` on first
boot. For existing databases, apply migrations explicitly:

```bash
./scripts/apply-migrations.sh
```

To tear it down:

```bash
docker compose -f docker-compose.postgres.yml down
```

To intentionally delete the persisted local data as well:

```bash
docker compose -f docker-compose.postgres.yml down -v
```

## Google Auth Preview

Google sign-in is now prepared behind feature flags, but it only works with the
database-backed API, not with the default `json-server` path.

Setup and deployment notes live in:

- **[deploy/GOOGLE_OAUTH.md](./deploy/GOOGLE_OAUTH.md)**

Current behavior:

- Google users can sign in
- user records are stored in Postgres
- snippet posting is still open to everyone

---

## Testing

```bash
npm test           # single pass
npm run test:watch # interactive watch mode
```

Tests use [Vitest](https://vitest.dev/) and
[@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/).

---

## Deployment

The application is designed to be deployed as a Docker container behind an
nginx reverse proxy. The production stack is defined in
`docker-compose.prod.yml`.

The frontend container is still a static SPA served by nginx. The API container
now supports two runtime modes:

- `SNIPPETS_API_BACKEND=json-server` keeps the current JSON file workflow.
- `SNIPPETS_API_BACKEND=database` runs the typed Postgres-backed API.

When the database backend is enabled, point it at an external Postgres
instance using `DATABASE_URL` or `POSTGRES_*` variables.

If Postgres runs in another Docker container on the same EC2 host, use a shared
Docker network. The exact setup is documented in
**[deploy/POSTGRES_SAME_HOST.md](./deploy/POSTGRES_SAME_HOST.md)**.

If you also want Google sign-in in that deployment, follow
**[deploy/GOOGLE_OAUTH.md](./deploy/GOOGLE_OAUTH.md)** as well.

See **[DEPLOYING.md](./DEPLOYING.md)** for the full guide covering:
- One-time EC2 setup
- Configuring the nginx vhost on the EC2 instance
- The GitHub Actions CD workflow
- Required secrets

### Other deployment options

The app is a standard static-file SPA after `npm run build`. The `dist/`
folder can be served in many ways:

**Fly.io**
```bash
fly launch    # detects the Dockerfile automatically
fly deploy
```

**Railway / Render**
Point the service at this repository. Set the build command to
`npm run build` and the start command to `npm run preview` (or serve `dist/`
with a static-site service type). Set `VITE_API_BASE` as an environment
variable in the dashboard.

**Netlify / Vercel (static hosting)**
If you have a separately hosted API, you can deploy just the frontend:
```bash
npm run build
# then drag-and-drop dist/ in the Netlify UI, or:
npx netlify-cli deploy --prod --dir dist
```
Add a `_redirects` file (Netlify) or `vercel.json` rewrite rule to send all
paths to `index.html` for client-side routing to work.

**Plain VPS / bare nginx**
```bash
npm run build
rsync -av dist/ user@yourserver:/var/www/snippets/
```
Configure nginx to serve `/var/www/snippets` with `try_files $uri /index.html`.

**Docker (standalone)**
```bash
docker build -t snippets .
docker run -p 5566:80 snippets
```

---

## Postgres migrations

Database migrations are applied in CI via `.github/workflows/deploy-aws.yml`.

Required GitHub secrets:

| Secret | Description |
|---|---|
| `RDS_HOST` | RDS endpoint hostname |
| `RDS_PORT` | Port (default 5432) |
| `RDS_DB` | Database name |
| `RDS_USER` | Database user |
| `RDS_PASSWORD` | Database password |

To run migrations locally (requires `psql`):

```bash
./scripts/apply-migrations.sh
```

The script accepts either:

- `DATABASE_URL`
- `POSTGRES_*`
- `RDS_*`

---

## Data Fetching

The app uses [`@tanstack/react-query`](https://tanstack.com/query/latest)
v5 for client-side server-state management and
[`@tanstack/react-query-devtools`](https://tanstack.com/query/latest/docs/framework/react/devtools)
in development.
