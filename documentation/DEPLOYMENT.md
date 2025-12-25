# Deployment Guide

This project is designed to be deployed to Vercel, but any host that supports Next.js 16 (App Router) will work.

## Vercel (recommended)

1. Push your repository to GitHub (or GitLab/Bitbucket) and import it into Vercel.
2. Set the following Environment Variables in the Vercel project settings (Production & Preview as needed):

- `MONGODB_URI` — MongoDB connection string
- `BETTER_AUTH_SECRET` — better-auth secret
- `BETTER_AUTH_URI` — public URL for auth callbacks (e.g., https://your-site.vercel.app)
- `CLOUDINARY_URL` — (if using Cloudinary)
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — OAuth credentials if used
- `NEXT_PUBLIC_BASE_URL` — set to `https://your-site.vercel.app` (preview/production)
- `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_POSTHOG_HOST` — if using PostHog

3. Build & deploy: Vercel will run `npm run build` automatically.

### Common deployment issues & fixes

- Unexpected token while parsing JSON during prerender:

  - Root cause: server-side fetch to an internal API returned HTML (Vercel deploy page) during build. Solution: prefer server-side DB queries in server components for prerendered pages. See `app/page.tsx` where the home page was changed to query the DB directly.

- `Uncached data was accessed outside of <Suspense>` during build:

  - Fix: inspect the failing route shown in the build logs, move the blocking operation into a cached server function or wrap UI in `<Suspense>`.

- Missing environment variables in Vercel:
  - Ensure variables are set for both Preview and Production as appropriate. `NEXT_PUBLIC_*` variables are exposed to the client; server-only secrets should be set as non-public variables.

## Alternative hosts

- Fly.io, Render, or self-hosting on a VM/container also work. Ensure your host runs Node.js and exposes environment variables. For containerization, build the Next.js app in the Dockerfile and run `next start`.

## Post-deploy checks

- Open the deployed URL and confirm the homepage loads and event data shows up.
- Test creating an event (requires auth); confirm event appears in DB.
- Review logs in Vercel to catch any runtime errors (DB auth, Cloudinary uploads).

---

For details on database connection consolidation and sharing Mongoose native client with better-auth, see `documentation/DATABASE_CONSOLIDATION.md`.
