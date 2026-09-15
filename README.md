# Al-Saedy Optics — Admin Panel

Operations console for the Al-Saedy Polyclinic optics store. Implements the
**Al-Saedy Admin Dashboard** design (Claude Design project
`3e4430b7-d711-4322-818b-9ab1d02b7875`) with React 19, Vite, Tailwind v4 and
shadcn/ui (Base UI, `base-nova` style).

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # type-check + production bundle
pnpm lint       # oxlint
```

## Screens

| Route            | Design | What it covers                                                        |
| ---------------- | ------ | --------------------------------------------------------------------- |
| `/`              | 2a, 2h | KPI tiles, 14-day revenue chart, orders by status, top products, queue |
| `/orders`        | 2b, 2c | Saved views, filters (in the URL), bulk actions, order detail drawer   |
| `/prescriptions` | 2d     | Review queue, scan preview, Rx form with axis validation, verify/reject |
| `/products`      | 2e     | Catalogue filters, low-stock chip (`?lowStock=3`), bulk bar, skeleton  |
| `/lens-addons`   | 2f     | Add-on pricing table, delete confirmation                              |
| `/customers`     | 2g     | Role / ban actions, empty state                                        |

Language: the `EN / العربية` toggle in the header flips `dir`, the sidebar side,
sheet side and numerals (Arabic-Indic via `Intl`). `?lang=ar` seeds it for
shareable links; the choice is remembered in `localStorage`.

## Project layout

```
src/
  components/
    ui/          shadcn components (generated; Badge/Button/Checkbox/Switch lightly themed)
    layout/      AppShell, AppSidebar, PageHeader, LanguageToggle, nav config
    shared/      StatCard, SectionHeading, BulkActionBar, FilterChip, FilterSelect,
                 DataTable helpers, RowActionsMenu, status badges, BrandMark
  features/      one folder per screen (page + its components + hooks)
  data/          mock data shaped like the API responses
  lib/i18n/      provider, hook, EN/AR message dictionaries
  types/         domain types mirroring backend enums
  routes.tsx     react-router config
  index.css      design-system tokens mapped onto shadcn variables
```

## Design-system mapping

The brand book's tokens live in `src/index.css`:

- `primary` = brand red (`#ED1C24`), `secondary` = navy (`#102B4E`), `ring` = sky.
- Clinical status tones are extra tokens (`success`, `warning`, `info`, `critical`,
  each with a `-soft` surface) exposed as `Badge` variants.
- Fonts: **Cairo** (body/Arabic) and **El Messiri** (headings) via `@fontsource-variable`.
- Sidebar tokens paint the inverse navy rail; the active item carries the red inset rule.

## Brand mark

`BrandMark` renders `/public/logo-mark.png` and falls back to an inline monogram
if the file is missing. Export `assets/logo-mark.png` from the design project
into `public/` to show the real mark.

## Backend connection

The panel talks to the [Al-Saedy Optics backend](../Al-Saedy-Optics-backend) at `/api/v1/admin/*`
(session cookie via Better Auth; only accounts with `role: admin` can sign in).

- **Dev:** `pnpm dev` in the backend (port 3000; `CORS_ORIGINS` already lists `http://localhost:5173`), then `pnpm dev` here.
- **URL:** copy `.env.example` to `.env.local` and set `VITE_API_URL` if the API is not on `http://localhost:3000`.
  In production the panel and API must share a site (same registrable domain) so the `SameSite=Lax` cookie is sent.
- **Admin account:** `ADMIN_EMAIL=… ADMIN_PASSWORD=… pnpm admin:create` in the backend, or promote a user from the Customers page.

Code map: `src/api` (axios client with envelope/error interceptors, DTO types, TanStack Query hooks per resource) ·
`src/auth` (Better Auth client, `AuthProvider`, `RequireAdmin` route guard, login page in `src/features/auth`) ·
`docs/follow-up-pages.md` (admin APIs that still need screens).
