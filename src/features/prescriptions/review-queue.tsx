import { ImageIcon, KeyboardIcon, StethoscopeIcon, type LucideIcon } from "lucide-react"

import { FilterSelect, type FilterOption } from "@/components/shared/filter-select"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { Prescription, PrescriptionSource, PrescriptionStatus } from "@/types"

const SOURCE_ICON: Record<PrescriptionSource, LucideIcon> = {
  upload: ImageIcon,
  typed: KeyboardIcon,
  exam: StethoscopeIcon,
}

export type SourceFilter = PrescriptionSource | "any"
export type RxStatusFilter = PrescriptionStatus | "any"

interface ReviewQueueProps {
  items: Prescription[]
  pendingCount: number
  selectedId: string | null
  onSelect: (id: string) => void
  status: RxStatusFilter
  onStatusChange: (value: RxStatusFilter) => void
  source: SourceFilter
  onSourceChange: (value: SourceFilter) => void
}

/** Left rail: pending prescriptions sorted by longest wait. */
function ReviewQueue({
  items,
  pendingCount,
  selectedId,
  onSelect,
  status,
  onStatusChange,
  source,
  onSourceChange,
}: ReviewQueueProps) {
  const { t, waitingSince } = useI18n()

  const statusOptions: FilterOption<RxStatusFilter>[] = [
    { value: "pending", label: t("rx.pending") },
    { value: "verified", label: t("rx.verified") },
    { value: "rejected", label: t("rx.rejected") },
    { value: "any", label: t("common.any") },
  ]
  const sourceOptions: FilterOption<SourceFilter>[] = [
    { value: "any", label: t("common.any") },
    { value: "upload", label: t("rx.source.upload") },
    { value: "typed", label: t("rx.source.typed") },
    { value: "exam", label: t("rx.source.exam") },
  ]

  return (
    <aside className="flex w-full shrink-0 flex-col border-e bg-card lg:w-[420px]">
      <div className="flex flex-col gap-3 border-b px-4 py-4">
        <div className="flex items-center gap-2.5">
          <h2 className="font-heading text-lg font-semibold">{t("rx.queue")}</h2>
          <Badge variant="critical">{t("rx.pendingCount", { n: pendingCount })}</Badge>
        </div>
        <div className="flex gap-2">
          <FilterSelect label={t("rx.filter.status")} value={status} options={statusOptions} onChange={onStatusChange} />
          <FilterSelect label={t("rx.filter.source")} value={source} options={sourceOptions} onChange={onSourceChange} />
        </div>
      </div>

      <ul className="flex flex-col overflow-y-auto" role="listbox" aria-label={t("rx.queue")}>
        {items.map((rx) => {
          const Icon = SOURCE_ICON[rx.source]
          const selected = rx.id === selectedId
          return (
            <li key={rx.id} role="option" aria-selected={selected}>
              <button
                type="button"
                onClick={() => onSelect(rx.id)}
                className={cn(
                  "flex w-full items-center gap-3 border-b px-4 py-3 text-start outline-none transition-colors hover:bg-muted/60 focus-visible:bg-muted/60",
                  selected && "border-s-2 border-s-foreground bg-info-soft hover:bg-info-soft"
                )}
              >
                <span className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium">{rx.customerName}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {t(`rx.source.${rx.source}`)} · {waitingSince(rx.submittedAt)}
                  </span>
                </span>
                {selected ? <Badge variant="secondary">{t("rx.open")}</Badge> : null}
              </button>
            </li>
          )
        })}
      </ul>

      <p className="mt-auto border-t bg-muted/60 px-4 py-3.5 text-[13px] text-muted-foreground">
        {t("rx.sortedByWait")}
      </p>
    </aside>
  )
}

export { ReviewQueue }
