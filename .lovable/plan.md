# Arabize admin + dashboard, add theme toggle in admin

## What's already in place
- The user dashboard shell (`dashboard.tsx`) already has a theme toggle, EN/FR/AR language picker, and reads labels via `t()` keys.
- `useTheme` (light/dark) and `useLang` (en/fr/ar with RTL) already exist app-wide.
- `src/i18n/translations.ts` already has `sidebar.*` / `topbar.*` keys with AR strings.
- Many user-dashboard inner pages still contain hardcoded English literals; the admin section is almost entirely hardcoded English.

## What we'll change

### 1. Admin shell (`admin.tsx`)
Bring it to parity with the user dashboard:
- Replace the hardcoded sidebar nav labels (`Dashboard`, `Clients`, `Orders`, `Documents`, `Messages`, `Plans`, `Blog`) with `t("admin.nav.*")` keys.
- Add a topbar (currently no topbar — admin uses inline header) containing:
  - Mobile menu toggle
  - Page title (derived from active nav item via `t()`)
  - Sun/Moon theme toggle button (`useTheme().toggle`)
  - EN / FR / AR language picker (same component style as user sidebar)
  - User initials + email
  - Sign out button
- Keep the sidebar markup, but make the bottom of the sidebar host the language picker on desktop (mirroring user dashboard pattern). The topbar gets the theme button.
- Title in the sidebar header becomes `t("admin.title")` instead of "⚡ Admin".

### 2. Settings pages — theme switch
- `dashboard/settings`: add a "Appearance" card with a labeled Light / Dark / System switch wired to `useTheme`, plus a language selector card.
- `admin/settings`: add the same Appearance + Language cards at the top.

### 3. Arabic translation coverage
Strategy: introduce two new key namespaces and convert every visible literal string.

- `admin.*` — sidebar items, page titles, table headers, CTAs, status pills, drawer labels, toasts. Covers:
  - `admin.tsx` (shell)
  - `admin.index.tsx` (dashboard KPIs, recent activity, etc.)
  - `admin.clients.tsx`, `admin.orders.tsx`, `admin.orders.$orderId.tsx`
  - `admin.documents.tsx`, `admin.messages.tsx`
  - `admin.plans.tsx` (full CRUD UI we just added)
  - `admin.settings.tsx`
  - `admin.blog.tsx`, `admin.blog.index.tsx`, `admin.blog.new.tsx`, `admin.blog.$postId.tsx`
- `dash.*` — inner user-dashboard pages still in English. Covers:
  - `dashboard.index.tsx`, `dashboard.gateways.tsx`, `dashboard.ein.tsx`, `dashboard.documents.tsx`, `dashboard.banking.tsx`, `dashboard.compliance.tsx`, `dashboard.phone.tsx`, `dashboard.website.tsx`, `dashboard.store.tsx`, `dashboard.academy.tsx`, `dashboard.analytics.tsx`, `dashboard.support.tsx`, `dashboard.notifications.tsx`, `dashboard.settings.tsx`, `dashboard.start.tsx`, `dashboard.messages.tsx`

Each new key gets `en` / `fr` / `ar` values in `src/i18n/translations.ts`. Page components are updated to read with `const { t } = useLang()`.

Database-driven content (service names from `services` table, blog post titles, client names, order IDs, etc.) stays as-is — already localized per row or intrinsically untranslatable.

### 4. RTL polish
The app already swaps `<html dir>` and uses logical Tailwind classes (`ms-*`/`me-*`/`start-*`/`end-*`) for most layout. Spot-fix any `ml-*`/`mr-*`/`left-*`/`right-*` we find inside touched admin/dashboard pages so AR layout is mirrored cleanly.

## Out of scope
- Public marketing pages (already i18n'd).
- DB-stored content translations beyond what already exists in `services.name_*`.
- New animations or layout redesigns.

## Technical notes (for the curious)
- Theme: existing `ThemeProvider` (class `dark` on `<html>`, stored in `localStorage` key `lb-theme`). No SSR hydration changes needed — admin shell will mirror the user shell's hydration-safe pattern.
- Language: existing `LanguageProvider` (`localStorage` key `lb-lang`, sets `dir`/`lang` on `<html>`). The admin picker uses `setLang(...)` exactly like the user dashboard.
- Translations: literal `"…"` strings in JSX are swapped for `t("namespace.key")`. Empty/dynamic strings (counts, currencies, dates) stay; they were already locale-aware via `Intl`.
- The work is mostly mechanical: ~16 dashboard files + ~11 admin files + ~150-250 new translation keys × 3 locales. Several files are tiny stubs (`dashboard.messages.tsx`, `admin.clients.tsx`) and trivial to convert.

## Approximate file impact
- Edited: `src/routes/_authenticated/admin.tsx`, all `admin.*.tsx`, all `dashboard.*.tsx`, `src/i18n/translations.ts`.
- No schema changes, no new dependencies.
