import { BanknoteIcon, FileTextIcon, PackageXIcon } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { dashboardSummary as s } from "@/data/dashboard"
import { useI18n } from "@/lib/i18n"

/** The three queues that block revenue today, each with a direct action. */
function NeedsYouNow() {
  const { t } = useI18n()
  const items = [
    {
      id: "rx",
      icon: FileTextIcon,
      iconClass: "text-critical",
      title: t("overview.rxToVerify", { n: s.prescriptionsToVerify }),
      hint: t("overview.rxToVerifyHint", { scans: s.uploadedScansPending, typed: s.typedPending }),
      action: t("overview.review"),
      to: "/prescriptions",
    },
    {
      id: "cod",
      icon: BanknoteIcon,
      iconClass: "text-warning",
      title: t("overview.codUnpaid", { n: s.unpaidCodDelivered }),
      hint: t("overview.codUnpaidHint"),
      action: t("overview.open"),
      to: "/orders?view=unpaid_cod",
    },
    {
      id: "stock",
      icon: PackageXIcon,
      iconClass: "text-muted-foreground",
      title: t("overview.lowStockTitle", { n: s.lowStockColours }),
      hint: t("overview.lowStockHint"),
      action: t("overview.restock"),
      to: "/products?lowStock=3",
    },
  ]

  return (
    <Card className="gap-0 py-0">
      {items.map((item, index) => (
        <div key={item.id}>
          {index > 0 ? <Separator /> : null}
          <div className="flex items-center gap-3 px-4 py-3.5">
            <item.icon className={`size-[18px] shrink-0 ${item.iconClass}`} aria-hidden="true" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="text-sm font-semibold">{item.title}</span>
              <span className="text-[13px] text-muted-foreground">{item.hint}</span>
            </div>
            <Button variant="outline" render={<Link to={item.to} />}>
              {item.action}
            </Button>
          </div>
        </div>
      ))}
    </Card>
  )
}

export { NeedsYouNow }
