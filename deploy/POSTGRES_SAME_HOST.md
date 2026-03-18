# Same-Host Postgres Setup

This guide covers the production shape where:

- the `snippets` app runs on an EC2 instance in Docker
- Postgres also runs on that same EC2 instance, but in a different container
- the Postgres container is managed outside this repository

The recommended communication path is a shared Docker bridge network, not a
public port.

---

## Recommended topology

```
snippets-app container ─┐
snippets-api container ─┼── Docker network: shared-services ── shared-postgres container
other-service container ┘
```

All containers join the same user-defined Docker network. The `snippets` API
connects to Postgres by Docker DNS name, for example `shared-postgres:5432`.

That means:

- no public Postgres port is required
- no EC2 security-group rule is required for app-to-db traffic
- multiple services on the same host can reuse the same database container

---

## 1. Create the shared Docker network

Run this once on the EC2 host:

```bash
docker network create shared-services
```

If it already exists, Docker will tell you.

---

## 2. Run the Postgres container on that network

Your database may be managed by another repository or another team. The only
requirements for compatibility with this repo are:

- the Postgres container joins `shared-services`
- it exposes port `5432` inside that network
- it has a stable network alias, for example `shared-postgres`

An example Compose file is included at
`deploy/docker-compose.shared-postgres.example.yml`.

The important part is this network block:

```yaml
networks:
  shared-services:
    external: true
    name: shared-services
```

and this service attachment:

```yaml
services:
  postgres:
    networks:
      shared-services:
        aliases:
          - shared-postgres
```

If you want host-level `psql` access as well, add:

```yaml
ports:
  - "127.0.0.1:5432:5432"
```

Bind to `127.0.0.1`, not `0.0.0.0`, unless you explicitly want remote access.

---

## 3. Configure this app to use the shared Postgres container

This repo includes an override file for that setup:

`docker-compose.prod.external-postgres.yml`

It does two things:

- switches the API to `SNIPPETS_API_BACKEND=database`
- attaches the API container to the external `shared-services` network

Set the environment variables on the EC2 host:

```bash
export SNIPPETS_API_BACKEND=database
export SHARED_POSTGRES_NETWORK=shared-services
export POSTGRES_HOST=shared-postgres
export POSTGRES_PORT=5432
export POSTGRES_DB=snippets
export POSTGRES_USER=snippets
export POSTGRES_PASSWORD=change-me
export POSTGRES_SSL=false
```

Then start the app stack with both Compose files:

```bash
docker compose \
  -f docker-compose.prod.yml \
  -f docker-compose.prod.external-postgres.yml \
  up -d --build
```

The `api` container will then resolve `shared-postgres` through Docker DNS and
connect to that container over the shared network.

---

## 4. Apply migrations

The app does not auto-run SQL migrations in production. Run them explicitly.

From the EC2 host:

```bash
cd ~/snippets
export POSTGRES_HOST=shared-postgres
export POSTGRES_PORT=5432
export POSTGRES_DB=snippets
export POSTGRES_USER=snippets
export POSTGRES_PASSWORD=change-me
./scripts/apply-migrations.sh
```

If `psql` is not installed on the host, install the client:

```bash
sudo apt update
sudo apt install -y postgresql-client
```

---

## 5. Verify connectivity

Check the API logs:

```bash
docker compose \
  -f docker-compose.prod.yml \
  -f docker-compose.prod.external-postgres.yml \
  logs -f api
```

If the database hostname is correct and the containers share the same Docker
network, the API should start without connection errors.

You can also verify DNS resolution from inside the API container:

```bash
docker compose \
  -f docker-compose.prod.yml \
  -f docker-compose.prod.external-postgres.yml \
  exec api getent hosts shared-postgres
```

---

## 6. Operational notes

- Prefer Docker-network communication over host-port communication when both
  containers live on the same EC2 host.
- Keep Postgres persistence in a named Docker volume or a mounted host path.
- If another team manages the Postgres stack, agree on two stable values:
  the shared network name and the Postgres network alias.
- This repo only needs credentials plus the hostname visible on that shared
  network.

---

## Future move to externally managed Postgres

If Postgres later moves off-host, the app can switch without changing its API
contract. Replace `POSTGRES_HOST=shared-postgres` with either:

- `DATABASE_URL=postgres://...`
- `POSTGRES_HOST=<real-hostname>` plus the other `POSTGRES_*` variables

In that case you can stop using `docker-compose.prod.external-postgres.yml`,
because the extra shared Docker network is no longer needed.
