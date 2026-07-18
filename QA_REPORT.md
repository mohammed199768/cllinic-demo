# OurClinic browser demo QA report

Date: 18 July 2026  
Runtime: Windows, Node.js/npm, Next.js 15.5.20  
Unified origin: `http://127.0.0.1:4173`

## Verdict

The `crypto.randomUUID is not a function` crash is reproduced, traced, and fixed. All runtime ID generation now goes through one SSR-safe utility that uses `globalThis.crypto.randomUUID()` where available and an RFC 4122 version-4 `getRandomValues()` fallback otherwise. The full verification suite, browser console matrix, clinical workflows, import/export preservation, production service worker lifecycle, development cleanup, and a 31.1-second idle Fast Refresh observation all pass.

## Exact reproduction and root cause

The pre-fix failure was reproduced in a real browser after removing only `Crypto.randomUUID` while retaining `Crypto.getRandomValues`:

1. Start the development server with `npm run dev`.
2. Open `/` in Chromium.
3. Click **Open OurClinic Guide**.
4. Enter `booking` and press Enter.
5. React executes the guide message-state mutation and calls `crypto.randomUUID()` directly.

Failure category: client-side state/action mutation. It was not a server render, hydration, IndexedDB initialization, seed, login, or import failure. The environment legitimately exposed `globalThis.crypto` and `getRandomValues`, but the direct code assumed the optional `randomUUID` method also existed.

Complete captured browser stack:

```text
TypeError: crypto.randomUUID is not a function
    at eval (webpack-internal:///(app-pages-browser)/./src/components/HereAssistantWidget.tsx:277:32)
    at basicStateReducer (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:7066:45)
    at updateReducerImpl (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:7176:15)
    at updateReducer (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:7099:14)
    at Object.useState (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:24180:18)
    at exports.useState (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react/cjs/react.development.js:1252:34)
    at HereAssistantWidget (webpack-internal:///(app-pages-browser)/./src/components/HereAssistantWidget.tsx:144:84)
    at Object.react_stack_bottom_frame (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23584:20)
    at renderWithHooks (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:6793:22)
    at updateFunctionComponent (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:9247:19)
    at beginWork (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:10858:18)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:872:30)
    at performUnitOfWork (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:15727:22)
    at workLoopSync (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:15547:41)
    at renderRootSync (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:15527:11)
    at performWorkOnRoot (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:15034:44)
    at performSyncWorkOnRoot (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16831:7)
    at flushSyncWorkAcrossRoots_impl (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16677:21)
    at processRootScheduleInMicrotask (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16715:9)
    at eval (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:16850:13)
```

## Unsafe call-site audit

The original audit found these unsafe ID-generation locations:

- `packages/local-data/src/repository.ts:9`: direct `crypto.randomUUID()` used by every repository entity and activity/audit mutation.
- `src/lib/health-storage.ts:441-449`: unqualified crypto access plus a timestamp/`Math.random()` fallback.
- `src/components/BookingStepper.tsx:109`: direct UUID call for idempotency; the file also contained a timestamp/`Math.random()` temporary ID helper.
- `src/components/HereAssistantWidget.tsx:168` and `:175`: direct UUID calls for guide/user message IDs.
- `src/components/KidsRewardFlow.tsx:31`: direct UUID call.
- `src/components/SiteFooter.tsx:42`: direct UUID call.
- `src/components/views/ContactView.tsx:25`: direct UUID call.

There was no imported, local, parameter, or module named `crypto`, no `node:crypto` browser import, and no crypto shadowing. The post-fix static scan finds runtime `randomUUID` access only inside the centralized utility; other matches are tests and browser diagnostics.

## Centralized ID implementation

`packages/local-data/src/utils/create-id.ts` now owns ID generation:

- It reads `globalThis.crypto` only when `createId()` is called, so importing the module is safe during SSR/module evaluation.
- It uses the native method when `typeof globalThis.crypto?.randomUUID === 'function'`.
- Otherwise it fills 16 bytes with `globalThis.crypto.getRandomValues`, applies RFC 4122 version-4 and variant bits, and formats the canonical UUID shape.
- If neither secure API exists, it throws the controlled error `Secure random ID generation is unavailable in this browser.`
- It has no dependency, `Math.random`, timestamp, browser-global-at-module-load, or Node crypto fallback.

The local-data package exports the utility from both the package index and the `@ourclinic/local-data/create-id` subpath. The repository accepts the secure factory through its constructor and every repository-created entity/activity ID flows through it. UI code creates IDs in user actions or immediately before state updates, not during render or inside a React state-updater callback.

No IndexedDB schema version, migration, or seed content changed. Existing IDs are not regenerated; imported IDs remain byte-for-byte preserved; seed records are written only when the database is absent.

## Other runtime corrections

### Smooth scrolling

The root `<html>` element retains its locale, direction, fonts, and providers and now declares `data-scroll-behavior="smooth"`, matching the application CSS and removing Next.js's smooth-scroll warning. A browser-console assertion specifically checks `/scroll-behavior:\s*smooth/i` on every audited route and found no match.

### Fast Refresh

The final development-server observation lasted 31.1 idle seconds after all source changes. It recorded zero watched-file changes under `src`, `packages`, and `public`, exactly one listener, no extra compilation, rebuild, or Fast Refresh event, and no server warning. During the route matrix, each newly visited route compiled once as expected. Test artifacts remain under `tests/results` and do not touch application watch paths.

