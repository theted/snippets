# Deployment Guide

The application is deployed to a single AWS EC2 instance using Docker Compose.
An nginx reverse proxy already runs on the instance and forwards traffic from
the public domain to the app container.

---

## Architecture

```
Internet
   │
   ▼
EC2 nginx (port 80/443)          ← terminates TLS, handles HTTP→HTTPS redirect
   │
   ▼  proxy_pass http://127.0.0.1:5566
App container  (nginx:alpine, port 5566 on host)
   ├── serves React SPA static files at /
   └── proxies /api/* → http://api:3200  (Docker-internal network)
                                │
                         API container  (Node/Fastify, port 3200 internal)
                         ├── json-server mode  → reads/writes ./data/db.json
                         └── database mode     → connects to Postgres
                                                        │
                                              Separate Postgres container
                                              on the same Docker network
                                              (or AWS RDS)
```

The React bundle is built with `VITE_API_BASE=/api` so all browser fetch calls
go to `/api/...`, which the in-container nginx strips and forwards to the API.

---

## Pre-deployment checklist

Before the first deploy, confirm each item below.

### EC2 instance
- [ ] Docker and the Compose plugin are installed
- [ ] The deploy user (`ubuntu` or similar) is in the `docker` group
- [ ] The repo is cloned at `~/snippets`
- [ ] The EC2-level nginx is configured, tested (`nginx -t`), and active
- [ ] A TLS certificate is issued (certbot/Let's Encrypt recommended)
- [ ] The production `.env` file exists at `~/snippets/.env`
- [ ] The `.env` contains a strong `SESSION_COOKIE_SECRET`
- [ ] The `.env` sets `CORS_ORIGIN` to the public domain (e.g. `https://snippets.example.com`)

### GitHub repository
- [ ] All required GitHub Secrets are set (see table below)
- [ ] `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY` are set for the deploy job
- [ ] `RDS_*` secrets are set if using a database backend (migrate job)
- [ ] Main branch protection allows the Actions bot to push (if branch protection is on)

### Database (if using database backend)
- [ ] Postgres container or RDS instance is running
- [ ] Migrations have been applied at least once (`scripts/apply-migrations.sh`)
- [ ] The API can reach Postgres (same Docker network or correct `POSTGRES_HOST`)

---

## One-time EC2 setup

SSH into the instance and run:

```bash
# 1. Install Docker and the Compose plugin
sudo apt update && sudo apt install -y docker.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker

# 2. Clone the repository
git clone git@github.com:<org>/snippets.git ~/snippets
cd ~/snippets

# 3. Create the production .env file (see env var reference below)
cp .env.example .env
nano .env   # fill in all required values

# 4. Configure the EC2-level nginx vhost
sudo cp deploy/nginx-site.conf.example /etc/nginx/sites-available/snippets
# Edit the file — replace the placeholder domain and certificate paths
sudo nano /etc/nginx/sites-available/snippets
sudo ln -s /etc/nginx/sites-available/snippets \
           /etc/nginx/sites-enabled/snippets
sudo nginx -t && sudo systemctl reload nginx

# 5. Issue a TLS certificate (if not already done)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d snippets.yourdomain.com

# 6. Start the stack for the first time
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Environment variables

Create `~/snippets/.env` on the EC2 host. Docker Compose automatically reads
this file. Variables not listed here use the defaults shown in
`docker-compose.prod.yml`.

### Always required

| Variable | Example | Description |
|---|---|---|
| `SESSION_COOKIE_SECRET` | *(random 32+ char string)* | Signs session cookies. **Must be changed from the default.** Generate with `openssl rand -hex 32`. |
| `CORS_ORIGIN` | `https://snippets.example.com` | Restricts CORS to your domain. If omitted, all origins are allowed (unsafe in production). |

### Required for database backend

| Variable | Example | Description |
|---|---|---|
| `SNIPPETS_API_BACKEND` | `database` | Set to `database` to use Postgres instead of the json-server mock. |
| `POSTGRES_HOST` | `shared-postgres` | Hostname of the Postgres container or RDS endpoint. |
| `POSTGRES_DB` | `snippets` | Database name. |
| `POSTGRES_USER` | `snippets` | Postgres user. |
| `POSTGRES_PASSWORD` | *(secret)* | Postgres password. |
| `POSTGRES_PORT` | `5432` | Postgres port (default `5432`). |
| `POSTGRES_SSL` | `true` | Set `true` for RDS/managed Postgres; `false` for same-host Docker. |

> **Note:** `POSTGRES_USE_LOCAL` is always `true` inside the prod API container
> (hardcoded in `docker-compose.prod.yml`). This prevents the API process from
> trying to start a Docker container from inside Docker, which would fail.
> Postgres is always an external service in production.

### Optional

| Variable | Example | Description |
|---|---|---|
| `GOOGLE_AUTH_ENABLED` | `true` | Enable the Google sign-in preview. Requires database backend. |
| `GOOGLE_CLIENT_ID` | `123….apps.googleusercontent.com` | Google OAuth client ID (same value for frontend and backend). |
| `SESSION_COOKIE_NAME` | `snippets_session` | Cookie name (default is fine). |

---

## GitHub Secrets

Add these under **Settings → Secrets and variables → Actions**.

### Deploy job (always required)

| Secret | Description |
|---|---|
| `EC2_HOST` | Public IP or hostname of the EC2 instance |
| `EC2_USER` | SSH username (`ubuntu` for Ubuntu AMIs, `ec2-user` for Amazon Linux) |
| `EC2_SSH_KEY` | PEM-formatted private key — the matching public key must be in `~/.ssh/authorized_keys` on the instance |

### Migrate job (required for database backend)

| Secret | Description |
|---|---|
| `RDS_HOST` | Postgres hostname reachable from GitHub Actions (public RDS endpoint, or omit to skip migrations) |
| `RDS_PORT` | Postgres port (default `5432`) |
| `RDS_DB` | Database name |
| `RDS_USER` | Postgres user |
| `RDS_PASSWORD` | Postgres password |

> If `RDS_HOST` is not set, the migrate job logs a message and exits cleanly —
> it does not block deployment. This lets teams using `json-server` mode deploy
> without configuring database secrets.

---

## CI/CD flow

Every push to `main` (and manual dispatches) runs three jobs in this order:

```
test ──┬── migrate ──┐
       └─────────────┴── deploy
```

1. **test** — runs `npm test` (Vitest). Blocks everything on failure.
2. **migrate** — applies all SQL files in `db/migrations/` in alphabetical
   order against the RDS target. Skipped when `RDS_HOST` secret is empty.
   Runs **before** deploy so the schema is never behind the running code.
3. **deploy** — SSHs into the EC2 instance, pulls the latest code, and
   rebuilds + restarts the Docker Compose stack.

Pull requests only run `test`; the migrate and deploy jobs are skipped.

---

## Docker Compose services (production)

| Service | Dockerfile | Exposed port | Purpose |
|---|---|---|---|
| `api` | `Dockerfile.api` | internal only (3200) | Fastify API or json-server |
| `app` | `Dockerfile` | `5566:80` | React SPA + nginx proxy to `/api/` |

Both services use `restart: unless-stopped`.

---

## Files reference

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage: Node builds the React app, nginx:alpine serves it |
| `Dockerfile.api` | Node runtime for the API container |
| `nginx.conf` | nginx config **inside** the app container (SPA routing + API proxy) |
| `docker-compose.prod.yml` | Production Compose stack |
| `docker-compose.prod.external-postgres.yml` | Overlay for same-host shared-network Postgres |
| `deploy/nginx-site.conf.example` | Template for the EC2-level nginx vhost (TLS termination) |
| `deploy/POSTGRES_SAME_HOST.md` | Guide: running Postgres in Docker on the same EC2 host |
| `deploy/GOOGLE_OAUTH.md` | Guide: enabling the Google sign-in preview |
| `scripts/apply-migrations.sh` | Runs all SQL migrations — idempotent, safe to re-run |
| `.github/workflows/deploy.yml` | CI/CD pipeline |

---

## Database backend setup

### Option A — Same-host Docker Postgres (recommended for single-server setups)

Postgres runs in its own container on the same EC2 instance, connected to the
API via a shared Docker bridge network. No public Postgres port is exposed.

Follow **[deploy/POSTGRES_SAME_HOST.md](./deploy/POSTGRES_SAME_HOST.md)** for
the full setup.

Summary:
```bash
# On EC2: create the shared network once
docker network create shared-services

# Start Postgres using the example compose file (or your own)
docker compose -f deploy/docker-compose.shared-postgres.example.yml up -d

# Apply migrations
POSTGRES_HOST=shared-postgres \
POSTGRES_DB=snippets \
POSTGRES_USER=snippets \
POSTGRES_PASSWORD=<secret> \
./scripts/apply-migrations.sh

# Start the app stack with the external-postgres overlay
docker compose \
  -f docker-compose.prod.yml \
  -f docker-compose.prod.external-postgres.yml \
  up -d --build
```

### Option B — AWS RDS

Set `POSTGRES_HOST`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, and
`POSTGRES_SSL=true` in `~/snippets/.env`. The API container connects directly.

Migrations run from GitHub Actions (the `migrate` job), so the RDS instance
must accept connections from GitHub Actions IP ranges. Configure the RDS
security group accordingly, or restrict to specific ranges from
[GitHub's published IP list](https://api.github.com/meta).

Alternatively, apply migrations manually from the EC2 instance (which may
already be in the same VPC):

```bash
cd ~/snippets
POSTGRES_HOST=<rds-endpoint> \
POSTGRES_DB=snippets \
POSTGRES_USER=snippets \
POSTGRES_PASSWORD=<secret> \
POSTGRES_SSL=true \
./scripts/apply-migrations.sh
```

---

## Applying migrations manually

The migration script is idempotent — every SQL file uses `IF NOT EXISTS` or
equivalent guards. Re-running it against an already-migrated database is safe.

```bash
ssh $EC2_USER@$EC2_HOST
cd ~/snippets

# For same-host Docker Postgres:
POSTGRES_HOST=shared-postgres \
POSTGRES_DB=snippets \
POSTGRES_USER=snippets \
POSTGRES_PASSWORD=<secret> \
./scripts/apply-migrations.sh

# For RDS:
POSTGRES_HOST=<rds-endpoint> \
POSTGRES_SSL=true \
POSTGRES_DB=snippets \
POSTGRES_USER=snippets \
POSTGRES_PASSWORD=<secret> \
./scripts/apply-migrations.sh
```

---

## Updating the stack manually

```bash
ssh $EC2_USER@$EC2_HOST
cd ~/snippets
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
docker image prune -f
```

If using the external-Postgres overlay, include it in all compose commands:

```bash
docker compose \
  -f docker-compose.prod.yml \
  -f docker-compose.prod.external-postgres.yml \
  up -d --build
```

---

## Viewing logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# API only (useful for debugging database connection errors)
docker compose -f docker-compose.prod.yml logs -f api

# App (nginx) only
docker compose -f docker-compose.prod.yml logs -f app
```

---

## Stopping the stack

```bash
docker compose -f docker-compose.prod.yml down
```

---

## Troubleshooting

### API exits immediately in database mode

Check `docker compose logs api`. Common causes:

- `POSTGRES_HOST` is not set or unreachable — the Fastify app crashes on pool
  connection failure at startup.
- `SESSION_COOKIE_SECRET` is empty — the config schema rejects a missing secret.
- The containers are not on the same Docker network (same-host setup) — verify
  with `docker network inspect shared-services`.

### Migrations fail with "column already exists"

The SQL files use `IF NOT EXISTS` guards. If you see this error, the guard is
missing from a specific migration. Running `./scripts/apply-migrations.sh`
again is safe — already-applied idempotent migrations will no-op.

### 502 Bad Gateway from EC2 nginx

The app container is likely not running or not yet ready.

```bash
# Check container status
docker compose -f docker-compose.prod.yml ps

# Check if port 5566 is listening
ss -tlnp | grep 5566
```

### CORS errors in the browser

`CORS_ORIGIN` is not set or does not match the origin the browser is using.
Set `CORS_ORIGIN=https://snippets.yourdomain.com` in `~/snippets/.env` and
restart the API container:

```bash
docker compose -f docker-compose.prod.yml up -d api
```
