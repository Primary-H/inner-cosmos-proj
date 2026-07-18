# Track B · B4 — i18n foundation + entry-surface migration (first slice)

> Checkpoint class: **IMPLEMENTED / partially BUILDER_VERIFIED**
> Branch: `feat/complete-product-continuation` (base `85b3a5b`, latest `origin/main`)
> Date: 2026-07-19
> Author: continuous-loop Coding Agent (teammate continuation)

## 1. Product effect

Inner Cosmos had **no internationalisation layer at all**: every user-visible string was
hard-coded Chinese across ~20 components (only psychology-skill *content* had a `zh-CN`/
`en-SG` locale, never the UI chrome). The Singapore launch is specified as English-first
(`goal-objective.md` §3; `对齐文档` 04/09), so this is a required B4 capability, listed
`NOT_STARTED` before this checkpoint.

This slice makes the **entry surface** — the AuthGate (the first screen every new user
sees) and the five-space navigation + the Me/control space — switch instantly between
**中文 (zh-CN)** and **English (en-SG)** with a language toggle in the Me space, no page
reload. The choice is persisted (localStorage, mirroring `theme.ts`) and reflected on
`<html lang>` for accessibility. A first-time visitor is routed by browser language
(any `zh*` → zh-CN; any `en*` → en-SG, English-first), falling back to zh-CN.

## 2. Mechanism

- `web/src/i18n/messages.ts` — a **typed** message catalog. An explicit `Messages`
  interface (not a `typeof` derivation) forces every locale to supply every key with the
  right value kind; a missing key or locale is a compile error. Dynamic phrases (counts)
  are typed functions so pluralisation/word-order live inside the catalog per locale
  (`"1 active arrangement"` vs `"3 active arrangements"` vs `"3 个有效约定"`), never
  string-concatenated at the call site.
- `web/src/i18n/locale.ts` — dependency-free detection / persistence (`ic-locale`) /
  `<html lang>` application, each storage access wrapped in try/catch to degrade silently
  exactly like `theme.ts`.
- `web/src/i18n/LocaleProvider.tsx` — one context near the app root exposing
  `useMessages()` (resolved catalog) and `useLocale()` (locale + persisting setter). All
  consumers re-render together on switch.
- `web/src/components/LanguageToggle.tsx` — switcher styled to match `AppearanceToggle`.
- Migrated to the catalog: `AuthGate.tsx` (login/register/native OIDC), `ProductShell.tsx`
  (`ProductShellNavigation` + `MeSpace`). The old `productSpaces` tuple (which carried
  hard-coded labels) became `PRODUCT_SPACES` (key order only); `AuroraApp.tsx`'s one
  legacy-redirect use was updated. `main.tsx` wraps the app in `<LocaleProvider>`.

No backend contract change → no `track-b-integration-requests.yml` entry needed. No
change to Aurora behaviour, routing, PWA, or any other space's logic.

## 3. Verification — honest status

This session ran inside a sandbox that **cannot build or run the full frontend toolchain**:
`npm install` cannot complete through the environment's throttled package proxy
(~37 s/request, long installs killed), so Vitest / `tsc -b` / `vite build` **were not run
here**. That is an infrastructure gap, not a passing result — per the project's status
discipline this checkpoint is IMPLEMENTED, not a green-suite PASS.

What **was** executed and passed, using Node 22's native TypeScript type-stripping on the
dependency-free modules (real execution, not self-scoring):

- **Catalog integrity** (`node` over `messages.ts`): both locales have an identical deep
  key shape (no missing/extra keys); no empty-string leaves in any locale; count
  interpolation correct in both locales incl. English singular/plural; `messagesFor`
  falls back to the default for an unknown locale. → `MESSAGES_OK`.
- **Locale logic** (`node` over `locale.ts`): `detectLocale` maps zh*/en*/other correctly
  and respects order; storage degrades to null without throwing when `localStorage` is
  absent; `resolveInitialLocale` returns a valid locale; `applyDocumentLocale` sets
  `lang`. → `LOCALE_OK`.

Static verification of the React changes (cannot compile here): no user-visible hard-coded
Chinese remains in the migrated `AuthGate.tsx`/`ProductShell.tsx` (comments only); all new
imports resolve to real files; no runtime import cycle (the only edge back to `ProductShell`
is an erased `import type`); the old `productSpaces` export has no remaining references.

## 4. Tests written (require `npm i` to run — see §5)

- `web/src/i18n/messages.test.ts` — catalog shape parity, no-empties, interpolation, fallback.
- `web/src/i18n/locale.test.ts` — detection, persistence round-trip, resolve precedence, `<html lang>`.
- `web/src/components/LanguageToggle.test.tsx` — active marking, switch re-renders shared
  consumers + persists + updates `<html lang>`, stored-choice init, hooks-outside-provider guard.
- `web/src/components/AuthGate.test.tsx` — existing zh-CN characterization preserved (now
  wrapped in a `LocaleProvider`) + new en-SG rendering & validation cases.
- `web/src/components/ProductShell.test.tsx` — existing zh-CN nav assertions preserved + new
  en-SG nav-label case asserting no Chinese remains.

## 5. Reproduce / finish verification (on a normal dev machine)

```bash
cd web
npm ci            # or: npm install  (lockfile has a platform-optional @emnapi drift; see §6)
npx vitest run    # expect the new i18n + updated AuthGate/ProductShell suites green
npx tsc -b        # type-check the typed catalog + migrations
npm run build     # vite production build into src/main/resources/static/app/aurora/
```

Ad-hoc core checks actually run this session (reproducible with only Node ≥ 22.18):
`node <a .ts harness importing web/src/i18n/messages.ts and locale.ts>` — see the exact
harnesses recorded in the status file's verification block.

## 6. Remaining (next B4 slices)

- Migrate the remaining spaces (Aurora conversation, Inner Cosmos/starfield, Resonance,
  Connections/letters, psychology-skill UI chrome, account settings) onto the same
  `Messages` contract — the bulk of the hard-coded Chinese is still there.
- Localise dates/timezone/relative-time/numbers/validation/notifications/safety resources
  (only static UI strings are covered so far).
- en-SG copy review by a fluent reviewer (human gate); current English is author-written.
- WCAG 2.2 AA pass and axe/keyboard/screen-reader smoke (B4's a11y half) — not started here.
- Full frontend gate (Vitest/tsc/build/Playwright) must be run on a real toolchain and its
  output attached before this is upgraded past IMPLEMENTED.
