import * as React from "react"
import { useSearchParams } from "react-router"

import { PageHeader } from "@/components/layout/page-header"
import { BulkActionBar } from "@/components/shared/bulk-action-bar"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { NEXT_STATUSES, orders as seedOrders } from "@/data/orders"
import { useI18n } from "@/lib/i18n"
import type { Order, OrderStatus } from "@/types"
import { OrderDrawer } from "./order-drawer"
import { OrdersFiltersBar } from "./orders-filters"
import { OrdersTable } from "./orders-table"
import { SavedViews } from "./saved-views"
import { applyOrdersFilters, useOrdersFilters } from "./use-orders-filters"

const ORDER_PARAM = "order"

/** GET /admin/orders — filters, saved views, bulk selection, detail drawer. */
function OrdersPage() {
  const { t, id } = useI18n()
  const { filters, update, clear } = useOrdersFilters()
  const [params, setParams] = useSearchParams()
  const [orders, setOrders] = React.useState<Order[]>(seedOrders)
  const [selectedIds, setSelectedIds] = React.useState<ReadonlySet<string>>(new Set())

  const visible = React.useMemo(() => applyOrdersFilters(orders, filters), [orders, filters])
  const openOrder = React.useMemo(() => {
    const number = params.get(ORDER_PARAM)
    return number ? (orders.find((o) => String(o.number) === number) ?? null) : null
  }, [params, orders])

  const setOpenOrder = (order: Order | null) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (order) next.set(ORDER_PARAM, String(order.number))
        else next.delete(ORDER_PARAM)
        return next
      },
      { replace: true }
    )
  }

  const patchOrder = (id: string, patch: Partial<Order>) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)))

  /** POST /admin/orders/:id/status */
  const advance = (order: Order, status: OrderStatus) => {
    patchOrder(order.id, {
      status,
      nextStatuses: NEXT_STATUSES[status],
      updatedAt: new Date().toISOString(),
    })
    toast.add({
      type: "success",
      title: t("orders.toast.moved", { number: id(order.number), status: t(`status.${status}`) }),
      description: t("orders.toast.movedHint"),
    })
  }

  /** PATCH /admin/orders/:id */
  const save = (order: Order, patch: Pick<Order, "courier" | "adminNote">) => {
    patchOrder(order.id, { ...patch, updatedAt: new Date().toISOString() })
    toast.add({ type: "success", title: t("orders.toast.saved", { number: id(order.number) }) })
  }

  const advanceSelectedToLab = () => {
    const eligible = orders.filter((o) => selectedIds.has(o.id) && o.nextStatuses.includes("in_lab"))
    setOrders((prev) =>
      prev.map((o) =>
        eligible.some((e) => e.id === o.id)
          ? { ...o, status: "in_lab", nextStatuses: NEXT_STATUSES.in_lab, updatedAt: new Date().toISOString() }
          : o
      )
    )
    setSelectedIds(new Set())
    toast.add({ type: "success", title: t("orders.toast.bulk", { n: eligible.length }) })
  }

  const markSelectedPaid = () => {
    setOrders((prev) =>
      prev.map((o) => (selectedIds.has(o.id) ? { ...o, paymentStatus: "paid" } : o))
    )
    setSelectedIds(new Set())
  }

  return (
    <>
      <PageHeader title={t("orders.title")} endpoint="/api/v1/admin/orders" />
      <div className="flex flex-col gap-4 p-4 md:px-6 md:py-5">
        <SavedViews value={filters.view} onChange={(view) => update({ view })} />
        <OrdersFiltersBar filters={filters} onChange={update} onClear={clear} />

        {selectedIds.size > 0 ? (
          <BulkActionBar
            summary={t("orders.selected", { n: selectedIds.size })}
            endpoint="POST /admin/orders/:id/status"
          >
            <Button onClick={advanceSelectedToLab}>{t("orders.advanceToLab")}</Button>
            <Button variant="outline" onClick={markSelectedPaid}>
              {t("orders.markPaid")}
            </Button>
            <Button variant="outline">{t("orders.printLabTickets")}</Button>
            <Button
              variant="ghost"
              className="text-sidebar-foreground hover:bg-white/10 hover:text-white"
              onClick={() => setSelectedIds(new Set())}
            >
              {t("common.clear")}
            </Button>
          </BulkActionBar>
        ) : null}

        <OrdersTable
          orders={visible}
          selectedIds={selectedIds}
          onToggle={(id, checked) =>
            setSelectedIds((prev) => {
              const next = new Set(prev)
              if (checked) next.add(id)
              else next.delete(id)
              return next
            })
          }
          onToggleAll={(checked) => setSelectedIds(checked ? new Set(visible.map((o) => o.id)) : new Set())}
          onOpen={setOpenOrder}
        />
      </div>

      <OrderDrawer
        order={openOrder}
        onOpenChange={(open) => {
          if (!open) setOpenOrder(null)
        }}
        onAdvance={advance}
        onSave={save}
      />
    </>
  )
}

export { OrdersPage }
