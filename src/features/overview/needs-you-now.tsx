import { BanknoteIcon, FileTextIcon, PackageXIcon } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useI18n } from "@/lib/i18n"

interface NeedsYouNowProps {
  prescriptionsToVerify: number
  upcomingAppointments: number
  unpaidCod: number
  lowStock: number
  lowStockThreshold: number
  activeProducts: number
}

/** The three queues that block revenue today, each with a direct action. */
function NeedsYouNow({ prescriptionsToVerify, upcomingAppointments, unpaidCod, lowStock, lowStockThreshold, activeProducts }: NeedsYouNowProps) {
  const { t } = useI18n()
  const items = [
    {
      id: "rx",
      icon: FileTextIcon,
      iconClass: prescriptionsToVerify > 0 ? "text-critical" : "text-muted-foreground",
      title: t("overview.rxToVerify", { n: prescriptionsToVerify }),
      hint: t("overview.rxToVerifyHint", { n: upcomingAppointments }),
      action: t("overview.review"),
      to: "/prescriptions",
    },
    {
      id: "cod",
      icon: BanknoteIcon,
      iconClass: unpaidCod > 0 ? "text-warning" : "text-muted-foreground",
      title: t("overview.codUnpaid", { n: unpaidCod }),
      hint: t("overview.codUnpaidHint"),
      action: t("overview.open"),
      to: "/orders?view=unpaid_cod",
    },
    {
      id: "stock",
      icon: PackageXIcon,
      iconClass: "text-muted-foreground",
      title: t("overview.lowStockTitle", { n: lowStock }),
      hint: t("overview.lowStockHint", { n: activeProducts }),
      action: t("overview.restock"),
      to: `/products?lowStock=${lowStockThreshold}`,
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
