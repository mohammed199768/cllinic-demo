# Visual fidelity report

## Method

The restored patient and clinic UIs were rendered in the unified production application, captured by Playwright, and then inspected as images. This was not judged from route names or copied filenames.

Viewports:

- Mobile: 390×844
- Tablet: 768×1024
- Desktop: 1366×768

Generated evidence is in `tests/visual/results` (33 full-page screenshots). Historical reference evidence is preserved under `../../backups/ourclinic-browser-demo-before-unified-app/moved-original/tests/visual/references`.

Animations, transitions, carets, and the new demo switcher are hidden during capture so they do not obscure the authoritative UI. Each captured page is also checked for unintended horizontal body scrolling.

## Inspected surfaces

| Experience | Surfaces | Viewports | Result |
|---|---|---|---|
| Public | Home, booking, services, medical content | Mobile, tablet, desktop | Original public composition, typography, cards, navigation, imagery, footer, and responsive transformations retained |
| Admin | Login, today, dashboard, bookings, patient profile, visit workspace, reports | Mobile, tablet, desktop | Original admin shell, cards, forms, tables/lists, mobile header, and responsive density retained |

Representative files include:

- `tests/visual/results/public-home-desktop.png`
- `tests/visual/results/public-home-mobile.png`
- `tests/visual/results/public-booking-tablet.png`
- `tests/visual/results/admin-login-desktop.png`
- `tests/visual/results/admin-dashboard-desktop.png`
- `tests/visual/results/admin-bookings-tablet.png`
- `tests/visual/results/admin-patient-profile-mobile.png`
- `tests/visual/results/admin-visit-workspace-desktop.png`
- `tests/visual/results/admin-reports-mobile.png`

## Expected differences from historical references

- Unified identity is now `OurClinic` / `عيادتنا` throughout.
- Public reference images were captured in Arabic while the new deterministic visual suite selects English; layout direction and content strings therefore differ even though the responsive composition is retained.
- Admin login shows the required demo-only credential notice and prefilled credentials.
- The switcher exists at runtime but is intentionally hidden in visual evidence.
- Data-driven admin counts and rows reflect the shared IndexedDB seed/current local state.
- All admin URLs are prefixed with `/admin` and both experiences now share one origin.

## Corrections made after actual rendering

- Scoped public and admin design tokens to prevent cross-experience CSS leakage.
- Preserved each experience's providers and chrome only on its own route family.
- Fixed first-install service-worker controller behavior so it does not reload an uncontrolled first visit.
- Associated admin field labels and controls with stable IDs for reliable click/focus behavior.
- Allowed booking action rows to wrap and reserved detail width, preventing patient names from collapsing at tablet width.
- Verified that mobile patient tabs remain a contained horizontal control rather than creating body overflow.

## Final assessment

The unified app retains the source public and admin design systems at the required responsive sizes, with only the intentional identity, demo-auth, shared-data, route-prefix, and switcher changes above. Direct historical baselines exist for public pages and admin login. The old backend-dependent application did not provide authenticated admin reference screenshots, so authenticated admin fidelity is supported by restored source structure plus the newly inspected multi-viewport captures rather than an exact old/new pixel-diff baseline.

