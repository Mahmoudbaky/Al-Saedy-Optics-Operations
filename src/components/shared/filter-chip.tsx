import { XIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FilterChipProps extends Omit<React.ComponentProps<typeof Badge>, "variant"> {
  onRemove: () => void
  removeLabel: string
  tone?: "info" | "critical"
}

/** An applied filter, removable in place. */
function FilterChip({
  onRemove,
  removeLabel,
  tone = "info",
  className,
  children,
  ...props
}: FilterChipProps) {
  return (
    <Badge
      variant={tone}
      className={cn("h-8 gap-1.5 px-3 text-[13px]", className)}
      {...props}
    >
      {children}
      <button
        type="button"
        aria-label={removeLabel}
        onClick={onRemove}
        className="-me-1 rounded-sm p-0.5 opacity-70 transition-opacity outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        <XIcon className="size-3.5" aria-hidden="true" />
      </button>
    </Badge>
  )
}

export { FilterChip }
