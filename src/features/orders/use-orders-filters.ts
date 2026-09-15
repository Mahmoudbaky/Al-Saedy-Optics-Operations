import * as React from "react"
import { useSearchParams } from "react-router"

import type { DeliveryMethod, OrderListQuery, OrderStatus, PaymentStatus } from "@/api/types"

export const SAVED_VIEWS = ["needs_action", "all", "lab", "out_for_delivery", "unpaid_cod"] as const
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
  page: number
  pageSize: number
}

const DEFAULTS: OrdersFilters = {
  view: "needs_action",
  query: "",
  status: "any",
  payment: "any",
  delivery: "any",
  from: "",
  to: "",
  page: 1,
  pageSize: 25,
}

/**
 * Saved views are presets over the filters `GET /admin/orders` accepts. The API takes a
 * single `status`, so "needs action" (pending+confirmed+lab) is fetched as one query per status.
 */
export const VIEW_QUERY: Record<SavedView, Partial<OrderListQuery>[]> = {
  needs_action: [{ status: "pending" }, { status: "confirmed" }, { status: "lab" }],
  all: [{}],
  lab: [{ status: "lab" }],
  out_for_delivery: [{ status: "onTheWay" }],
  unpaid_cod: [{ status: "delivered", paymentStatus: "unpaid" }],
}

function isSavedView(value: string | null): value is SavedView {
  return SAVED_VIEWS.includes(value as SavedView)
}

const toIso = (date: string, endOfDay: boolean) => (date ? new Date(`${date}T${endOfDay ? "23:59:59.999" : "00:00:00"}`).toISOString() : undefined)

/** Translates the URL filters into the query string the backend expects. */
export function toOrderQuery(f: OrdersFilters): OrderListQuery {
  return {
    status: f.status === "any" ? undefined : f.status,
    paymentStatus: f.payment === "any" ? undefined : f.payment,
    deliveryMethod: f.delivery === "any" ? undefined : f.delivery,
    search: f.query.trim() || undefined,
    from: toIso(f.from, false),
    to: toIso(f.to, true),
    page: f.page,
    limit: f.pageSize,
  }
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
      page: Math.max(1, Number(params.get("page")) || DEFAULTS.page),
      pageSize: Number(params.get("limit")) || DEFAULTS.pageSize,
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
            page: "page",
            pageSize: "limit",
          }
          // Any filter change restarts pagination unless the page itself is being set.
          const withPage = "page" in patch ? patch : { ...patch, page: DEFAULTS.page }
          for (const [field, value] of Object.entries(withPage) as Array<[keyof OrdersFilters, string | number]>) {
            if (value === DEFAULTS[field]) next.delete(keys[field])
            else next.set(keys[field], String(value))
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
