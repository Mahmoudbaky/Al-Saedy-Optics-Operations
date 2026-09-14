import { TrendingUpIcon } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { SectionHeading } from "@/components/shared/section-heading"
import { StatCard } from "@/components/shared/stat-card"
import {
  dashboardSummary as s,
  ordersByStatus,
  revenueLast14Days,
  topProducts,
} from "@/data/dashboard"
import { LOW_STOCK_THRESHOLD } from "@/data/products"
import { useI18n } from "@/lib/i18n"
import { NeedsYouNow } from "./needs-you-now"
import { OrdersByStatus } from "./orders-by-status"
import { RevenueChart } from "./revenue-chart"
import { TopProductsTable } from "./top-products-table"

/** GET /admin/dashboard */
function OverviewPage() {
  const { t, n, compact, duration } = useI18n()

  return (
    <>
      <PageHeader title={t("overview.title")} endpoint="/api/v1/admin/dashboard" search />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <section
          aria-label={t("overview.title")}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
        >
          <StatCard
            label={t("overview.revenueToday")}
            value={n(s.revenueToday)}
            caption={
              <>
                <TrendingUpIcon className="size-3.5" aria-hidden="true" />
                {t("overview.vsYesterday", { pct: s.revenueTodayDeltaPct })}
              </>
            }
            captionTone="success"
          />
          <StatCard
            label={t("overview.revenueMonth")}
            value={compact(s.revenueMonth)}
            caption={t("overview.deliveredOrders", { n: s.deliveredThisMonth })}
          />
          <StatCard
            label={t("overview.needingAction")}
            value={n(s.ordersNeedingAction)}
            tone="brand"
            caption={t("overview.actionBreakdown")}
          />
          <StatCard
            label={t("overview.toVerify")}
            value={n(s.prescriptionsToVerify)}
            caption={t("overview.oldestWaiting", { duration: duration(s.oldestPrescriptionWaitMinutes) })}
            captionTone="warning"
          />
          <StatCard
            label={t("overview.lowStock")}
            value={n(s.lowStockColours)}
            caption={t("overview.atOrBelow", { n: LOW_STOCK_THRESHOLD })}
          />
        </section>

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1fr_420px]">
          <div className="flex flex-col gap-3">
            <SectionHeading aside="GET /admin/dashboard/revenue?days=14">
              {t("overview.revenue14")}
            </SectionHeading>
            <RevenueChart data={revenueLast14Days} />

            <SectionHeading className="mt-2" aside={t("overview.byUnits")}>
              {t("overview.topProducts")}
            </SectionHeading>
            <TopProductsTable data={topProducts} />
          </div>

          <div className="flex flex-col gap-3">
            <SectionHeading>{t("overview.byStatus")}</SectionHeading>
            <OrdersByStatus data={ordersByStatus} />

            <SectionHeading className="mt-2">{t("overview.needsYou")}</SectionHeading>
            <NeedsYouNow />
          </div>
        </div>
      </div>
    </>
  )
}

export { OverviewPage }
