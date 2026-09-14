import { DataTableHead, DataTableHeader } from "@/components/shared/data-table"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { LOW_STOCK_THRESHOLD } from "@/data/products"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

interface TopProduct {
  id: string
  name: string
  units: number
  revenue: number
  inStock: number
}

function TopProductsTable({ data }: { data: TopProduct[] }) {
  const { t, n } = useI18n()
  return (
    <Card className="py-0">
      <Table>
        <DataTableHeader>
          <TableRow>
            <DataTableHead>{t("overview.product")}</DataTableHead>
            <DataTableHead className="w-[110px] text-end">{t("overview.units")}</DataTableHead>
            <DataTableHead className="w-[130px] text-end">{t("overview.revenue")}</DataTableHead>
            <DataTableHead className="w-[110px] text-end">{t("overview.inStock")}</DataTableHead>
          </TableRow>
        </DataTableHeader>
        <TableBody>
          {data.map((product) => {
            const low = product.inStock <= LOW_STOCK_THRESHOLD
            return (
              <TableRow key={product.id} className="h-11">
                <TableCell className="ps-4 font-medium">{product.name}</TableCell>
                <TableCell className="text-end tabular-nums">{n(product.units)}</TableCell>
                <TableCell className="text-end tabular-nums">{n(product.revenue)}</TableCell>
                <TableCell
                  className={cn("pe-4 text-end tabular-nums", low && "font-semibold text-critical")}
                >
                  {n(product.inStock)}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}

export { TopProductsTable }
