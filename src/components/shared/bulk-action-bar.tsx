import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface BulkActionBarProps extends React.ComponentProps<"div"> {
  summary: string
  /** Endpoint the bulk action hits — shown as a developer annotation. */
  endpoint?: string
}

/** Sticky-feeling inverse bar that appears once rows are selected. */
function BulkActionBar({
  summary,
  endpoint,
  className,
  children,
  ...props
}: BulkActionBarProps) {
  return (
    <div
      role="region"
      aria-live="polite"
      className={cn(
        "flex items-center gap-3.5 rounded-md bg-secondary px-4 py-2.5 text-secondary-foreground",
        className
      )}
      {...props}
    >
      <span className="text-sm font-semibold">{summary}</span>
      {endpoint ? (
        <>
          <Separator orientation="vertical" className="h-5! bg-white/25" />
          <span className="font-mono text-[13px] text-sidebar-foreground">
            {endpoint}
          </span>
        </>
      ) : null}
      <div className="ms-auto flex items-center gap-2">{children}</div>
    </div>
  )
}

export { BulkActionBar }
