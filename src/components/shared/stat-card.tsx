import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps extends React.ComponentProps<typeof Card> {
  label: string
  value: string
  /** Colour the headline value: brand red for urgent counts. */
  tone?: "default" | "brand"
  caption: React.ReactNode
  captionTone?: "muted" | "success" | "warning"
}

const captionTones = {
  muted: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
}

function StatCard({
  label,
  value,
  tone = "default",
  caption,
  captionTone = "muted",
  className,
  ...props
}: StatCardProps) {
  return (
    <Card className={cn("gap-2.5", className)} {...props}>
      <CardHeader className="gap-2.5">
        <CardDescription className="label-caps">{label}</CardDescription>
        <CardTitle
          className={cn(
            "font-heading text-[32px] leading-none font-bold tabular-nums",
            tone === "brand" && "text-primary"
          )}
        >
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent
        className={cn("flex items-center gap-1.5 text-[13px]", captionTones[captionTone])}
      >
        {caption}
      </CardContent>
    </Card>
  )
}

export { StatCard }
