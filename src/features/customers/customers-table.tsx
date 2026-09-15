import { BanIcon, PackageIcon, ShieldCheckIcon, ShieldOffIcon, UserRoundSearchIcon } from "lucide-react"
import { Link } from "react-router"

import type { PageMeta } from "@/api/types"
import { DataTableHead, DataTableHeader, DataTablePagination } from "@/components/shared/data-table"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { UserRoleLabel, UserStatusBadge } from "@/components/shared/status-badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { useI18n } from "@/lib/i18n"
import { cn, initials } from "@/lib/utils"
import type { Customer } from "@/types"

interface CustomersTableProps {
  customers: Customer[]
  meta: PageMeta | undefined
  busy?: boolean
  onToggleRole: (customer: Customer) => void
  onToggleBan: (customer: Customer) => void
  onClearFilters: () => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

function CustomersTable({ customers, meta, busy = false, onToggleRole, onToggleBan, onClearFilters, onPageChange, onPageSizeChange }: CustomersTableProps) {
  const { t, n, relative, monthYear } = useI18n()

  if (customers.length === 0) {
    return (
      <Card className="py-11">
        <Empty className="p-0">
          <EmptyHeader>
            <EmptyMedia className="text-muted-foreground/70">
              <UserRoundSearchIcon className="size-[34px]" aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="text-lg font-semibold">{t("customers.emptyTitle")}</EmptyTitle>
            <EmptyDescription className="max-w-[420px]">{t("customers.emptyBody")}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="flex-row justify-center gap-2.5">
            <Button variant="outline" size="lg" onClick={onClearFilters}>
              {t("common.clearFilters")}
            </Button>
          </EmptyContent>
        </Empty>
      </Card>
    )
  }

  return (
    <Card className={cn("gap-0 py-0 transition-opacity", busy && "opacity-60")}>
      <Table>
        <DataTableHeader>
          <TableRow>
            <DataTableHead>{t("customers.col.customer")}</DataTableHead>
            <DataTableHead className="w-[150px]">{t("customers.col.phone")}</DataTableHead>
            <DataTableHead className="w-[70px]">{t("customers.col.lang")}</DataTableHead>
            <DataTableHead className="w-[100px]">{t("customers.col.role")}</DataTableHead>
            <DataTableHead className="w-[80px] text-end">{t("customers.col.orders")}</DataTableHead>
            <DataTableHead className="w-[130px] text-end">{t("customers.col.spent")}</DataTableHead>
            <DataTableHead className="w-[110px]">{t("customers.col.lastOrder")}</DataTableHead>
            <DataTableHead className="w-[110px]">{t("customers.col.joined")}</DataTableHead>
            <DataTableHead className="w-[100px]">{t("customers.col.status")}</DataTableHead>
            <DataTableHead className="w-12">
              <span className="sr-only">{t("common.actions")}</span>
            </DataTableHead>
          </TableRow>
        </DataTableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id} className="h-14">
              <TableCell className="max-w-0 ps-4">
                <div className="flex items-center gap-2.5">
                  <Avatar className="size-[30px]">
                    <AvatarFallback className="bg-accent text-[11px] font-semibold text-accent-foreground">
                      {initials(customer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate font-medium">{customer.name}</span>
                    <span className="truncate text-[11px] text-muted-foreground" dir="ltr">
                      {customer.email}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-[13px]" dir="ltr">
                {customer.phone ?? t("common.none")}
              </TableCell>
              <TableCell className="text-[13px] uppercase">{customer.locale}</TableCell>
              <TableCell>
                <UserRoleLabel role={customer.role} />
              </TableCell>
              <TableCell className="text-end tabular-nums">{n(customer.stats.orders)}</TableCell>
              <TableCell className="text-end font-semibold tabular-nums">{n(customer.stats.totalSpent)}</TableCell>
              <TableCell className="text-[13px] text-muted-foreground">
                {customer.stats.lastOrderAt ? relative(customer.stats.lastOrderAt) : t("common.none")}
              </TableCell>
              <TableCell className="text-[13px] text-muted-foreground">{monthYear(customer.createdAt)}</TableCell>
              <TableCell>
                <UserStatusBadge status={customer.banned ? "banned" : "active"} />
              </TableCell>
              <TableCell className="pe-3 text-center">
                <RowActionsMenu>
                  <DropdownMenuGroup>
                    <DropdownMenuItem render={<Link to={`/orders?view=all&q=${encodeURIComponent(customer.email)}`} />}>
                      <PackageIcon />
                      {t("customers.viewProfile")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleRole(customer)}>
                      {customer.role === "admin" ? <ShieldOffIcon /> : <ShieldCheckIcon />}
                      {customer.role === "admin" ? t("customers.demote") : t("customers.promote")}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem variant={customer.banned ? "default" : "destructive"} onClick={() => onToggleBan(customer)}>
                      <BanIcon />
                      {customer.banned ? t("customers.unban") : t("customers.ban")}
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </RowActionsMenu>
              </TableCell>
            </TableRow>
          ))}
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

export { CustomersTable }
