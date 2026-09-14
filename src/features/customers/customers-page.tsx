import * as React from "react"
import { DownloadIcon, SearchIcon } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { FilterSelect, type FilterOption } from "@/components/shared/filter-select"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { toast } from "@/components/ui/toast"
import { customers as seed } from "@/data/customers"
import { useI18n } from "@/lib/i18n"
import type { Customer, Language, UserRole, UserStatus } from "@/types"
import { CustomersTable } from "./customers-table"

type RoleFilter = UserRole | "any"
type StatusFilter = UserStatus | "any"
type LanguageFilter = Language | "any"

/** GET /admin/users — role & ban actions, empty state when filters return nothing. */
function CustomersPage() {
  const { t } = useI18n()
  const [customers, setCustomers] = React.useState<Customer[]>(seed)
  const [query, setQuery] = React.useState("")
  const [role, setRole] = React.useState<RoleFilter>("any")
  const [status, setStatus] = React.useState<StatusFilter>("any")
  const [language, setLanguage] = React.useState<LanguageFilter>("any")

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return customers.filter((c) => {
      if (role !== "any" && c.role !== role) return false
      if (status !== "any" && c.status !== status) return false
      if (language !== "any" && c.language !== language) return false
      if (q && !`${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [customers, query, role, status, language])

  const clearFilters = () => {
    setQuery("")
    setRole("any")
    setStatus("any")
    setLanguage("any")
  }

  const roleOptions: FilterOption<RoleFilter>[] = [
    { value: "any", label: t("common.any") },
    { value: "customer", label: t("role.customer") },
    { value: "admin", label: t("role.admin") },
  ]
  const statusOptions: FilterOption<StatusFilter>[] = [
    { value: "any", label: t("common.any") },
    { value: "active", label: t("userStatus.active") },
    { value: "banned", label: t("userStatus.banned") },
  ]
  const languageOptions: FilterOption<LanguageFilter>[] = [
    { value: "any", label: t("common.any") },
    { value: "ar", label: t("customers.language.ar") },
    { value: "en", label: t("customers.language.en") },
  ]

  const patch = (id: string, changes: Partial<Customer>) =>
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...changes } : c)))

  /** PATCH /admin/users/:id/role */
  const toggleRole = (customer: Customer) => {
    const role: UserRole = customer.role === "admin" ? "customer" : "admin"
    patch(customer.id, { role })
    toast.add({
      type: "success",
      title: t(role === "admin" ? "customers.toast.promoted" : "customers.toast.demoted", { name: customer.name }),
    })
  }

  /** POST /admin/users/:id/ban · DELETE /admin/users/:id/ban */
  const toggleBan = (customer: Customer) => {
    const banned = customer.status !== "banned"
    patch(customer.id, { status: banned ? "banned" : "active" })
    toast.add(
      banned
        ? {
            type: "info",
            title: t("customers.toast.banned", { name: customer.name }),
            description: t("customers.toast.bannedHint"),
          }
        : { type: "success", title: t("customers.toast.unbanned", { name: customer.name }) }
    )
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
            <InputGroupInput
              placeholder={t("customers.search")}
              aria-label={t("customers.search")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputGroup>
          <FilterSelect label={t("customers.filter.role")} value={role} options={roleOptions} onChange={setRole} />
          <FilterSelect label={t("customers.filter.status")} value={status} options={statusOptions} onChange={setStatus} />
          <FilterSelect label={t("customers.filter.language")} value={language} options={languageOptions} onChange={setLanguage} />
          <Button variant="outline" className="ms-auto">
            <DownloadIcon data-icon="inline-start" />
            {t("common.exportCsv")}
          </Button>
        </div>

        <CustomersTable
          customers={visible}
          onToggleRole={toggleRole}
          onToggleBan={toggleBan}
          onClearFilters={clearFilters}
        />
      </div>
    </>
  )
}

export { CustomersPage }
