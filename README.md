# TestAPP — Test Shop

Small sample e‑commerce app used for UI / API / E2E automation practice.

This README describes:
- how to run locally with PostgreSQL (recommended)
- quick dev/start steps
- database (Prisma) setup and seeding
- deployment options to make the app publicly accessible

---

## Quick overview

- frontend: Next.js (app directory)
- backend: Express (API)
- DB (recommended): PostgreSQL with Prisma (keeps data realistic for automation)
- Local DB: run Postgres in Docker Compose (fast to start/reset)
- Useful for: functional tests, E2E tests, CI seeding/reset, demoing failure modes

---

## Prerequisites

- Node 18+ and npm
- Docker & Docker Compose (for local Postgres)
- Optional: `pnpm` or `yarn` if you prefer
- (For deployment) accounts for Vercel / Render / Railway / Fly / Heroku

---

## Files you should add (examples)

Create a `.env` (or use env vars in Docker/hosting):

````bash
// filepath: c:\Users\Bonline\TestAPP\.env.example
NEXT_PUBLIC_API_URL=http://localhost:3001/api
DATABASE_URL=postgresql://postgres:password@db:5432/testapp?schema=public
PORT=3001