import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export interface FilterOption<V extends string> {
  value: V
  label: string
}

interface FilterSelectProps<V extends string> {
  /** Field name shown before the value: "Status: any". */
  label: string
  value: V
  options: FilterOption<V>[]
  onChange: (value: V) => void
  className?: string
  "aria-label"?: string
}

/** A compact "Label: value" select used in filter rows. */
function FilterSelect<V extends string>({
  label,
  value,
  options,
  onChange,
  className,
  ...props
}: FilterSelectProps<V>) {
  const labelFor = (v: V) => options.find((o) => o.value === v)?.label ?? v
  return (
    <Select value={value} onValueChange={(v) => onChange(v as V)}>
      <SelectTrigger className={cn("bg-card", className)} aria-label={props["aria-label"] ?? label}>
        <SelectValue>{(v: V) => `${label}: ${labelFor(v)}`}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export { FilterSelect }
