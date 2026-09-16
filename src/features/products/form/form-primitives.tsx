import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

/** Section = small-caps heading with a rule and a mono API annotation, over a card. */
function FormSection({ title, api, children, className }: { title: string; api?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-baseline gap-3 border-b-2 border-foreground pb-1.5">
        <h2 className="label-caps font-medium text-muted-foreground">{title}</h2>
        {api ? <span className="ms-auto hidden font-mono text-[11px] text-muted-foreground/70 lg:inline">{api}</span> : null}
      </div>
      <Card className="py-5">
        <CardContent className="flex flex-col gap-4 px-5">{children}</CardContent>
      </Card>
    </section>
  )
}

interface FormFieldProps {
  id: string
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
  className?: string
}

/** Label + control + hint/error in the brand's compact layout. */
function FormField({ id, label, hint, error, children, className }: FormFieldProps) {
  return (
    <Field className={className} data-invalid={error ? true : undefined}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      {children}
      {error ? <FieldError className="text-[11px]">{error}</FieldError> : hint ? <FieldDescription className="text-[11px]">{hint}</FieldDescription> : null}
    </Field>
  )
}

export interface SelectOption<V extends string> {
  value: V
  label: string
}

interface FormSelectProps<V extends string> {
  id: string
  value: V
  options: SelectOption<V>[]
  onChange: (value: V) => void
  placeholder?: string
  "aria-invalid"?: boolean
}

/** Plain value select (the filter bar's `FilterSelect` shows "Label: value"; forms show just the value). */
function FormSelect<V extends string>({ id, value, options, onChange, placeholder, ...props }: FormSelectProps<V>) {
  const labelFor = (v: V) => options.find((o) => o.value === v)?.label ?? placeholder ?? ""
  return (
    <Select value={value} onValueChange={(v) => onChange(v as V)}>
      <SelectTrigger id={id} className="w-full bg-card" aria-invalid={props["aria-invalid"]}>
        <SelectValue>{(v: V) => labelFor(v) || placeholder}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {options.map((o) => (
            <SelectItem key={o.value || "__none"} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

export { FormSection, FormField, FormSelect }
