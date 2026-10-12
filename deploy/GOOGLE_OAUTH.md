# Google Sign-In Setup

Snippets uses Google sign-in to decide who may change what:

- anyone can browse and read snippets
- creating a snippet requires being signed in
- only the user who created a snippet can edit or delete it
- snippets created before sign-in was enforced have no owner and are read-only

The API enforces these rules (`401` when signed out, `403` for someone else's
snippet). The UI only mirrors them by disabling **Create Snippet** and hiding
**Edit**/**Delete** where they would fail.

When `GOOGLE_AUTH_ENABLED=false`, none of this applies: writes stay open to
everyone and the API logs a warning on startup.

---

## Requirements

Google auth only works with the database-backed API:

```bash
SNIPPETS_API_BACKEND=database
```

The `json-server` mock API has no `/auth/*` endpoints and no user records, so
with it every write stays anonymous and open.

---

## 1. Create the Google OAuth client

In the [Google Cloud console](https://console.cloud.google.com):

1. Create or select a project.
2. **Google Auth Platform → Branding**: app name, support email, and your
   domain under *Authorized domains*.
3. **Audience**: choose *External*. While the app is in *Testing*, only the
   listed test users can sign in. Click **Publish app** to open it to everyone.
   The app only uses `openid`, `email` and `profile`, so no Google verification
   review is needed.
4. **Clients → Create client → Web application**, and add the
   **Authorized JavaScript origins**:
   - `http://localhost`
   - `http://localhost:5173`
   - `https://snippets.yourdomain.com`

No redirect URI and no client secret are needed. The browser gets an ID token
from Google's button and the API verifies it against the client ID.

Official references:

- https://developers.google.com/identity/gsi/web/guides/display-button
- https://developers.google.com/identity/sign-in/web/backend-auth

---

## 2. Configure environment variables

Use the same client ID for the frontend and the API:

```bash
SNIPPETS_API_BACKEND=database

VITE_GOOGLE_AUTH_ENABLED=true
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

GOOGLE_AUTH_ENABLED=true
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
SESSION_COOKIE_SECRET=$(openssl rand -base64 48)
CORS_ORIGIN=https://snippets.yourdomain.com
```

Notes:

- `VITE_*` values are baked into the frontend bundle at build time. Changing
  them requires rebuilding the `app` image.
- `SESSION_COOKIE_SECRET` signs the session cookie. Rotating it signs everyone
  out.
- `docker-compose.prod.yml` sets `NODE_ENV=production` for the API, which
  marks the session cookie `Secure`, so it is only sent over HTTPS.

---

## 3. Local development

```bash
docker compose -f docker-compose.postgres.yml up -d
./scripts/apply-migrations.sh
SNIPPETS_API_BACKEND=database npm run dev-server
npm start
```

---

## 4. Production on the EC2 host

1. Put the variables from step 2 in `~/snippets/.env` on the host.
2. Apply migrations, including `006_add_snippet_owner.sql`. The CI migrate job
   is skipped when the `RDS_HOST` secret is unset, so run
   `scripts/apply-migrations.sh` on the host in that case.
3. Deploy (or rebuild both images) so the new `VITE_*` values are picked up.
4. If the host nginx sets a `Content-Security-Policy`, allow
   `https://accounts.google.com` for `script-src`, `frame-src` and
   `connect-src`. If it sets `Cross-Origin-Opener-Policy`, use
   `same-origin-allow-popups`.

---

## 5. Data model

Signing in upserts a row in `users` and a row in `user_identities` for the
Google subject (`sub`). New snippets store the creator in `snippets.user_id`.

To hand an existing ownerless snippet to a user:

```sql
UPDATE snippets
SET user_id = (SELECT id FROM users WHERE email = 'you@example.com')
WHERE id = 42;
```
