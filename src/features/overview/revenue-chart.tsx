import { Bar, BarChart, Cell, XAxis, type XAxisTickContentProps } from "recharts"

import { Card, CardContent } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { useI18n } from "@/lib/i18n"

/** One bar per day, oldest first (shaped from `GET /admin/dashboard/revenue`). */
export interface RevenuePoint {
  date: string
  label: string
  revenue: number
  orders: number
  highlighted?: boolean
  isToday?: boolean
}

const chartConfig = {
  revenue: { label: "IQD", color: "var(--chart-2)" },
  highlighted: { label: "Flagged day", color: "var(--chart-1)" },
  today: { label: "Today", color: "var(--chart-3)" },
} satisfies ChartConfig

function barColour(point: RevenuePoint) {
  if (point.isToday) return "var(--color-today)"
  if (point.highlighted) return "var(--color-highlighted)"
  return "var(--color-revenue)"
}

/** Single series with emphasis: quiet navy tint, flagged days in navy, today in red. */
function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const { n, dir } = useI18n()
  const today = data.find((p) => p.isToday)

  return (
    <Card>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-auto h-[220px] w-full" dir="ltr">
          <BarChart
            data={data}
            margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
            barCategoryGap="22%"
          >
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              reversed={dir === "rtl"}
              tickFormatter={(v: string) => n(Number(v))}
              tick={({ x, y, payload }: XAxisTickContentProps) => {
                const isToday = payload.value === today?.label
                return (
                  <text
                    x={Number(x)}
                    y={Number(y) + 12}
                    textAnchor="middle"
                    className={isToday ? "fill-primary font-semibold" : "fill-muted-foreground"}
                    fontSize={11}
                  >
                    {n(Number(payload.value))}
                  </text>
                )
              }}
            />
            <ChartTooltip
              cursor={{ fill: "var(--muted)", radius: 2 }}
              content={
                <ChartTooltipContent
                  hideIndicator
                  labelFormatter={(_, payload) => {
                    const point = payload?.[0]?.payload as RevenuePoint | undefined
                    return point
                      ? new Intl.DateTimeFormat(dir === "rtl" ? "ar-EG" : "en-GB", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        }).format(new Date(point.date))
                      : ""
                  }}
                  formatter={(value) => (
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {n(Number(value))} IQD
                    </span>
                  )}
                />
              }
            />
            <Bar dataKey="revenue" radius={[2, 2, 0, 0]} maxBarSize={72} isAnimationActive={false}>
              {data.map((point) => (
                <Cell key={point.date} fill={barColour(point)} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export { RevenueChart }
