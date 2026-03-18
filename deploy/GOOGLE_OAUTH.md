# Google OAuth Preview Setup

This repository now supports an optional Google sign-in preview.

Current behavior:

- users can sign in with Google
- the backend verifies the Google ID token
- the backend stores user records in Postgres
- the app keeps a lightweight signed session cookie
- snippet creation is still unrestricted and anonymous for now

That last point is intentional. Login exists as preparation, not enforcement.

---

## Requirements

Google auth only works with the database-backed API.

It does not work with the default `json-server` mock API, because the mock API
has no `/auth/*` endpoints and no database for user records.

Use:

```bash
SNIPPETS_API_BACKEND=database
```

---

## 1. Create the Google OAuth client

In Google Cloud:

1. Create or select a project.
2. Configure the OAuth consent screen.
3. Create an OAuth 2.0 Client ID for a Web application.
4. Add your authorized JavaScript origins.

Typical origins:

- `http://localhost:5173`
- `https://snippets.yourdomain.com`

For this implementation, the Google client ID is used in both places:

- frontend button initialization
- backend ID-token verification

You do not need a client secret for this specific flow.

Official references:

- https://developers.google.com/identity/gsi/web/guides/display-button
- https://developers.google.com/identity/sign-in/web/backend-auth

---

## 2. Configure environment variables

Set these in your local `.env` or on the EC2 host:

```bash
VITE_GOOGLE_AUTH_ENABLED=true
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

GOOGLE_AUTH_ENABLED=true
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
SESSION_COOKIE_SECRET=replace-this-with-a-long-random-secret
```

Recommendations:

- keep `SESSION_COOKIE_SECRET` long and random
- use the same Google client ID on frontend and backend
- leave Google auth disabled in environments still using `json-server`

---

## 3. Local development

Start the database-backed API:

```bash
docker compose -f docker-compose.postgres.yml up -d
SNIPPETS_API_BACKEND=database npm run dev-server
```

Then start the frontend:

```bash
npm start
```

The auth panel will appear only when:

- `VITE_GOOGLE_AUTH_ENABLED=true`
- `VITE_GOOGLE_CLIENT_ID` is set

---

## 4. Production on the EC2 host

If you are using the same-host shared Postgres setup, combine this guide with:

- `deploy/POSTGRES_SAME_HOST.md`

At minimum, the app/API environment needs:

```bash
SNIPPETS_API_BACKEND=database
GOOGLE_AUTH_ENABLED=true
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
SESSION_COOKIE_SECRET=replace-this-with-a-long-random-secret
```

If the app is served from `https://snippets.yourdomain.com`, make sure that
origin is listed in the Google OAuth client configuration.

---

## 5. What is stored in the database

When a user signs in successfully, the backend upserts:

- a row in `users`
- a row in `user_identities` for the Google subject (`sub`)

That prepares the schema for future ownership and moderation features without
blocking anonymous usage today.

---

## 6. Current limitations

- snippet writes are not tied to the signed-in user yet
- anonymous users can still create, edit, and delete snippets
- Google auth is a preview capability, not an authorization layer yet

That matches the current product direction you described.
