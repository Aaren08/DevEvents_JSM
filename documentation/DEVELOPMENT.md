# Development Guide

This document describes how to develop and debug the Dev Event Platform locally.

## Prerequisites

- Node.js (recommended version compatible with Next.js 16)
- npm
- A running MongoDB instance (Atlas or local)
- (Optional) Cloudinary account for image uploads

## Setup

1. Install dependencies:

```powershell
npm install
```

2. Create a `.env.local` file with the following variables (examples):

```
MONGODB_URI=mongodb+srv://<user>:<pw>@cluster0.mongodb.net/dev-events
NEXT_PUBLIC_BASE_URL=http://localhost:3000
CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
BETTER_AUTH_URI=http://localhost:3000
BETTER_AUTH_SECRET=some_secret
NEXT_PUBLIC_POSTHOG_KEY=pk_xxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

3. Start the development server:

```powershell
npm run dev
```

Open http://localhost:3000

## Common development tasks

- Add a server-only helper: place it under `lib/` and call it in server components (files under `app/` that are async and run on the server).
- Add API routes: follow `app/api/<resource>/route.ts` pattern with exported `GET`, `POST`, `PUT`, `DELETE` handlers.
- Add Mongoose models under `database/` and import them from server code.

## Debugging build / prerender errors

### `Unexpected token` when parsing JSON during build

Cause: A server component (or page) calls `fetch()` to an internal API route at build/prerender time. If the hosting provider returns an HTML status page (for example Vercel's "The deploy is being prepared" page), `response.json()` will throw.

Fixes:

- Preferred: Avoid `fetch()` to your own API at build time. Query the database directly from server components (use `connectDB()` + Mongoose models).
- Alternative: Validate response content-type and status before calling `response.json()`.

Example:

```ts
const res = await fetch(`${BASE_URL}/api/events`);
if (!res.ok) throw new Error(`API error: ${res.status}`);
const contentType = res.headers.get("content-type") || "";
if (!contentType.includes("application/json")) {
  // handle gracefully
}
const json = await res.json();
```

### `Uncached data was accessed outside of <Suspense>`

Cause: A route is performing uncached async work that blocks rendering and is not wrapped in `<Suspense>`.

Fixes:

- Move long-running or uncached operations into server components with caching: use `cache()` or `fetch(..., { next: { revalidate } })` where appropriate.
- Wrap client UI that relies on the data in a `<Suspense>` with a fallback.
- Inspect the stack trace produced by `next build --debug-prerender` or run `next dev` and open the page in the browser to see the client-side stack.

## Useful commands

```powershell
npm run dev        # start dev server
npm run build      # production build
npm run start      # run built app
npm run lint       # run ESLint
npx next build --debug-prerender  # debug prerender issues
```

## Running small checks

- Lint code: `npm run lint`
- Validate TypeScript: `tsc --noEmit` (not included in scripts by default)

## Notes about env vars and local development

- Keep credentials out of version control.
- For quick development, you can point `MONGODB_URI` at a free Atlas cluster.
- If you don't need image uploads locally, omit `CLOUDINARY_URL` but disable image-upload UI flows or test with small uploads.

---

For further internals and architecture, see `documentation/ARCHITECTURE.md`.
