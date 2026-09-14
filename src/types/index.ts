/**
 * Domain types. Enum values mirror the backend so that statuses, prescription
 * fields and product variants render exactly what the API returns.
 */

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "in_lab",
  "on_the_way",
  "ready",
  "delivered",
  "cancelled",
] as const
export type OrderStatus = (typeof ORDER_STATUSES)[number]

export type PaymentMethod = "cod" | "card" | "wallet"
export type PaymentStatus = "unpaid" | "paid" | "refunded"
export type DeliveryMethod = "home" | "pickup"

export type PrescriptionStatus = "pending" | "verified" | "rejected"
export type PrescriptionSource = "upload" | "typed" | "exam"

export type Language = "en" | "ar"
export type UserRole = "customer" | "admin"
export type UserStatus = "active" | "banned"

export type ProductCategory =
  | "eyeglasses"
  | "sunglasses"
  | "contact_lenses"
  | "kids"
  | "reading"
  | "accessories"

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  language: Language
  role: UserRole
  status: UserStatus
  ordersCount: number
  totalSpent: number
  lastOrderAt: string | null
  joinedAt: string
}

export interface OrderItem {
  id: string
  productName: string
  modelCode: string
  variant: string
  quantity: number
  lineTotal: number
}

export interface EyeValues {
  sph: number | null
  cyl: number | null
  axis: number | null
}

export interface Prescription {
  id: string
  customerId: string
  customerName: string
  status: PrescriptionStatus
  source: PrescriptionSource
  od: EyeValues
  os: EyeValues
  pd: string | null
  add: string | null
  doctorName: string | null
  issuedOn: string | null
  expiresOn: string | null
  imageFileName: string | null
  imageSizeMb: number | null
  submittedAt: string
  verifiedBy: string | null
  verifiedOn: string | null
  previousCount: number
  expiredCount: number
  waitingOrderNumber: number | null
}

export interface Order {
  id: string
  number: number
  customer: Pick<Customer, "id" | "name" | "phone">
  items: OrderItem[]
  rxStatus: PrescriptionStatus | null
  total: number
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  deliveryMethod: DeliveryMethod
  status: OrderStatus
  /** Transitions the API allows from the current status. */
  nextStatuses: OrderStatus[]
  updatedAt: string
  placedAt: string
  address: string | null
  deliveryEta: string | null
  courier: { name: string; phone: string; etaEn: string; etaAr: string } | null
  adminNote: string | null
  prescription: Pick<Prescription, "od" | "os" | "pd" | "status" | "verifiedBy" | "verifiedOn"> | null
}

export type FrameShape = "rectangular" | "aviator" | "square" | "round" | "none"
export type ProductGender = "men" | "women" | "unisex" | "kids"

export interface ProductColour {
  id: string
  name: string
  hex: string
  stock: number
}

export interface Product {
  id: string
  name: string
  nameAr: string
  modelCode: string
  category: ProductCategory
  brand: string | null
  shape: FrameShape
  gender: ProductGender
  price: number
  compareAtPrice: number | null
  colours: ProductColour[]
  soldCount: number
  isBestSeller: boolean
  requiresPrescription: boolean
  isActive: boolean
}

export interface LensAddon {
  id: string
  /** camelCase key the storefront sends — changing it breaks existing carts. */
  key: string
  nameEn: string
  descriptionEn: string
  nameAr: string
  price: number
  sortOrder: number
  isActive: boolean
  pastOrdersCount: number
}
