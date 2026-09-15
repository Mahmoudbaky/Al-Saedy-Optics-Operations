import { CopyIcon, EyeIcon, PrinterIcon } from "lucide-react"

import {
  DataTableHead,
  DataTableHeader,
  DataTablePagination,
  DataTableRow,
} from "@/components/shared/data-table"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { OrderStatusBadge, RxStatusBadge } from "@/components/shared/status-badge"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import type { PageMeta } from "@/api/types"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { Order, PaymentStatus } from "@/types"

const PAYMENT_STATUS_TONE: Record<PaymentStatus, string> = {
  unpaid: "text-warning",
  paid: "text-success",
  refunded: "text-muted-foreground",
}

interface OrdersTableProps {
  orders: Order[]
  meta: PageMeta | undefined
  /** A refetch is in flight (page change) – dim the rows instead of unmounting them. */
  busy?: boolean
  selectedIds: ReadonlySet<string>
  onToggle: (id: string, checked: boolean) => void
  onToggleAll: (checked: boolean) => void
  onOpen: (order: Order) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

function OrdersTable({ orders, meta, busy = false, selectedIds, onToggle, onToggleAll, onOpen, onPageChange, onPageSizeChange }: OrdersTableProps) {
  const { t, n, id, relative } = useI18n()
  const allSelected = orders.length > 0 && orders.every((o) => selectedIds.has(o.id))
  const someSelected = !allSelected && orders.some((o) => selectedIds.has(o.id))

  return (
    <Card className={cn("gap-0 py-0 transition-opacity", busy && "opacity-60")}>
      <Table>
        <DataTableHeader>
          <TableRow>
            <DataTableHead className="w-10">
              <Checkbox
                aria-label={t("common.selectAll")}
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={(checked) => onToggleAll(checked)}
              />
            </DataTableHead>
            <DataTableHead className="w-[90px]">{t("orders.col.order")}</DataTableHead>
            <DataTableHead>{t("orders.col.customer")}</DataTableHead>
            <DataTableHead className="w-[64px] text-end">{t("orders.col.items")}</DataTableHead>
            <DataTableHead className="w-[84px]">{t("orders.col.rx")}</DataTableHead>
            <DataTableHead className="w-[120px] text-end">{t("orders.col.total")}</DataTableHead>
            <DataTableHead className="w-[100px]">{t("orders.col.payment")}</DataTableHead>
            <DataTableHead className="w-[96px]">{t("orders.col.delivery")}</DataTableHead>
            <DataTableHead className="w-[128px]">{t("orders.col.status")}</DataTableHead>
            <DataTableHead className="w-[110px]">{t("orders.col.updated")}</DataTableHead>
            <DataTableHead className="w-12">
              <span className="sr-only">{t("common.actions")}</span>
            </DataTableHead>
          </TableRow>
        </DataTableHeader>
        <TableBody>
          {orders.map((order) => {
            const selected = selectedIds.has(order.id)
            return (
              <DataTableRow
                key={order.id}
                data-state={selected ? "selected" : undefined}
                className="h-[52px] cursor-pointer"
                onClick={() => onOpen(order)}
              >
                <TableCell className="ps-4" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    aria-label={`${t("common.selectRow")} #${id(order.number)}`}
                    checked={selected}
                    onCheckedChange={(checked) => onToggle(order.id, checked)}
                  />
                </TableCell>
                <TableCell className="font-heading font-semibold">#{id(order.number)}</TableCell>
                <TableCell className="max-w-0">
                  <div className="flex flex-col gap-0.5">
                    <span className="truncate font-medium">{order.user.name}</span>
                    <span className="text-[11px] text-muted-foreground" dir="ltr">
                      {order.user.phone ?? order.user.email}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-end tabular-nums">{n(order.itemCount)}</TableCell>
                <TableCell>
                  <RxStatusBadge status={order.prescriptionStatus} />
                </TableCell>
                <TableCell className="text-end font-semibold tabular-nums">{n(order.total)}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] tracking-[.06em] uppercase">
                      {t(`payment.${order.paymentMethod}`)}
                    </span>
                    <span className={cn("text-[11px]", PAYMENT_STATUS_TONE[order.paymentStatus])}>
                      {t(`payment.${order.paymentStatus}`)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-[13px]">{t(`delivery.${order.deliveryMethod}`)}</TableCell>
                <TableCell>
                  <OrderStatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-[13px] text-muted-foreground">
                  {relative(order.updatedAt)}
                </TableCell>
                <TableCell className="pe-3 text-center" onClick={(e) => e.stopPropagation()}>
                  <RowActionsMenu>
                    <DropdownMenuGroup>
                      <DropdownMenuItem onClick={() => onOpen(order)}>
                        <EyeIcon />
                        {t("orders.openDetails")}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => navigator.clipboard?.writeText(String(order.number))}
                      >
                        <CopyIcon />
                        {t("orders.copyNumber")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.print()}>
                        <PrinterIcon />
                        {t("orders.printTicket")}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </RowActionsMenu>
                </TableCell>
              </DataTableRow>
            )
          })}
        </TableBody>
      </Table>
      {meta ? (
        <DataTablePagination
          from={meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1}
          to={Math.min(meta.page * meta.limit, meta.total)}
          total={meta.total}
          page={meta.page}
          pageCount={Math.max(1, meta.pages)}
          pageSize={meta.limit}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      ) : null}
    </Card>
  )
}

export { OrdersTable }
