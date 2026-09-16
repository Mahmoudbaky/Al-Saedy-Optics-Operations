# Follow-up pages (not yet in the admin panel)

The backend already exposes admin APIs for these resources; the panel has no screen for them yet.
Each section lists the endpoints, the request/response shapes, and what the page should do.
All routes are under `/api/v1/admin/...`, require an admin session (cookie via `withCredentials`), and use
the standard envelope `{ success, data, meta? }` / `{ success: false, error: { code, message, details? } }`.
Bilingual fields are `{ ar, en }`. Money is integer IQD. Pagination: `?page&limit` → `meta { page, limit, total, pages, hasNext, hasPrev }`.

Suggested implementation pattern (same as the wired pages): a `src/api/<resource>.ts` file with
TanStack Query hooks over the axios client in `src/api/client.ts`, a `src/features/<resource>/` page, a route in
`src/routes.tsx`, a nav item in `src/components/layout/nav-items.ts`, and message keys in `src/lib/i18n/messages.ts`.

---

## 1. Appointments (clinic bookings)

| Method | Path | Body / query | Returns |
|---|---|---|---|
| GET | `/admin/appointments` | `page, limit, doctorId?, status?: booked\|confirmed\|completed\|cancelled\|noShow, from?, to?` (ISO datetimes on `scheduledAt`, sorted asc) | `Appointment[]` + meta |
| POST | `/admin/appointments/:id/status` | `{ status, notes?: string≤500 }` | `Appointment` |
| GET | `/admin/doctors` | `includeInactive?` | `Doctor[]` (for the doctor filter) |

`Appointment = { id, doctor: { id, name, specialty, imageUrl }, scheduledAt, reason: exam|rx|contacts, status, remindMe, notes, canCancel, createdAt, user: { id, name, email, phone } }`.

Page: day/week list grouped by date, doctor + status filters, row actions **Confirm / Complete / No-show / Cancel**
(`confirmed` and `cancelled` send a push notification to the customer). No state machine on the server — any status is accepted.

## 2. Doctors

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/admin/doctors` | `includeInactive?` (default true) | `Doctor[]` |
| POST | `/admin/doctors` | `{ name: {ar,en}, specialty?: {ar,en}\|null, imageUrl?: url\|null, workingDays: number[] (ISO 1=Mon…7=Sun, min 1), isActive: bool }` | 201 `Doctor` |
| PATCH | `/admin/doctors/:id` | partial of the above | `Doctor` |

No DELETE — deactivate instead. Page: simple table + create/edit sheet with a weekday picker.

## 3. Promo codes

| Method | Path | Body / query | Returns |
|---|---|---|---|
| GET | `/admin/promo-codes` | `page, limit, active?` | `PromoCode[]` + meta |
| POST | `/admin/promo-codes` | `{ code: ^[A-Z0-9_-]{3,30}$, type: percent\|fixed, value: int>0 (≤100 for percent), minSubtotal: int (0), maxDiscount?: int\|null, startsAt?: ISO\|null, endsAt?: ISO\|null, maxUses?: int\|null, isActive: bool }` | 201 |
| PATCH | `/admin/promo-codes/:id` | same fields optional — **`code` cannot change** | `PromoCode` |
| DELETE | `/admin/promo-codes/:id` | — | 204 |

`PromoCode = { id, code, type, value, minSubtotal, maxDiscount, startsAt, endsAt, maxUses, usedCount, isActive, createdAt }`.
Page: table with usage (`usedCount / maxUses`), validity window, active switch; create/edit sheet.

## 4. Banners (home-screen hero)

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/admin/banners` | — (all, unpaginated) | `Banner[]` |
| POST | `/admin/banners` | `{ title: {ar,en}, subtitle?: {ar,en}\|null, cta?: {ar,en}\|null, imageUrl?: url\|null, link?: string≤300\|null (in-app route e.g. "/categories?category=sun" or "/book-exam"), sortOrder: int, startsAt?, endsAt?, isActive: bool }` | 201 |
| PATCH | `/admin/banners/:id` | partial | `Banner` |
| DELETE | `/admin/banners/:id` | — | 204 |

Page: sortable list (drag or up/down → `sortOrder`), schedule window, active switch, image upload (see §7).

## 5. Categories & brands

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/admin/categories` | `includeInactive?` | `Category[]` (with `productCount`) |
| POST | `/admin/categories` | `{ slug: ^[a-z0-9-]+$, name: {ar,en}, description?: {ar,en}\|null, imageUrl?: url\|null, sortOrder: int, isActive: bool }` | 201 |
| PATCH | `/admin/categories/:id` | partial | `Category` |
| DELETE | `/admin/categories/:id` | — (409 if products exist) | 204 |
| GET | `/admin/brands` | `includeInactive?` | `Brand[]` |
| POST | `/admin/brands` | `{ slug, name: {ar,en}, logoUrl?: url\|null, isActive: bool }` | 201 |
| PATCH | `/admin/brands/:id` | partial | `Brand` |
| DELETE | `/admin/brands/:id` | — (409 if used) | 204 |

Note: the mobile app's category chips are keyed by slug (`prescription, sun, contact, kids, accessories`) — renaming slugs breaks deep links.
Page: two tabs, each a small table + create/edit sheet.

## 6. Reviews (moderation)

| Method | Path | Body / query | Returns |
|---|---|---|---|
| GET | `/admin/reviews` | `page, limit, productId?, userId?, visible?` | `Review[]` + meta |
| PATCH | `/admin/reviews/:id/visibility` | `{ isVisible: boolean }` | `Review` |
| DELETE | `/admin/reviews/:id` | — | 204 |

`Review = { id, productId, rating: 1–5, comment, isVisible, createdAt, user: { id, name, image } }`.
Page: list with rating, comment, product link; hide/show toggle; delete with confirm. Hiding recomputes the product's rating.

## 7. Product create / edit form — ✅ done (2026-09-16)

Implemented in `src/features/products/product-form-page.tsx` (`/products/new`, `/products/:id/edit`) with
UploadThing uploads via `src/lib/uploadthing.ts` (`productImage` route, admin cookie). Remaining polish ideas:
drag-to-reorder images (currently up/down buttons), per-image PATCH on the backend (alt/colour edits are
re-added today), and a "duplicate product" action.

## 8. Nice-to-haves already supported by the API

- Order search by number / customer (`GET /admin/orders?search=`), date range (`from`/`to`), `paymentStatus`, `deliveryMethod`, `userId` — a "customer → their orders" drill-down is one query away.
- `GET /admin/users/:id` returns `stats { orders, totalSpent, lastOrderAt }` for a customer profile page.
- Better Auth admin plugin endpoints at `/api/auth/admin/*` (impersonate user, revoke sessions, set password, create/remove user) are live but not wrapped by the panel.
- `GET /docs` — Swagger UI for every endpoint above; `GET /docs/openapi.json` for the raw spec.
