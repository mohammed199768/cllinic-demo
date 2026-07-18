# OurClinic demo maintenance notes

Keep this directory as one Next.js application and one runtime on port 4173.

## Invariants

- Public routes remain under `/`; admin routes remain under `/admin`.
- Do not add a proxy, second dev server, cross-origin iframe, or remote backend dependency.
- Keep `packages/local-data` as the shared source of browser-local truth.
- Public mutations and admin mutations must use `clinicRepository` or `localAdminRequest`; do not create parallel storage keys or duplicate stores.
- Preserve the original public and admin visual systems. Public styling belongs under `.public-app`; admin styling belongs under `.admin-app`.
- Keep bilingual English/Arabic behavior, RTL support, responsive navigation, and the unified OurClinic / عيادتنا identity.
- Treat the demo login as a local UI gate only. Never imply that it secures real patient data.

## Change workflow

1. Add repository-level tests for data invariants and import validation.
2. Add or update Playwright coverage for cross-surface workflows and redirects.
3. Capture affected major surfaces at 390×844, 768×1024, and 1366×768.
4. Run lint, typecheck, unit tests, build, end-to-end tests, and visual capture.
5. Check both a direct deep-route refresh and the demo switcher on one origin.

Avoid editing source-project directories outside this deliverable. The pre-unification demo is preserved under `../../backups/ourclinic-browser-demo-before-unified-app`.

