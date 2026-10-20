# Full-Stack Demo — Auth + CRUD (Next.js · TypeScript · PostgreSQL)

Reference implementation of a typical product milestone: real sign-up/sign-in with sessions and protected routes, one core resource with full CRUD, PostgreSQL schema + migrations (Prisma), and loading/empty/error states on the screens.

## Stack
- Next.js 14 (App Router) + TypeScript — UI and API routes in one codebase
- Node.js API routes with zod validation on write paths
- PostgreSQL + Prisma (schema & migrations)
- Cookie sessions, scrypt password hashing (node:crypto — no external deps)
- Playwright e2e for the auth flow

## What's inside
- `prisma/schema.prisma` — User, Session, Item models
- `src/lib/auth.ts` — password hashing, session create/verify
- `src/app/api/auth/*` — register / login / logout
- `src/app/api/items/*` — CRUD for the core resource (protected)
- `src/middleware.ts` — protected routes
- `src/app/page.tsx` — screens with loading / empty / error states
- `e2e/auth.spec.ts` — Playwright: signup → session → protected route → logout

## Run locally
```bash
cp .env.example .env   # set DATABASE_URL
npm install
npx prisma migrate dev
npm run dev
```

## Notes
Write paths validate input with zod. Sessions are httpOnly cookies. Errors return JSON with proper status codes. The UI is intentionally minimal — the focus is architecture and correctness.
