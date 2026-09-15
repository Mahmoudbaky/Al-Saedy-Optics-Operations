import * as React from "react"
import { useSearchParams } from "react-router"

import {
  useApiErrorMessage,
  useDashboardOverview,
  useOrder,
  useOrders,
  useUpdateOrderDetails,
  useUpdateOrderStatus,
  type OrderStatus,
  type UpdateOrderDetailsInput,
} from "@/api"
import { PageHeader } from "@/components/layout/page-header"
import { BulkActionBar } from "@/components/shared/bulk-action-bar"
import { QueryState } from "@/components/shared/query-state"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { useI18n } from "@/lib/i18n"
import type { Order } from "@/types"
import { OrderDrawer } from "./order-drawer"
import { OrdersFiltersBar } from "./orders-filters"
import { OrdersTable } from "./orders-table"
import { SavedViews } from "./saved-views"
import { toOrderQuery, useOrdersFilters, VIEW_QUERY, type SavedView } from "./use-orders-filters"

const ORDER_PARAM = "order"

/** GET /admin/orders — server-side filters + pagination, saved views, bulk actions, detail drawer. */
function OrdersPage() {
  const { t, id: fmtId } = useI18n()
  const errorMessage = useApiErrorMessage()
  const { filters, update, clear } = useOrdersFilters()
  const [params, setParams] = useSearchParams()
  const [selectedIds, setSelectedIds] = React.useState<ReadonlySet<string>>(new Set())

  // The saved view supplies the base query; explicit filters narrow it further.
  const query = { ...VIEW_QUERY[filters.view], ...toOrderQuery(filters) }
  const orders = useOrders(query)
  const rows = orders.data?.data ?? []
  const meta = orders.data?.meta

  const overview = useDashboardOverview()
  const unpaidCod = useOrders({ status: "delivered", paymentStatus: "unpaid", limit: 1 })
  const counts: Partial<Record<SavedView, number>> = {
    needs_action: overview.data?.orders.needsAction,
    all: overview.data?.orders.total,
    lab: overview.data?.orders.byStatus.lab ?? (overview.data ? 0 : undefined),
    out_for_delivery: overview.data?.orders.byStatus.onTheWay ?? (overview.data ? 0 : undefined),
    unpaid_cod: unpaidCod.data?.meta.total,
  }

  const openId = params.get(ORDER_PARAM)
  const openOrder = useOrder(openId)
  const setOpenOrder = (order: Order | null) => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (order) next.set(ORDER_PARAM, order.id)
        else next.delete(ORDER_PARAM)
        return next
      },
      { replace: true }
    )
  }

  const updateStatus = useUpdateOrderStatus()
  const updateDetails = useUpdateOrderDetails()

  /** POST /admin/orders/:id/status */
  const advance = async (order: Order, status: OrderStatus) => {
    try {
      await updateStatus.mutateAsync({ id: order.id, status })
      toast.add({
        type: "success",
        title: t("orders.toast.moved", { number: fmtId(order.number), status: t(`status.${status}`) }),
        description: t("orders.toast.movedHint"),
      })
    } catch (err) {
      toast.add({ type: "error", title: t("orders.toast.failed", { number: fmtId(order.number) }), description: errorMessage(err) })
    }
  }

  /** PATCH /admin/orders/:id */
  const save = async (order: Order, patch: UpdateOrderDetailsInput) => {
    try {
      await updateDetails.mutateAsync({ id: order.id, ...patch })
      toast.add({ type: "success", title: t("orders.toast.saved", { number: fmtId(order.number) }) })
    } catch (err) {
      toast.add({ type: "error", title: t("orders.toast.failed", { number: fmtId(order.number) }), description: errorMessage(err) })
    }
  }

  const selectedOrders = rows.filter((o) => selectedIds.has(o.id))
  const runBulk = async (label: string, targets: Order[], run: (o: Order) => Promise<unknown>) => {
    const results = await Promise.allSettled(targets.map(run))
    const ok = results.filter((r) => r.status === "fulfilled").length
    setSelectedIds(new Set())
    toast.add({ type: ok === targets.length ? "success" : "warning", title: label, description: ok < targets.length ? errorMessage((results.find((r) => r.status === "rejected") as PromiseRejectedResult).reason) : undefined })
  }
  const advanceSelectedToLab = () => {
    const eligible = selectedOrders.filter((o) => o.nextStatuses.includes("lab"))
    void runBulk(t("orders.toast.bulk", { n: eligible.length }), eligible, (o) => updateStatus.mutateAsync({ id: o.id, status: "lab" }))
  }
  const markSelectedPaid = () => {
    const eligible = selectedOrders.filter((o) => o.paymentStatus !== "paid")
    void runBulk(t("orders.toast.bulk", { n: eligible.length }), eligible, (o) => updateDetails.mutateAsync({ id: o.id, paymentStatus: "paid" }))
  }

  return (
    <>
      <PageHeader title={t("orders.title")} endpoint="/api/v1/admin/orders" />
      <div className="flex flex-col gap-4 p-4 md:px-6 md:py-5">
        <SavedViews value={filters.view} onChange={(view) => update({ view })} counts={counts} />
        <OrdersFiltersBar filters={filters} onChange={update} onClear={clear} />

        {selectedIds.size > 0 ? (
          <BulkActionBar summary={t("orders.selected", { n: selectedIds.size })} endpoint="POST /admin/orders/:id/status">
            <Button onClick={advanceSelectedToLab} disabled={updateStatus.isPending}>
              {t("orders.advanceToLab")}
            </Button>
            <Button variant="outline" onClick={markSelectedPaid} disabled={updateDetails.isPending}>
              {t("orders.markPaid")}
            </Button>
            <Button variant="ghost" className="text-sidebar-foreground hover:bg-white/10 hover:text-white" onClick={() => setSelectedIds(new Set())}>
              {t("common.clear")}
            </Button>
          </BulkActionBar>
        ) : null}

        <QueryState query={orders} empty={rows.length === 0}>
          <OrdersTable
            orders={rows}
            meta={meta}
            busy={orders.isFetching}
            selectedIds={selectedIds}
            onToggle={(id, checked) =>
              setSelectedIds((prev) => {
                const next = new Set(prev)
                if (checked) next.add(id)
                else next.delete(id)
                return next
              })
            }
            onToggleAll={(checked) => setSelectedIds(checked ? new Set(rows.map((o) => o.id)) : new Set())}
            onOpen={setOpenOrder}
            onPageChange={(page) => update({ page })}
            onPageSizeChange={(pageSize) => update({ pageSize })}
          />
        </QueryState>
      </div>

      <OrderDrawer
        open={openId !== null}
        order={openOrder.data ?? null}
        loading={openOrder.isPending && openId !== null}
        error={openOrder.error}
        onOpenChange={(open) => {
          if (!open) setOpenOrder(null)
        }}
        onAdvance={advance}
        onSave={save}
        saving={updateDetails.isPending || updateStatus.isPending}
      />
    </>
  )
}

export { OrdersPage }
