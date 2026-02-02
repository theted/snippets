# Snippets webapp!
Simple snippets webapp

## Startup
Start the frontend
```
npm start
```

Start data server
```
npm run dev-server
```

## Postgres (local development)
This repo now includes a Postgres setup that mirrors the intended AWS RDS schema.

1. Copy `.env.example` to `.env` and adjust values if needed.
2. Start Postgres:
```
docker compose -f docker-compose.postgres.yml up -d
```
3. Confirm the database is healthy:
```
docker compose -f docker-compose.postgres.yml ps
```

The database is initialized from `db/migrations` on first boot.

## AWS RDS migrations
Database migrations are applied in CI via `.github/workflows/deploy-aws.yml`.
Secrets expected in GitHub:
- `RDS_HOST`
- `RDS_PORT`
- `RDS_DB`
- `RDS_USER`
- `RDS_PASSWORD`

You can also run migrations locally if you have `psql` installed:
```
./scripts/apply-migrations.sh
```

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
