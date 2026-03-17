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
npm install --legacy-peer-deps
```

> `--legacy-peer-deps` is required because `react-query` v3 predates React 19
> and its published peer-dep range hasn't been updated. It works correctly at
> runtime. See the [upgrade note](#upgrading-react-query) below.

### 2. Start the mock API (json-server)

The frontend talks to a REST API. In development this is powered by
[json-server](https://github.com/typicode/json-server), which reads from
`data/db.json`.

```bash
npm run dev-server
# → API available at http://localhost:3200
```

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
| `npm run preview` | Serve the production build locally |
| `npm test` | Run tests in watch mode (vitest) |
| `npm run lint` | Lint with ESLint |
| `npm run analyze` | Bundle size visualiser (requires a prior `build`) |

---

## Local Postgres (optional)

The project includes a Docker Compose file that spins up a Postgres instance
matching the AWS RDS schema, useful for integration testing or replacing
json-server locally.

```bash
cp .env.example .env              # set POSTGRES_* vars if needed
docker compose -f docker-compose.postgres.yml up -d
```

The database is automatically initialised from the SQL files in
`db/migrations/` on first boot.

To tear it down:

```bash
docker compose -f docker-compose.postgres.yml down -v
```

---

## Testing

```bash
npm test          # interactive watch mode
npm test -- --run # single pass (used in CI)
```

Tests use [Vitest](https://vitest.dev/) and
[@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/).

---

## Deployment

The application is designed to be deployed as a Docker container behind an
nginx reverse proxy. The production stack is defined in
`docker-compose.prod.yml` — it builds the React app into static files and
serves them with nginx, with json-server running as the API on the internal
Docker network.

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

## AWS RDS migrations

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

---

## Upgrading react-query

The project currently uses `react-query` v3, which is in maintenance mode.
The actively maintained successor is
[`@tanstack/react-query`](https://tanstack.com/query/latest) v5, which has a
different import path and a revised API. Migration is straightforward but
requires touching every file that imports from `react-query`. See the
[official migration guide](https://tanstack.com/query/v5/docs/framework/react/guides/migrating-to-v5)
when you're ready to make that switch.
