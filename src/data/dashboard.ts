import type { OrderStatus } from "@/types"

/** GET /admin/dashboard */
export const dashboardSummary = {
  revenueToday: 1_284_000,
  revenueTodayDeltaPct: 18,
  revenueMonth: 28_400_000,
  deliveredThisMonth: 312,
  ordersNeedingAction: 34,
  prescriptionsToVerify: 12,
  oldestPrescriptionWaitMinutes: 380,
  lowStockColours: 9,
  unpaidCodDelivered: 6,
  uploadedScansPending: 4,
  typedPending: 8,
}

/** GET /admin/dashboard/revenue?days=14 — one point per day, oldest first. */
export interface RevenuePoint {
  date: string
  label: string
  revenue: number
  /** Days the ops team flagged (promo, clinic day) get a stronger bar. */
  highlighted?: boolean
  isToday?: boolean
}

export const revenueLast14Days: RevenuePoint[] = [
  { date: "2026-07-31", label: "31", revenue: 580_000 },
  { date: "2026-08-01", label: "1", revenue: 760_000 },
  { date: "2026-08-02", label: "2", revenue: 525_000 },
  { date: "2026-08-03", label: "3", revenue: 842_000 },
  { date: "2026-08-04", label: "4", revenue: 676_000 },
  { date: "2026-08-05", label: "5", revenue: 994_000, highlighted: true },
  { date: "2026-08-06", label: "6", revenue: 911_000, highlighted: true },
  { date: "2026-08-07", label: "7", revenue: 607_000 },
  { date: "2026-08-08", label: "8", revenue: 800_000 },
  { date: "2026-08-09", label: "9", revenue: 1_118_000, highlighted: true },
  { date: "2026-08-10", label: "10", revenue: 952_000 },
  { date: "2026-08-11", label: "11", revenue: 718_000 },
  { date: "2026-08-12", label: "12", revenue: 1_049_000 },
  { date: "2026-08-13", label: "13", revenue: 1_284_000, isToday: true },
]

export const ordersByStatus: Array<{ status: OrderStatus; count: number }> = [
  { status: "pending", count: 11 },
  { status: "confirmed", count: 14 },
  { status: "in_lab", count: 9 },
  { status: "on_the_way", count: 7 },
  { status: "ready", count: 5 },
  { status: "delivered", count: 312 },
  { status: "cancelled", count: 8 },
]

export const topProducts = [
  { id: "p-vc214", name: "VC 214 · Rectangular acetate", units: 86, revenue: 6_450_000, inStock: 42 },
  { id: "p-av110", name: "AV 110 · Aviator sunglasses", units: 71, revenue: 8_520_000, inStock: 18 },
  { id: "p-cl30", name: "CL 30 · Monthly contact lenses", units: 64, revenue: 2_432_000, inStock: 120 },
  { id: "p-ti07", name: "TI 07 · Titanium half-rim", units: 52, revenue: 5_096_000, inStock: 3 },
  { id: "p-kd22", name: "KD 22 · Kids flexible frame", units: 44, revenue: 1_980_000, inStock: 61 },
]
