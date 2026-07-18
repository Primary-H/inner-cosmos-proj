# feat(track-b): B4 i18n foundation + entry-surface zh-CN/en-SG migration

Branch `feat/complete-product-continuation` (base: latest `origin/main` = `upstream/main` = `85b3a5b`). Single commit `d724b98`, 15 files, +893/-90. Did **not** cherry-pick `7f1aa9b`; did **not** re-implement the merged A3 vector foundation or the B1/PWA checkpoints.

## Product effect
Inner Cosmos had **no i18n layer** - every UI string was hard-coded Chinese. The Singapore launch is specified English-first (`goal-objective.md` s3), and B4 was `NOT_STARTED`. This PR lets the **entry surface** - the AuthGate (first screen a new user sees) and the five-space navigation + the Me/control space - switch **Chinese <-> English (en-SG)** instantly via a toggle in the Me space, with no reload. First-time visitors are routed by browser language (`zh*`->zh-CN, `en*`->en-SG, English-first), the choice persists (`localStorage`), and `<html lang>` is kept in sync for accessibility.

## Mechanism
- `web/src/i18n/messages.ts` - a **typed** catalog (explicit `Messages` interface, not a `typeof` derivation), so a missing key or locale is a **compile error**. Count phrases are per-locale functions (English singular/plural inside the catalog, not concatenated).
- `web/src/i18n/locale.ts` - dependency-free detection / persistence (`ic-locale`) / `<html lang>`, storage access wrapped in try/catch to degrade silently (mirrors `theme.ts`).
- `web/src/i18n/LocaleProvider.tsx` - one context near the root: `useMessages()` + `useLocale()`; all consumers re-render together on switch.
- `web/src/components/LanguageToggle.tsx` - switcher styled to match `AppearanceToggle`.
- Migrated `AuthGate.tsx` and `ProductShell.tsx` (`ProductShellNavigation` + `MeSpace`) to the catalog; `productSpaces` -> `PRODUCT_SPACES` (keys only, labels now in the catalog); updated the one `AuroraApp.tsx` legacy-redirect use; wrapped the app in `<LocaleProvider>` in `main.tsx`.

## Risk / migration
Low risk, additive. No backend contract change -> no `track-b-integration-requests.yml` entry. No DB migration. No change to Aurora behaviour, routing, PWA, or other spaces. Behaviour-preserving: existing zh-CN component tests are kept as characterization (now wrapped in a `LocaleProvider`), with en-SG cases added.

Also bundles a small `web/package-lock.json` reconciliation (net -9 lines) that resolves a pre-existing `@emnapi` optional-dependency drift which made `npm ci` fail (`EUSAGE`: lockfile out of sync). This is included specifically so the reviewer step below (`npm ci`) works; it is not an i18n change.

## Verification (read honestly)
Produced in a sandbox with **no JDK 21 / no Maven Central** and where **`npm install` could not complete** (throttled proxy), so **Vitest / `tsc -b` / `vite build` were NOT run**. Per the repo's status discipline this is **IMPLEMENTED, not a green PASS**.
- **Executed for real** via Node 22 TypeScript type-stripping on the dependency-free core: catalog deep key-parity + no-empties + interpolation (incl. English plurals) -> `MESSAGES_OK`; locale detect/persist/apply -> `LOCALE_OK`.
- **Static**: no user-visible hard-coded Chinese remains in the migrated files; imports resolve; no runtime import cycle; old `productSpaces` export has zero remaining refs; `git diff --cached --check` PASS.
- **Written but not run** (need `npm i`): `messages.test.ts`, `locale.test.ts`, `LanguageToggle.test.tsx`, extended `AuthGate.test.tsx` / `ProductShell.test.tsx`.

**Reviewer must run before merge:** `cd web && npm ci && npx vitest run && npx tsc -b && npm run build`, then `scripts/scan-secrets.ps1`.

## Evidence
`evidence/track-b/B4-i18n/README.md`; status in `docs/goal/tracks/track-b-status.yml` (B4 -> IN_PROGRESS with the full verification/remaining ledger).

## Remaining (next B4 slices - not in this PR)
Migrate the remaining spaces (Aurora conversation, Inner Cosmos/starfield, Resonance, Connections/letters, psychology-skill chrome, account) onto the same `Messages` contract; localise dates/timezone/relative-time/numbers/validation/notificatio