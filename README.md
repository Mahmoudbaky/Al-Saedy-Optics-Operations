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
