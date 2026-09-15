import { TrendingUpIcon } from "lucide-react"

import { useDashboardOverview, useOrders, useRevenue, useTopProducts } from "@/api"
import { PageHeader } from "@/components/layout/page-header"
import { QueryState } from "@/components/shared/query-state"
import { SectionHeading } from "@/components/shared/section-heading"
import { StatCard } from "@/components/shared/stat-card"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/lib/i18n"
import { ORDER_STATUSES } from "@/types"
import { NeedsYouNow } from "./needs-you-now"
import { OrdersByStatus } from "./orders-by-status"
import { RevenueChart, type RevenuePoint } from "./revenue-chart"
import { TopProductsTable } from "./top-products-table"

const REVENUE_DAYS = 14

/** GET /admin/dashboard/overview + /revenue + /top-products */
function OverviewPage() {
  const { t, n, compact, locale } = useI18n()
  const overview = useDashboardOverview()
  const revenue = useRevenue(REVENUE_DAYS)
  const topProducts = useTopProducts(30, 5)
  // The overview has no "unpaid COD" counter; a 1-row list query gives the total for free.
  const unpaidCod = useOrders({ status: "delivered", paymentStatus: "unpaid", limit: 1 })

  const s = overview.data
  const today = new Date().toISOString().slice(0, 10)
  const chart: RevenuePoint[] = (revenue.data ?? []).map((p) => ({
    date: p.day,
    label: String(Number(p.day.slice(8, 10))),
    revenue: p.revenue,
    orders: p.orders,
    isToday: p.day === today,
  }))
  const byStatus = ORDER_STATUSES.map((status) => ({ status, count: s?.orders.byStatus[status] ?? 0 }))

  return (
    <>
      <PageHeader title={t("overview.title")} endpoint="/api/v1/admin/dashboard/overview" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <section aria-label={t("overview.title")} className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {s ? (
            <>
              <StatCard
                label={t("overview.revenueToday")}
                value={n(s.revenue.today)}
                caption={
                  <>
                    <TrendingUpIcon className="size-3.5" aria-hidden="true" />
                    {t("overview.vsYesterday", { n: s.revenue.deliveredOrders })}
                  </>
                }
                captionTone="success"
              />
              <StatCard label={t("overview.revenueMonth")} value={compact(s.revenue.month)} caption={t("overview.deliveredOrders", { n: s.revenue.deliveredOrders })} />
              <StatCard label={t("overview.needingAction")} value={n(s.orders.needsAction)} tone="brand" caption={t("overview.actionBreakdown")} />
              <StatCard
                label={t("overview.toVerify")}
                value={n(s.clinic.pendingPrescriptions)}
                caption={t("overview.rxToVerifyHint", { n: s.clinic.upcomingAppointments })}
                captionTone={s.clinic.pendingPrescriptions > 0 ? "warning" : undefined}
              />
              <StatCard label={t("overview.lowStock")} value={n(s.catalog.lowStockVariants)} caption={t("overview.atOrBelow", { n: s.catalog.lowStockThreshold })} />
            </>
          ) : (
            Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-[104px] rounded-xl" />)
          )}
        </section>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_420px]">
          <div className="flex flex-col gap-3">
            <SectionHeading aside={`GET /admin/dashboard/revenue?days=${REVENUE_DAYS}`}>{t("overview.revenue14")}</SectionHeading>
            <QueryState query={revenue} skeleton={<Skeleton className="h-[268px] rounded-xl" />}>
              <RevenueChart data={chart} />
            </QueryState>

            <SectionHeading className="mt-2" aside={t("overview.byUnits")}>
              {t("overview.topProducts")}
            </SectionHeading>
            <QueryState query={topProducts} empty={topProducts.data?.length === 0} skeleton={<Skeleton className="h-[220px] rounded-xl" />}>
              <TopProductsTable
                data={(topProducts.data ?? []).map((p, i) => ({ id: p.productId ?? String(i), name: p.name[locale], units: p.quantity, revenue: p.revenue }))}
              />
            </QueryState>
          </div>

          <div className="flex flex-col gap-3">
            <SectionHeading>{t("overview.byStatus")}</SectionHeading>
            <QueryState query={overview} skeleton={<Skeleton className="h-[300px] rounded-xl" />}>
              <OrdersByStatus data={byStatus} />
            </QueryState>

            <SectionHeading className="mt-2">{t("overview.needsYou")}</SectionHeading>
            {s ? (
              <NeedsYouNow
                prescriptionsToVerify={s.clinic.pendingPrescriptions}
                upcomingAppointments={s.clinic.upcomingAppointments}
                unpaidCod={unpaidCod.data?.meta.total ?? 0}
                lowStock={s.catalog.lowStockVariants}
                lowStockThreshold={s.catalog.lowStockThreshold}
                activeProducts={s.catalog.activeProducts}
              />
            ) : (
              <Skeleton className="h-[200px] rounded-xl" />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export { OverviewPage }
