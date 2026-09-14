import * as React from "react"
import { useSearchParams } from "react-router"

import type { DeliveryMethod, Order, OrderStatus, PaymentStatus } from "@/types"

export const SAVED_VIEWS = ["needs_action", "all", "in_lab", "out_for_delivery", "unpaid_cod"] as const
export type SavedView = (typeof SAVED_VIEWS)[number]

export type StatusFilter = OrderStatus | "any"
export type PaymentFilter = PaymentStatus | "any"
export type DeliveryFilter = DeliveryMethod | "any"

export interface OrdersFilters {
  view: SavedView
  query: string
  status: StatusFilter
  payment: PaymentFilter
  delivery: DeliveryFilter
  from: string
  to: string
}

const DEFAULTS: OrdersFilters = {
  view: "needs_action",
  query: "",
  status: "any",
  payment: "any",
  delivery: "any",
  from: "",
  to: "",
}

const NEEDS_ACTION: ReadonlySet<OrderStatus> = new Set(["pending", "confirmed", "in_lab"])

/** Saved views are just presets over the same filters the API accepts. */
const VIEW_PREDICATE: Record<SavedView, (o: Order) => boolean> = {
  needs_action: (o) => NEEDS_ACTION.has(o.status),
  all: () => true,
  in_lab: (o) => o.status === "in_lab",
  out_for_delivery: (o) => o.status === "on_the_way",
  unpaid_cod: (o) => o.paymentMethod === "cod" && o.paymentStatus === "unpaid" && o.status === "delivered",
}

function isSavedView(value: string | null): value is SavedView {
  return SAVED_VIEWS.includes(value as SavedView)
}

/** Filters live in the URL so a view can be shared or linked from the overview. */
export function useOrdersFilters() {
  const [params, setParams] = useSearchParams()

  const filters = React.useMemo<OrdersFilters>(() => {
    const view = params.get("view")
    return {
      view: isSavedView(view) ? view : DEFAULTS.view,
      query: params.get("q") ?? DEFAULTS.query,
      status: (params.get("status") as StatusFilter | null) ?? DEFAULTS.status,
      payment: (params.get("payment") as PaymentFilter | null) ?? DEFAULTS.payment,
      delivery: (params.get("delivery") as DeliveryFilter | null) ?? DEFAULTS.delivery,
      from: params.get("from") ?? DEFAULTS.from,
      to: params.get("to") ?? DEFAULTS.to,
    }
  }, [params])

  const update = React.useCallback(
    (patch: Partial<OrdersFilters>) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          const keys: Record<keyof OrdersFilters, string> = {
            view: "view",
            query: "q",
            status: "status",
            payment: "payment",
            delivery: "delivery",
            from: "from",
            to: "to",
          }
          for (const [field, value] of Object.entries(patch) as Array<[keyof OrdersFilters, string]>) {
            if (value === DEFAULTS[field]) next.delete(keys[field])
            else next.set(keys[field], value)
          }
          return next
        },
        { replace: true }
      )
    },
    [setParams]
  )

  const clear = React.useCallback(() => update({ ...DEFAULTS, view: filters.view }), [update, filters.view])

  const activeFilterCount =
    Number(filters.status !== "any") +
    Number(filters.payment !== "any") +
    Number(filters.delivery !== "any") +
    Number(Boolean(filters.from || filters.to))

  return { filters, update, clear, activeFilterCount }
}

export function applyOrdersFilters(orders: Order[], f: OrdersFilters): Order[] {
  const q = f.query.trim().toLowerCase()
  return orders.filter((o) => {
    if (!VIEW_PREDICATE[f.view](o)) return false
    if (f.status !== "any" && o.status !== f.status) return false
    if (f.payment !== "any" && o.paymentStatus !== f.payment) return false
    if (f.delivery !== "any" && o.deliveryMethod !== f.delivery) return false
    if (f.from && o.placedAt < f.from) return false
    if (f.to && o.placedAt.slice(0, 10) > f.to) return false
    if (q) {
      const haystack = `${o.number} ${o.customer.name} ${o.customer.phone}`.toLowerCase()
      if (!haystack.includes(q)) return false
    }
    return true
  })
}

/** Counts shown on the saved-view chips come from the API summary, not the page. */
export const VIEW_COUNTS: Record<SavedView, number> = {
  needs_action: 34,
  all: 396,
  in_lab: 9,
  out_for_delivery: 7,
  unpaid_cod: 6,
}
