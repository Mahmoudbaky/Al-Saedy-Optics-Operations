/**
 * Backend DTOs for `/api/v1/admin/*` (mirrors `src/modules/<x>/<x>.schema.ts` in the backend).
 * Bilingual text is `{ ar, en }`; money is integer IQD; ids are UUIDs.
 */
export interface LocalizedString {
  ar: string
  en: string
}

export type OrderStatus = "pending" | "confirmed" | "lab" | "onTheWay" | "ready" | "delivered" | "cancelled"
export type DeliveryMethod = "home" | "pickup"
export type PaymentMethod = "cod" | "wallet" | "card"
export type PaymentStatus = "unpaid" | "paid" | "refunded"
export type PrescriptionStatus = "pending" | "verified" | "expired" | "rejected"
export type PrescriptionSource = "manual" | "upload" | "clinic"
export type FrameShape = "rectangle" | "round" | "oval" | "aviator" | "square" | "half-rim" | "cat-eye"
export type Gender = "men" | "women" | "unisex" | "kids"
export type UserRole = "user" | "admin"
export type ProductSort = "newest" | "priceAsc" | "priceDesc" | "bestSelling" | "rating" | "name"

export interface PageMeta {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PageQuery {
  page?: number
  limit?: number
}

/* ── Dashboard ─────────────────────────────────────────────────────── */

export interface DashboardOverview {
  orders: { byStatus: Partial<Record<OrderStatus, number>>; needsAction: number; total: number }
  revenue: { today: number; month: number; allTime: number; deliveredOrders: number }
  customers: { total: number; newThisMonth: number }
  catalog: { activeProducts: number; lowStockVariants: number; lowStockThreshold: number }
  clinic: { pendingPrescriptions: number; upcomingAppointments: number }
}

export interface RevenuePoint {
  /** `YYYY-MM-DD` */
  day: string
  revenue: number
  orders: number
}

export interface TopProduct {
  productId: string | null
  name: LocalizedString
  quantity: number
  revenue: number
}

/* ── Catalogue ─────────────────────────────────────────────────────── */

export interface Category {
  id: string
  slug: string
  name: LocalizedString
  description: LocalizedString | null
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
  productCount?: number
}

export interface Brand {
  id: string
  slug: string
  name: LocalizedString
  logoUrl: string | null
  isActive: boolean
}

export interface LensAddon {
  /** camelCase key the storefront sends, e.g. `blueLight`. Immutable. */
  id: string
  name: LocalizedString
  description: LocalizedString | null
  price: number
  sortOrder: number
  isActive: boolean
}

export interface LensAddonInput {
  id: string
  name: LocalizedString
  description?: { ar: string | null; en: string | null } | null
  price: number
  sortOrder: number
  isActive: boolean
}

export interface FrameSpecs {
  lensWidth?: number
  bridge?: number
  templeLength?: number
  frameWidth?: number
  lensHeight?: number
  weightGrams?: number
  material?: string
}

export interface ProductVariant {
  id: string
  colorHex: string
  colorName: LocalizedString | null
  sku: string | null
  stock: number
  inStock: boolean
  sortOrder: number
  isActive: boolean
  images: string[]
}

export interface ProductImage {
  id: string
  url: string
  alt: string | null
  sortOrder: number
  variantId: string | null
}

/** Admin list rows and detail responses share this shape (`related` is empty on admin routes). */
export interface Product {
  id: string
  slug: string
  code: string | null
  name: LocalizedString
  brand: Pick<Brand, "id" | "slug" | "name"> | null
  category: Pick<Category, "id" | "slug" | "name">
  price: number
  compareAtPrice: number | null
  discountPercent: number
  shape: FrameShape | null
  gender: Gender | null
  colors: string[]
  note: LocalizedString | null
  image: string | null
  isBestSeller: boolean
  isNew: boolean
  inStock: boolean
  rating: { average: number; count: number }
  isActive: boolean
  description: LocalizedString | null
  specs: FrameSpecs | null
  supportsLensAddons: boolean
  requiresPrescription: boolean
  images: ProductImage[]
  variants: ProductVariant[]
  soldCount: number
  createdAt: string
  updatedAt: string
}

export interface ProductListQuery extends PageQuery {
  category?: string
  brand?: string
  shape?: FrameShape
  gender?: Gender
  minPrice?: number
  maxPrice?: number
  search?: string
  bestSeller?: boolean
  onSale?: boolean
  inStock?: boolean
  ids?: string[]
  sort?: ProductSort
  includeInactive?: boolean
  lowStock?: number
}

export type BulkProductAction = "activate" | "deactivate" | "markBestSeller" | "unmarkBestSeller" | "delete"

/* ── Orders ────────────────────────────────────────────────────────── */

export interface EyeValues {
  sph: string | null
  cyl: string | null
  axis: string | null
}

export interface OrderItem {
  id: string
  productId: string | null
  variantId: string | null
  name: LocalizedString
  code: string | null
  colorHex: string | null
  imageUrl: string | null
  variantLabel: string | null
  addons: { id: string; name: LocalizedString; price: number }[]
  unitPrice: number
  quantity: number
  lineTotal: number
}

export interface OrderAddress {
  recipientName: string
  phone: string
  city: string
  area: string
  street: string | null
  building: string | null
  notes: string | null
  formatted: string
}

export interface AdminOrder {
  id: string
  number: number
  status: OrderStatus
  deliveryMethod: DeliveryMethod
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  address: OrderAddress | null
  /** Frozen at checkout; see `prescriptionStatus` for the live state. */
  prescription: { id: string; od: EyeValues; os: EyeValues; pd: string | null; add: string | null } | null
  prescriptionStatus: PrescriptionStatus | null
  items: OrderItem[]
  itemCount: number
  subtotal: number
  discount: number
  deliveryFee: number
  total: number
  currency: string
  promoCode: string | null
  customerNote: string | null
  courier: { name: string; phone: string | null } | null
  eta: LocalizedString | null
  timeline: { status: OrderStatus; at: string | null; note: string | null }[]
  canCancel: boolean
  cancelReason: string | null
  createdAt: string
  updatedAt: string
  adminNote: string | null
  user: { id: string; name: string; email: string; phone: string | null }
  events: { status: OrderStatus; at: string; note: string | null; actorId: string | null }[]
  /** Transitions allowed from the current status. */
  nextStatuses: OrderStatus[]
}

export interface OrderListQuery extends PageQuery {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  deliveryMethod?: DeliveryMethod
  userId?: string
  search?: string
  from?: string
  to?: string
}

export interface UpdateOrderDetailsInput {
  courierName?: string | null
  courierPhone?: string | null
  eta?: LocalizedString | null
  adminNote?: string | null
  paymentStatus?: PaymentStatus
}

/* ── Users ─────────────────────────────────────────────────────────── */

export interface AdminUser {
  id: string
  name: string
  email: string
  emailVerified: boolean
  phone: string | null
  locale: string
  image: string | null
  role: UserRole
  banned: boolean
  banReason: string | null
  banExpires: string | null
  createdAt: string
  stats: { orders: number; totalSpent: number; lastOrderAt: string | null }
}

export interface UserListQuery extends PageQuery {
  search?: string
  role?: UserRole
  banned?: boolean
}

/* ── Prescriptions ─────────────────────────────────────────────────── */

export interface AdminPrescription {
  id: string
  userId: string
  label: string | null
  doctorName: string | null
  issuedOn: string | null
  expiresOn: string | null
  source: PrescriptionSource
  status: PrescriptionStatus
  od: EyeValues
  os: EyeValues
  pd: string | null
  add: string | null
  imageUrl: string | null
  reviewNote: string | null
  createdAt: string
  user: { id: string; name: string; email: string; phone: string | null }
  /** Open order (pending/confirmed) blocked on this prescription. */
  waitingOrderNumber: number | null
}

export interface PrescriptionListQuery extends PageQuery {
  status?: PrescriptionStatus
  userId?: string
}

export interface ReviewPrescriptionInput {
  status: "verified" | "rejected" | "expired"
  reviewNote?: string | null
  od?: Partial<EyeValues>
  os?: Partial<EyeValues>
  pd?: string | null
  add?: string | null
  expiresOn?: string | null
}
