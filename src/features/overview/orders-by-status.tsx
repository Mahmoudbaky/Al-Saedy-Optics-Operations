import { Card, CardContent } from "@/components/ui/card"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { OrderStatus } from "@/types"

/** Bar colour follows the status entity, never its rank. */
const STATUS_BAR: Record<OrderStatus, string> = {
  pending: "**:data-[slot=progress-indicator]:bg-primary",
  confirmed: "**:data-[slot=progress-indicator]:bg-chart-1",
  in_lab: "**:data-[slot=progress-indicator]:bg-chart-1",
  on_the_way: "**:data-[slot=progress-indicator]:bg-chart-4",
  ready: "**:data-[slot=progress-indicator]:bg-chart-5",
  delivered: "**:data-[slot=progress-indicator]:bg-[#d0d3d4]",
  cancelled: "**:data-[slot=progress-indicator]:bg-[#aeb3b5]",
}

/** Completed/terminal states read quieter than the live pipeline. */
const TERMINAL: ReadonlySet<OrderStatus> = new Set(["delivered", "cancelled"])

interface OrdersByStatusProps {
  data: Array<{ status: OrderStatus; count: number }>
}

function OrdersByStatus({ data }: OrdersByStatusProps) {
  const { t, n } = useI18n()
  // The live pipeline scales against twice its largest queue so the bars stay
  // short and comparable; terminal states, which dwarf it, use their own scale.
  const live = data.filter((d) => !TERMINAL.has(d.status))
  const liveMax = Math.max(...live.map((d) => d.count))
  const delivered = data.find((d) => d.status === "delivered")?.count ?? 1
  const percent = (status: OrderStatus, count: number) => {
    if (status === "delivered") return 100
    if (status === "cancelled") return Math.max(4, Math.round((count / delivered) * 100))
    return Math.round((count / (liveMax * 2)) * 100)
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3.5">
        {data.map(({ status, count }) => {
          const terminal = TERMINAL.has(status)
          return (
            <Progress
              key={status}
              value={percent(status, count)}
              className={cn(
                "grid grid-cols-[96px_1fr_36px] items-center gap-3",
                "*:data-[slot=progress-track]:order-2 *:data-[slot=progress-track]:h-2 *:data-[slot=progress-track]:rounded-sm",
                "**:data-[slot=progress-indicator]:rounded-none",
                STATUS_BAR[status]
              )}
            >
              <ProgressLabel
                className={cn(
                  "order-1 text-sm font-normal",
                  terminal ? "text-muted-foreground" : "text-foreground"
                )}
              >
                {t(`status.${status}`)}
              </ProgressLabel>
              <ProgressValue
                className={cn(
                  "order-3 ms-0 text-end text-sm",
                  terminal ? "text-muted-foreground" : "font-semibold text-foreground"
                )}
              >
                {() => n(count)}
              </ProgressValue>
            </Progress>
          )
        })}
      </CardContent>
    </Card>
  )
}

export { OrdersByStatus }
