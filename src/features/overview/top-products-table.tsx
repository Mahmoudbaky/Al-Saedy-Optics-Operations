import { DataTableHead, DataTableHeader } from "@/components/shared/data-table"
import { Card } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { useI18n } from "@/lib/i18n"

interface TopProduct {
  id: string
  name: string
  units: number
  revenue: number
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
            <DataTableHead className="w-[130px] pe-4 text-end">{t("overview.revenue")}</DataTableHead>
          </TableRow>
        </DataTableHeader>
        <TableBody>
          {data.map((product) => (
            <TableRow key={product.id} className="h-11">
              <TableCell className="ps-4 font-medium">{product.name}</TableCell>
              <TableCell className="text-end tabular-nums">{n(product.units)}</TableCell>
              <TableCell className="pe-4 text-end tabular-nums">{n(product.revenue)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

export { TopProductsTable }
