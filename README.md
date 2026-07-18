# OurClinic browser demo

This deliverable is one bilingual Next.js application served from one origin:

- Patient experience: `http://127.0.0.1:4173/`
- Clinic dashboard: `http://127.0.0.1:4173/admin`
- Clinic sign-in: `http://127.0.0.1:4173/admin/login`

There is no proxy, second application server, backend API, or database service. The public and admin experiences share one browser-local IndexedDB repository and are linked by a demo switcher. The restored public UI remains the authoritative patient-facing design; the restored admin UI remains the authoritative clinic-management design.

> Demo safety: use fictional information only. This browser-only demo is not suitable for real patient data, clinical decisions, production authentication, multi-user work, or regulated deployment.

## Requirements

- Node.js 20.11 or newer
- npm
- A current Chromium, Edge, Firefox, or Safari browser with IndexedDB enabled

## Install and run

From this directory:

```powershell
npm install
npm run dev
```

Or double-click `START_OURCLINIC_DEMO.bat`. The launcher checks Node/npm, installs dependencies only when necessary, and starts the same single Next.js development server on port 4173.

For a production-mode local check:

```powershell
npm run build
npm run start
```

Admin demo credentials:

```text
Email:    admin@ourclinic.demo
Password: OurClinic2026!
```

The credentials are also displayed on the demo-only login screen. Authentication is a local UI gate, not a security boundary.

## Demo switcher

The fixed `Patient Experience / Clinic Dashboard` pill changes between `/` and `/admin` without changing origin. It is enabled by:

```dotenv
NEXT_PUBLIC_DEMO_MODE=true
```

Set the value to `false` and rebuild to hide it. The labels follow the active English/Arabic locale. It is omitted from print views and hidden by the visual-capture suite.

## Architecture

- `src/app`: the single App Router tree for public and `/admin` routes.
- `src/components`, `src/data`, `src/config`: restored public experience.
- `src/admin` and `src/app/admin`: restored clinic experience, now scoped beneath `.admin-app`.
- `packages/contracts`: shared TypeScript contracts.
- `packages/local-data`: the one IndexedDB repository, versioned seed, validation, derived reports, audit activity, and an admin compatibility adapter.
- `public`: shared public assets and service worker.

The root layout selects the correct experience shell. Public providers, navigation, and footer are not mounted around admin pages; admin providers and shell are not mounted around public pages. CSS tokens are scoped so the two original systems do not overwrite one another.

Admin components still call the familiar adapter shape (`/api/...` path strings), but those calls are dispatched in-process to `localAdminRequest`; they are not network requests or server route handlers. There are no `route.ts` handlers and no middleware proxy.

## Browser-local data

The IndexedDB database is named `ourclinic-browser-demo`. One validated snapshot contains bookings, patients, visits, conditions, allergies, medications, observations, prescriptions, submissions, and activity records.

The same repository is used by both sides:

- Public booking creates an admin-visible booking.
- Contact, newsletter, and child flows create admin-visible submissions.
- Admin status changes persist after refresh.
- Booking conversion creates or selects a patient, creates one linked visit, marks the booking converted, and rejects a second conversion.
- Dashboard and reports are derived from the current snapshot rather than fixed counters.
- Mutations append activity entries.

Settings at `/admin/settings` provides:

- Export as validated JSON.
- Import validated JSON with rollback on failure.
- Reset to the original versioned seed.

Data is isolated by browser profile and origin. Clearing site data, private-browsing teardown, a reset, or a different browser/profile changes what is available. There is no cross-device sync or concurrency control.

## Authentication behavior

- Unauthenticated `/admin` and protected admin routes resolve to `/admin/login` in the browser.
- Valid demo credentials create a browser-local session and redirect to `/admin/today`.
- Refreshing a protected route retains the session.
- Signing out clears local/session storage and returns to login.
- An already-authenticated visit to `/admin/login` redirects back to the admin experience.

No auth cookies, tokens, remote calls, or hardcoded backend endpoints are used.

## Verification

```powershell
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm run test:visual
```

`npm run verify` runs the complete sequence. Playwright uses the production build on the same port and origin. Visual outputs are written to `tests/visual/results` for mobile, tablet, and desktop viewports.

See `QA_REPORT.md` and `VISUAL_FIDELITY_REPORT.md` for the executed results and inspected surfaces.

## Deployment notes

Deploy as a normal single Next.js application. The host must serve all App Router paths from one origin and permit the root service worker. No API or database environment variables are needed. Because persistence and auth are browser-local, deployment does not make this production-safe or collaborative.

## Known limitations

- Demo-only local authentication is intentionally not secure.
- Data is browser/profile/origin-local and has no backup unless explicitly exported.
- No real appointments are confirmed and no notifications are sent.
- No remote backend, server-side authorization, multi-user support, synchronization, or conflict handling exists.
- Authenticated admin reference screenshots were unavailable from the old backend-dependent runtime; those screens were verified from the restored source plus new multi-viewport captures, while login and public pages had direct screenshot references.

