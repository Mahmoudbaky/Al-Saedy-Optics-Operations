import * as React from "react"
import { BanIcon, SearchIcon } from "lucide-react"

import { useApiErrorMessage, useBanUser, useSetUserRole, useUnbanUser, useUsers, type UserListQuery } from "@/api"
import { PageHeader } from "@/components/layout/page-header"
import { FilterSelect, type FilterOption } from "@/components/shared/filter-select"
import { QueryState } from "@/components/shared/query-state"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { toast } from "@/components/ui/toast"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useI18n } from "@/lib/i18n"
import type { Customer, UserRole, UserStatus } from "@/types"
import { CustomersTable } from "./customers-table"

type RoleFilter = UserRole | "any"
type StatusFilter = UserStatus | "any"

/** GET /admin/users — server-side search/filters/pagination, role & ban actions. */
function CustomersPage() {
  const { t } = useI18n()
  const errorMessage = useApiErrorMessage()
  const [query, setQueryState] = React.useState("")
  const search = useDebouncedValue(query.trim(), 300)
  const [role, setRoleState] = React.useState<RoleFilter>("any")
  const [status, setStatusState] = React.useState<StatusFilter>("any")
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSizeState] = React.useState(25)
  const [banTarget, setBanTarget] = React.useState<Customer | null>(null)
  const [banReason, setBanReason] = React.useState("")

  // Any filter change restarts pagination.
  const resetting = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setPage(1)
  }
  const setQuery = resetting(setQueryState)
  const setRole = resetting(setRoleState)
  const setStatus = resetting(setStatusState)
  const setPageSize = resetting(setPageSizeState)

  const listQuery: UserListQuery = {
    search: search || undefined,
    role: role === "any" ? undefined : role,
    banned: status === "any" ? undefined : status === "banned",
    page,
    limit: pageSize,
  }
  const users = useUsers(listQuery)
  const rows = users.data?.data ?? []
  const setUserRole = useSetUserRole()
  const ban = useBanUser()
  const unban = useUnbanUser()

  const clearFilters = () => {
    setQuery("")
    setRole("any")
    setStatus("any")
  }

  const roleOptions: FilterOption<RoleFilter>[] = [
    { value: "any", label: t("common.any") },
    { value: "user", label: t("role.user") },
    { value: "admin", label: t("role.admin") },
  ]
  const statusOptions: FilterOption<StatusFilter>[] = [
    { value: "any", label: t("common.any") },
    { value: "active", label: t("userStatus.active") },
    { value: "banned", label: t("userStatus.banned") },
  ]

  const fail = (customer: Customer, err: unknown) =>
    toast.add({ type: "error", title: t("customers.toast.failed", { name: customer.name }), description: errorMessage(err) })

  /** POST /admin/users/:id/role */
  const toggleRole = async (customer: Customer) => {
    const next: UserRole = customer.role === "admin" ? "user" : "admin"
    try {
      await setUserRole.mutateAsync({ id: customer.id, role: next })
      toast.add({ type: "success", title: t(next === "admin" ? "customers.toast.promoted" : "customers.toast.demoted", { name: customer.name }) })
    } catch (err) {
      fail(customer, err)
    }
  }

  /** POST /admin/users/:id/ban · /unban */
  const toggleBan = (customer: Customer) => {
    if (customer.banned) {
      unban
        .mutateAsync({ id: customer.id })
        .then(() => toast.add({ type: "success", title: t("customers.toast.unbanned", { name: customer.name }) }))
        .catch((err) => fail(customer, err))
    } else {
      setBanReason("")
      setBanTarget(customer)
    }
  }

  const confirmBan = async () => {
    if (!banTarget) return
    const target = banTarget
    setBanTarget(null)
    try {
      await ban.mutateAsync({ id: target.id, reason: banReason.trim() || undefined })
      toast.add({ type: "info", title: t("customers.toast.banned", { name: target.name }), description: t("customers.toast.bannedHint") })
    } catch (err) {
      fail(target, err)
    }
  }

  return (
    <>
      <PageHeader title={t("customers.title")} endpoint="/api/v1/admin/users" />
      <div className="flex flex-col gap-4 p-4 md:px-6 md:py-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <InputGroup className="w-full bg-card sm:w-[280px]">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput placeholder={t("customers.search")} aria-label={t("customers.search")} value={query} onChange={(e) => setQuery(e.target.value)} />
          </InputGroup>
          <FilterSelect label={t("customers.filter.role")} value={role} options={roleOptions} onChange={setRole} />
          <FilterSelect label={t("customers.filter.status")} value={status} options={statusOptions} onChange={setStatus} />
        </div>

        <QueryState query={users} empty={false}>
          <CustomersTable
            customers={rows}
            meta={users.data?.meta}
            busy={users.isFetching}
            onToggleRole={(c) => void toggleRole(c)}
            onToggleBan={toggleBan}
            onClearFilters={clearFilters}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </QueryState>
      </div>

      <AlertDialog open={banTarget !== null} onOpenChange={(open) => !open && setBanTarget(null)}>
        <AlertDialogContent className="sm:max-w-[480px]">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-critical-soft text-critical">
              <BanIcon />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-lg font-bold">{t("customers.banConfirm", { name: banTarget?.name ?? "" })}</AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">{t("customers.banConfirmHint")}</AlertDialogDescription>
          </AlertDialogHeader>
          <Field>
            <FieldLabel htmlFor="ban-reason">{t("customers.banReason")}</FieldLabel>
            <Input id="ban-reason" maxLength={300} value={banReason} onChange={(e) => setBanReason(e.target.value)} />
          </Field>
          <AlertDialogFooter>
            <AlertDialogCancel variant="ghost" size="lg">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" size="lg" onClick={() => void confirmBan()}>
              {t("customers.ban")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export { CustomersPage }