`allowedDevOrigins: ['127.0.0.1']` removes the development cross-origin warning for the configured unified origin.

### Service worker

- Production cache version is `our-clinic-v3`; install, activation, refresh, and update checking remain enabled.
- Development unregisters all service workers, removes `our-clinic-*` caches, and performs at most one cleanup reload when the page began under a stale controller.
- A worker that encounters the development runtime response header unregisters itself, deletes its caches, and switches subsequent requests to network-only, so a previously installed production worker cannot cache development chunks or routes.
- Event listeners used for production update watching are cleaned up.

Persistent-profile result:

```text
PWA_PRODUCTION_INSTALL {"registrations":1,"state":"activated","caches":["our-clinic-v3-static"],"errors":[]}
PWA_DEVELOPMENT_CLEANUP {"registrations":0,"controller":null,"caches":[],"crypto":"[object Crypto]","randomUUID":"function","getRandomValues":"function","isSecureContext":true,"href":"http://127.0.0.1:4173/","loads":2,"errors":[]}
```

## Browser diagnostics

The following values were captured in actual Chromium sessions in both production and development at the unified URL:

```text
globalThis.crypto -> [object Crypto]
typeof globalThis.crypto?.randomUUID -> "function"
typeof globalThis.crypto?.getRandomValues -> "function"
window.isSecureContext -> true
location.href -> "http://127.0.0.1:4173/"
```

No unexpected `pageerror`, console error, hydration error, smooth-scroll warning, service-worker loop, or failed resource was observed on:

- `/`
- `/booking`
- `/admin`
- `/admin/login`
- `/admin/today`
- `/admin/dashboard`
- `/admin/bookings`
- `/admin/patients/new`

Production manual HTTP checks returned 200 for all eight paths with exactly one Next listener on port 4173. The server was stopped and the port was confirmed released after verification.

## Automated coverage and results

| Check | Command | Result |
|---|---|---|
| Pre-fix browser reproduction | `npx playwright test tests/e2e/uuid-repro.spec.ts` | Reproduced the exact guide mutation crash and captured the complete stack; temporary reproduction spec then replaced by the passing fallback regression test |
| Static call-site/shadow audit | `rg` searches across `src` and `packages` | All direct runtime call sites found and replaced; no crypto shadowing or Node crypto browser import |
| Lint | `npm run lint` | Passed; ESLint reported no warning or error |
| TypeScript | `npm run typecheck` | Passed for the app and `@ourclinic/local-data` |
| Unit/component/data | `npm test` | 9 files and 48 tests passed |
| Production build | `npm run build` | Passed; 60 route entries generated |
| End-to-end | `npx playwright test tests/e2e` | 12 scenarios passed |
| Visual/responsive | `npm run test:visual` | 1 suite passed; 33 captures generated |
| Full gate | `npm run verify` | Passed in 113.1 seconds |
| Dependency audit | `npm audit` | 0 vulnerabilities |
| Production runtime | `npm run start` | All audited routes returned 200; one listener; clean browser console |
| PWA persistence | `node tests/diagnostics/pwa-persistence.mjs install-production` followed by `verify-development` | Production worker activated; development removed the registration/controller/caches with no error or reload loop |

Focused UUID coverage verifies native generation, secure fallback generation, exact UUID v4 shape/version/variant, 32 unique fallback IDs, controlled behavior with no secure crypto API, SSR-safe module import, repository factory centralization, imported-ID preservation, and the browser fallback path with `randomUUID` deliberately unavailable.

The clinical repository/UI coverage verifies unique IDs for conditions, allergies, medications, observations, bookings, booking statuses, visits, follow-ups, prescription items, and audit/activity records. It also verifies admin UI creation of clinical records, public contact creation, guide messages, booking conversion, persistence across refresh, export/reset/re-import, and preservation of imported records.

## Files changed for this correction

- `packages/local-data/package.json`
- `packages/local-data/src/index.ts`
- `packages/local-data/src/repository.ts`
- `packages/local-data/src/utils/create-id.ts`
- `packages/local-data/src/utils/create-id.test.ts`
- `packages/local-data/src/local-data.test.ts`
- `src/lib/health-storage.ts`
- `src/components/BookingStepper.tsx`
- `src/components/HereAssistantWidget.tsx`
- `src/components/KidsRewardFlow.tsx`
- `src/components/SiteFooter.tsx`
- `src/components/views/ContactView.tsx`
- `src/app/layout.tsx`
- `src/components/pwa/PWAProvider.tsx`
- `public/sw.js`
- `next.config.mjs`
- `tests/e2e/uuid-fallback.spec.ts`
- `tests/e2e/unified-demo.spec.ts`
- `tests/diagnostics/pwa-persistence.mjs`
- `QA_REPORT.md`

## Remaining genuine warnings

There are no remaining browser-console, UUID, hydration, smooth-scroll, Fast Refresh, IndexedDB, or service-worker warnings. The only tooling notice is Next.js 15's deprecation message for `next lint`; it recommends migrating the lint script to the ESLint CLI before a future Next.js major release. It does not affect the application runtime or the passing ESLint result.
