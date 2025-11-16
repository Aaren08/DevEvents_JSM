<div align="center">
![Project Logo](./public/icons/logo.png)
</div>

## Description

Dev Events Platform is a full-stack event management app built with Next.js and TypeScript. It provides pages for browsing events, viewing event details, creating and managing events, and handling bookings. The codebase follows the Next.js app-router structure with server and client components, API routes for auth and event/booking endpoints, and a small component library for reusable UI (event cards, forms, modals, skeletons). Data is persisted in MongoDB and the app includes authentication helpers and actions for server-side operations.

## Tech Stack

- Framework: Next.js (App Router) — server/client components, API routes
- Language: TypeScript
- UI: React (with component-driven structure)
- Database: MongoDB (via the project’s mongodb.ts and models in database)
- Styling: PostCSS + global CSS (includes globals.css and animate.css)
- Utilities & helpers: project-local lib/\* (auth, utils, actions)
- Notifications / UI helpers: custom UI primitives (e.g., ui/sonner.tsx, alert/dialog components)
- Runtime: Node.js (server-side in Next.js)
- Dev / Deployment: typical Next.js setup (deployable to Vercel or similar platforms)

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_POSTHOG_HOST`
- `NEXT_PUBLIC_BASE_URL=http://localhost:3000`
- `MONGODB_URI`
- `CLOUDINARY_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `BETTER_AUTH_URI=http://localhost:3000`
- `BETTER_AUTH_SECRET`

## Documentation

Provided in the documentation folder in project codebase.

## Author

[@adrianhajdin](https://www.github.com/adrianhajdin)
