# TestAPP — Test Shop

Small sample e‑commerce app used for UI / API and E2E automation practice.

This repo contains:
- Frontend: Next.js (app directory) — the UI used for manual and automated testing.
- Backend: Express + Sequelize with PostgreSQL — API, migrations and seeders.

Key design choices:
- Auth is cookie-based (HttpOnly JWT in cookie `auth_token`).
- Carts and anonymous sessions are tracked server-side via an HttpOnly cookie `session_id`.

Important: automated tests and browser-based testing must include credentials (cookies) so auth and session cookies are visible to the server.

## Quick start (dev)

Prereqs: Node 18+, npm, PostgreSQL (local or Docker).

1. Create an env file (example):

```powershell
# .env (example)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
DATABASE_URL=postgresql://postgres:password@localhost:5432/testapp
PORT=3001
JWT_SECRET=devsecret
FRONTEND_ORIGIN=http://localhost:3000
COOKIE_SECURE=false
```

2. Install dependencies and run migrations/seeds for the backend:

```powershell
cd backend
npm install
npm run db:migrate
npm run db:seed:all

# Start the backend
npm run start || node src/app.js
```

3. Frontend:

```powershell
cd ..\\frontend
npm install
npm run dev
```

Open the frontend (usually http://localhost:3000) and the backend admin docs at http://localhost:3001/api/admin/docs

## Testing & debugging notes

- API docs: http://localhost:3001/api/admin/docs — documents endpoints and explains cookie-based auth.
- When writing automated tests (Playwright, Cypress, Puppeteer) remember to configure them to send cookies / include credentials so the server-side `auth_token` and `session_id` are available.

### SQL / DB testing options

- The backend ships with Sequelize migrations and seeders. Typical commands (from `backend`):

```powershell
npm install
npm run db:migrate
npm run db:seed:all
```

- If you need direct SQL access for debugging, use psql (or any Postgres client) against the `DATABASE_URL` in your `.env` file. Example:

```powershell
# connect with psql
psql "postgresql://postgres:password@localhost:5432/testapp"
# then: SELECT * FROM users;
```

If you alter model attribute names or add migrations, re-run the migration commands and, when needed, re-seed.