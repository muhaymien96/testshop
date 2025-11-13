# Test Shop — Frontend

This README explains what the frontend does, how to set it up locally, how to run it, and how to test it. It also points you to the API contract used by tests.

## Purpose
Test Shop is a lightweight demo e-commerce app designed for UI/API/E2E automation practice. The frontend is a Next.js app (app router) which calls a backend API running at `NEXT_PUBLIC_API_URL` (default: `http://localhost:3001/api`). The app uses server-side HttpOnly cookies for authentication and a server session cookie for carts.

This repository is intentionally small and deterministic so QA engineers can quickly write stable E2E tests.

## Requirements
- Node.js 18+ (recommended)
- npm or pnpm
- A running Postgres DB and the backend server (see `../backend` README for backend setup)

## Environment
Create a `.env.local` in the `frontend` folder or set environment variables when running.

Important variables:
- NEXT_PUBLIC_API_URL — URL to the backend API (example: `http://localhost:3001/api`). Default: `http://localhost:3001/api`.

## Install & Run (development)
From the `frontend` folder:

```powershell
npm install
npm run dev
```

Open http://localhost:3000 in your browser.

## Build & Run (production)
To build a production bundle:

```powershell
npm run build
npm run start
```

Note: `npm run start` will run Next's production server. For true production deployments, we recommend hosting the frontend on Vercel (recommended for Next.js), Netlify, or building a static export where appropriate.

## Running with the backend
1. Start Postgres and the backend (see `../backend/README.md`).
2. Start the frontend as above.
3. The frontend uses HttpOnly cookies for auth and will include cookies in API requests by default (axios is configured with `withCredentials: true`). When running tests, ensure the test runner preserves cookies between requests or use a browser automation tool (Playwright, Cypress).

## Exposed APIs (for testing)
A machine-readable copy of the API endpoints used by the frontend is in `API.md` in this folder. The backend also exposes `/api/admin/docs` which returns similar documentation.

## Writing Tests
We recommend using Playwright or Cypress for E2E tests.

Quick tips:
- Use the seeded test user (the backend seeder `20251113002000-seed-test-user.js`) — its email/password can be set via `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` env vars when running seeders.
- Because auth uses HttpOnly cookies, use browser-based tests to simulate a real session (or use server-side helpers that create a session cookie for tests).

Suggested test flows:
- Smoke: open landing page, navigate to products, add product to cart, checkout, assert order-confirmation shows order id.
- Auth: register/login flows, check `Order History` shows orders.
- API sanity: call `/api/admin/metrics` and `/api/admin/docs` to assert backend is up and endpoints are documented.

## Deployment notes (short)
- Frontend: deploy to Vercel for easiest Next.js support. Set `NEXT_PUBLIC_API_URL` in Vercel environment variables to point at your backend URL.
- Backend: deploy to a Node host (DigitalOcean App Platform, Heroku, Render, or a VPS). Use a process manager (pm2) or containerize with Docker.

See `API.md` for endpoint examples and how tests can interact with the API.

## Troubleshooting
- If you see CORS or cookie issues, ensure the backend `Access-Control-Allow-Origin` and `withCredentials` are configured and that your browser requests include credentials.
- If orders don't persist, check the backend logs and ensure the DB connection string is set (backend uses `DATABASE_URL`).

---

If you'd like, I can add a Playwright example test and a small `package.json` script to run it (fast smoke test). Tell me and I'll add it.