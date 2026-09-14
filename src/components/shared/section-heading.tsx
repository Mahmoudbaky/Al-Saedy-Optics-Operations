import { cn } from "@/lib/utils"

/** Brand-book section rule: heading text with a 2px navy rule beneath. */
function SectionHeading({
  className,
  children,
  aside,
  ...props
}: React.ComponentProps<"div"> & { aside?: React.ReactNode }) {
  return (
    <div
      className={cn(
        "flex items-baseline gap-3 border-b-2 border-foreground pb-2",
        className
      )}
      {...props}
    >
      <h2 className="font-heading text-lg font-semibold">{children}</h2>
      {aside ? (
        <span className="ms-auto text-[13px] text-muted-foreground">{aside}</span>
      ) : null}
    </div>
  )
}

/** Small uppercase rule used inside drawers and forms. */
function SubHeading({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "label-caps border-b-2 border-foreground pb-1.5 font-medium text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { SectionHeading, SubHeading }
