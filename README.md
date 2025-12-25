# Dev Event Platform

Comprehensive documentation for the Dev Event Platform — a full-stack event-management application built with Next.js (App Router) and TypeScript.

This repository contains server and client components, API routes for events and bookings, authentication using better-auth, MongoDB-backed models via Mongoose, and a small UI component library.

---

## Quick summary

- Framework: Next.js 16 (App Router)
- Language: TypeScript
- Runtime: Node.js
- Database: MongoDB (Mongoose)
- Authentication: better-auth
- Image hosting: Cloudinary (optional)

Project scripts (from package.json):

- npm run dev — start dev server (next dev)
- npm run build — production build (next build)
- npm run start — start built app (next start)
- npm run lint — run ESLint

---

## Getting started (local)

1. Clone the repository and install dependencies:

```powershell
npm install
```

2. Create a `.env` file in the project root (or use `.env.local`) with the required environment variables (example below).

3. Run the dev server:

```powershell
npm run dev
```

Open http://localhost:3000

---

## Required environment variables

Set these in `.env.local` for local development and in your hosting platform for production (for example, Vercel's Environment Variables):

- MONGODB_URI — MongoDB connection string (required)
- NEXT_PUBLIC_BASE_URL — Public base URL (e.g., http://localhost:3000). Note: server code should use server-side DB access instead of calling this URL.
- CLOUDINARY_URL — Cloudinary connection string (optional, for image uploads)
- GOOGLE_CLIENT_ID — Google OAuth client id (optional)
- GOOGLE_CLIENT_SECRET — Google OAuth client secret (optional)
- BETTER_AUTH_URI — better-auth base URL (usually same as NEXT_PUBLIC_BASE_URL)
- BETTER_AUTH_SECRET — better-auth secret
- NEXT_PUBLIC_POSTHOG_KEY — PostHog client key (optional)
- NEXT_PUBLIC_POSTHOG_HOST — PostHog host (optional)

Notes:

- Keep secrets like `MONGODB_URI` and `BETTER_AUTH_SECRET` out of version control.

---

## Project structure (high level)

Key folders and files:

- `app/` — Next.js App Router pages, server and client components, API routes (e.g., `app/api/events/route.ts`)
- `components/` — Reusable React components (Event list, Event form, modals)
- `database/` — Mongoose models (e.g., `event.model.ts`, `booking.model.ts`)
- `lib/` — Helpers and utilities (auth helpers, mongodb connector, server actions)
- `public/` — Static assets and uploads
- `documentation/` — Additional project documentation (architecture, deployment, security)

See the `documentation/` folder for detailed guides.

---

## How data fetching is handled

- Server components (in the `app/` directory) can access server-only modules (database models) directly. This is preferred for prerendering and build-time rendering.
- API routes are available under `app/api/*` and are used by the client or external callers. Avoid fetching your own API routes during prerender; instead, call the database directly from server components to prevent build-time network errors.

Example: previously a fetch to `${NEXT_PUBLIC_BASE_URL}/api/events` during prerender could receive a non-JSON HTML response from Vercel (deploy-status page) and cause `JSON.parse` to fail. Server-side DB queries avoid this class of errors.

---

## API reference (high level)

- GET `/api/events` — Returns `{ message, events }` (server route in `app/api/events/route.ts`).
- POST `/api/events` — Create event (authenticated)
- PUT `/api/events` — Update event (authenticated, ownership enforced)
- DELETE `/api/events` — Delete event (authenticated, ownership enforced)

Authentication and session helpers are implemented in `lib/auth-helpers.ts` and used across server actions and API routes.

---

## Common problems & troubleshooting

- Prerender/build-time JSON parse errors: If your app fetches your own API route during build/prerender and the host returns an HTML status page (for example when Vercel shows a deploy message), `response.json()` will fail with `Unexpected token ...`. Fix: call the database directly from server components or validate the response before parsing.
- Uncached data accessed outside Suspense during build: Next.js will fail prerender if a route performs blocking uncached operations in a way that is not wrapped in `<Suspense>`. Inspect the page mentioned in the build error and move data fetching into a cached server function or wrap UI that needs it with `<Suspense>` and a fallback.

If you see build errors, run in development to get richer stack traces:

```powershell
npm run dev
```

Or run a production build with debug prerender:

```powershell
npx next build --debug-prerender
```

---

## Tests & recommended checks

- Unit tests: none included by default. Add Jest / Vitest for unit tests of utilities.
- Linting: `npm run lint` (ESLint)

CI suggestion: run `npm run build` and `npm run lint` in CI to catch build-time or lint issues early.

---

## Deployment

This project is compatible with Vercel (recommended) or any platform that supports Next.js apps. See `documentation/DEPLOYMENT.md` for detailed deployment instructions and common environment variable considerations.

---

## Contributing

1. Fork the repo and create a feature branch.
2. Run `npm install` and `npm run dev`.
3. Open a PR describing the change.

Please follow TypeScript typing and keep server-only secrets out of the client bundle.

---

## Acknowledgements

Project skeleton inspired by common Next.js + TypeScript patterns and the original project author.

---

For more detailed internals, read the Markdown files inside the `documentation/` folder (Event management, DB consolidation, Security notes, etc.).
