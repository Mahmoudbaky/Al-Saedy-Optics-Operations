import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { SAVED_VIEWS, type SavedView } from "./use-orders-filters"

const VIEW_LABEL: Record<SavedView, MessageKey> = {
  needs_action: "orders.view.needsAction",
  all: "orders.view.all",
  lab: "orders.view.inLab",
  out_for_delivery: "orders.view.outForDelivery",
  unpaid_cod: "orders.view.unpaidCod",
}

interface SavedViewsProps {
  value: SavedView
  onChange: (view: SavedView) => void
  /** Live counts per view (from the dashboard overview); missing = still loading. */
  counts: Partial<Record<SavedView, number>>
}

/** Preset filter combinations with live counts; the pressed chip is inverse navy. */
function SavedViews({ value, onChange, counts }: SavedViewsProps) {
  const { t, n } = useI18n()
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ToggleGroup
        variant="outline"
        value={[value]}
        onValueChange={(next) => {
          const view = next[0] as SavedView | undefined
          if (view) onChange(view)
        }}
        aria-label={t("orders.title")}
        className="flex-wrap"
      >
        {SAVED_VIEWS.map((view) => (
          <ToggleGroupItem
            key={view}
            value={view}
            className="bg-card text-[13px] font-normal aria-pressed:border-secondary aria-pressed:bg-secondary aria-pressed:font-semibold aria-pressed:text-secondary-foreground data-pressed:border-secondary data-pressed:bg-secondary data-pressed:font-semibold data-pressed:text-secondary-foreground"
          >
            {t(VIEW_LABEL[view])}
            {counts[view] !== undefined ? ` · ${n(counts[view]!)}` : ""}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}

export { SavedViews }
