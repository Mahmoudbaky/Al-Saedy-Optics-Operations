/**
 * Domain types used by the screens. They are the backend DTOs (see `@/api/types`)
 * under the names the UI grew up with, so enum values render exactly what the API returns.
 */
export type {
  AdminOrder as Order,
  AdminPrescription as Prescription,
  AdminUser as Customer,
  DeliveryMethod,
  EyeValues,
  FrameShape,
  Gender as ProductGender,
  LensAddon,
  LocalizedString,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PrescriptionSource,
  PrescriptionStatus,
  Product,
  ProductVariant,
  UserRole,
} from "@/api/types"

export const ORDER_STATUSES = ["pending", "confirmed", "lab", "onTheWay", "ready", "delivered", "cancelled"] as const
export const PRESCRIPTION_STATUSES = ["pending", "verified", "expired", "rejected"] as const
export const PRESCRIPTION_SOURCES = ["manual", "upload", "clinic"] as const
export const FRAME_SHAPES = ["rectangle", "round", "oval", "aviator", "square", "half-rim", "cat-eye"] as const
export const GENDERS = ["men", "women", "unisex", "kids"] as const

export type Language = "en" | "ar"
export type UserStatus = "active" | "banned"
