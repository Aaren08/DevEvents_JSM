# Architecture Overview

This file explains how the major parts of the Dev Event Platform fit together.

## App router & server/client components

- The project uses Next.js App Router (`app/` directory).
- Pages in `app/` are server components by default and can perform server-side async work (connect to DB, call server actions).
- Client components are marked with `'use client'` at the top and are used for interactive UI (modals, forms, event card actions).

## Data layer

- Mongoose models live in `database/` (e.g., `event.model.ts`, `booking.model.ts`).
- A central `lib/mongodb.ts` exposes `connectDB()` and can also expose the underlying native client for libraries that need it.
- Server components use `connectDB()` + Mongoose models directly for prerender-safe DB access.

## Authentication

- Authentication is handled via the `better-auth` package configured in `lib/auth.ts` and helpers in `lib/auth-helpers.ts`.
- Server-side session helpers (`requireAuth()`, `getServerSession()`) call `auth.api.getSession({ headers: await headers() })` so sessions are read server-side and cannot be spoofed.

## API routes

- API routes are implemented under `app/api/*/route.ts` and export HTTP method handlers (GET, POST, PUT, DELETE).
- API routes are useful for client-side interactions or third-party calls. For server-side rendering and prerendering, prefer direct DB calls.

## Server actions and lib/actions

- Server actions (files in `lib/actions/`) contain higher-level server-only logic (e.g., `getUserCreatedEvents`, `createEvent` action wrappers) and are invoked from server components or server actions.
- Actions centralize security checks (calling `requireAuth()`), DB access, and business rules.

## Components

- `components/` contains presentational and interactive components. Examples:
  - `EventLists.tsx` — list of event cards
  - `EventDetails.tsx` — event detail view (may fetch event server-side)
  - `ManageEvent.tsx` — table-based management UI for user-created events
  - `EventForm.tsx` — form for creating/updating events (client-side, posts to API routes)

## Uploads and external services

- Cloudinary is used for image uploads (uploader in `app/api/events/route.ts`).
- OAuth and social login may use Google client credentials.
- PostHog analytics keys are available as `NEXT_PUBLIC_POSTHOG_*` for client-side analytics.

## Error handling patterns

- API routes return structured JSON with `{ message, ... }` and appropriate HTTP status codes (401/403/404/500).
- Server actions use try/catch and return safe defaults where appropriate (e.g., booking count returns 0 on error).

## Caching & performance

- Use `.lean()` on Mongoose queries where performance matters for read-only data.
- Use cached server calls in server components when appropriate. Avoid blocking uncached operations in the render path.

## Where to look for code

- `app/page.tsx` — homepage and featured events (server component that queries DB directly)
- `app/api/events/route.ts` — event API handlers (GET, POST, PUT, DELETE)
- `lib/mongodb.ts` — connection manager (connectDB)
- `lib/auth-helpers.ts` — helper functions for server sessions (`requireAuth`)
- `lib/actions/` — higher-level server actions (event/booking operations)
- `database/event.model.ts` — Mongoose schema for events

---

For more details and examples, see the other documents in the `documentation/` directory.
