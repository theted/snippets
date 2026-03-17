# Deployment Guide

The application is deployed to a single AWS EC2 instance using Docker Compose.
An nginx reverse proxy already runs on the instance and forwards traffic from the
public domain to the app container.

---

## Architecture

```
Internet
   │
   ▼
EC2 nginx (port 80/443)          ← terminates TLS, forwards domain traffic
   │
   ▼  proxy_pass http://127.0.0.1:5566
App container  (nginx:alpine, port 5566 on host)
   ├── serves React SPA static files at /
   └── proxies /api/* → http://api:3200/*  (Docker-internal network)
                                   │
                            API container  (json-server, port 3200 internal)
                            reads/writes ./data/db.json
```

The React bundle is built with `VITE_API_BASE=/api` so all browser fetch calls
go to `/api/...`, which the in-container nginx forwards to json-server.

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

# 3. Configure EC2 nginx for the domain
sudo cp ~/snippets/deploy/nginx-site.conf.example \
        /etc/nginx/sites-available/snippets
# Edit the file: replace snippets.yourdomain.com with the real domain,
# and update the SSL certificate paths.
sudo ln -s /etc/nginx/sites-available/snippets \
           /etc/nginx/sites-enabled/snippets
sudo nginx -t && sudo systemctl reload nginx

# 4. Start the stack for the first time
cd ~/snippets
docker compose -f docker-compose.prod.yml up -d --build
```

---

## Continuous deployment (GitHub Actions)

The workflow at `.github/workflows/deploy.yml` triggers on every push to `main`
and on manual dispatch. It SSHs into the EC2 instance and runs:

```bash
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
docker image prune -f
```

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `EC2_HOST` | Public IP address or hostname of the EC2 instance |
| `EC2_USER` | SSH username (e.g. `ubuntu` for Ubuntu AMIs, `ec2-user` for Amazon Linux) |
| `EC2_SSH_KEY` | PEM-formatted private key whose public key is in `~/.ssh/authorized_keys` on the instance |

Add these under **Settings → Secrets and variables → Actions** in the GitHub
repository.

---

## Docker Compose services

| Service | Image | Exposed port | Purpose |
|---|---|---|---|
| `app` | built from `Dockerfile` (nginx:alpine) | `5566:80` | Serves the React SPA and proxies `/api/` |
| `api` | `vimagick/json-server` | internal only | REST API backed by `data/db.json` |

Both services restart automatically (`restart: unless-stopped`).

---

## Files

| File | Purpose |
|---|---|
| `Dockerfile` | Multi-stage build: `node:20-alpine` compiles the React app, `nginx:alpine` serves the result |
| `nginx.conf` | nginx config used **inside** the app container |
| `docker-compose.prod.yml` | Production Compose stack |
| `deploy/nginx-site.conf.example` | Template for the EC2-level nginx reverse-proxy vhost |
| `.github/workflows/deploy.yml` | CI/CD deployment workflow |

---

## Updating the stack manually

```bash
ssh $EC2_USER@$EC2_HOST
cd ~/snippets
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

## Viewing logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# App only
docker compose -f docker-compose.prod.yml logs -f app
```

## Stopping the stack

```bash
docker compose -f docker-compose.prod.yml down
```
