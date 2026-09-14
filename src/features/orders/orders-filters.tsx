import { CalendarDaysIcon, SearchIcon } from "lucide-react"

import { FilterChip } from "@/components/shared/filter-chip"
import { FilterSelect, type FilterOption } from "@/components/shared/filter-select"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { useI18n } from "@/lib/i18n"
import { ORDER_STATUSES } from "@/types"
import type {
  DeliveryFilter,
  OrdersFilters,
  PaymentFilter,
  StatusFilter,
} from "./use-orders-filters"

interface OrdersFiltersBarProps {
  filters: OrdersFilters
  onChange: (patch: Partial<OrdersFilters>) => void
  onClear: () => void
}

function OrdersFiltersBar({ filters, onChange, onClear }: OrdersFiltersBarProps) {
  const { t } = useI18n()

  const statusOptions: FilterOption<StatusFilter>[] = [
    { value: "any", label: t("common.any") },
    ...ORDER_STATUSES.map((s) => ({ value: s, label: t(`status.${s}`) })),
  ]
  const paymentOptions: FilterOption<PaymentFilter>[] = [
    { value: "any", label: t("common.any") },
    { value: "unpaid", label: t("payment.unpaid") },
    { value: "paid", label: t("payment.paid") },
    { value: "refunded", label: t("payment.refunded") },
  ]
  const deliveryOptions: FilterOption<DeliveryFilter>[] = [
    { value: "any", label: t("common.any") },
    { value: "home", label: t("delivery.home") },
    { value: "pickup", label: t("delivery.pickup") },
  ]

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <InputGroup className="w-full bg-card sm:w-[320px]">
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          placeholder={t("orders.search")}
          aria-label={t("orders.search")}
          value={filters.query}
          onChange={(e) => onChange({ query: e.target.value })}
        />
      </InputGroup>
      <FilterSelect
        label={t("orders.filter.status")}
        value={filters.status}
        options={statusOptions}
        onChange={(status) => onChange({ status })}
      />
      <FilterSelect
        label={t("orders.filter.payment")}
        value={filters.payment}
        options={paymentOptions}
        onChange={(payment) => onChange({ payment })}
      />
      <FilterSelect
        label={t("orders.filter.delivery")}
        value={filters.delivery}
        options={deliveryOptions}
        onChange={(delivery) => onChange({ delivery })}
      />
      <InputGroup className="w-[150px] bg-card">
        <InputGroupAddon>
          <CalendarDaysIcon />
        </InputGroupAddon>
        <InputGroupInput
          type="date"
          aria-label={t("common.from")}
          placeholder={t("common.from")}
          value={filters.from}
          onChange={(e) => onChange({ from: e.target.value })}
        />
      </InputGroup>
      <InputGroup className="w-[150px] bg-card">
        <InputGroupAddon>
          <CalendarDaysIcon />
        </InputGroupAddon>
        <InputGroupInput
          type="date"
          aria-label={t("common.to")}
          placeholder={t("common.to")}
          value={filters.to}
          onChange={(e) => onChange({ to: e.target.value })}
        />
      </InputGroup>

      {filters.payment !== "any" ? (
        <FilterChip onRemove={() => onChange({ payment: "any" })} removeLabel={t("common.clear")}>
          {t("orders.filter.payment")}: {t(`payment.${filters.payment}`)}
        </FilterChip>
      ) : null}
      {filters.status !== "any" ? (
        <FilterChip onRemove={() => onChange({ status: "any" })} removeLabel={t("common.clear")}>
          {t("orders.filter.status")}: {t(`status.${filters.status}`)}
        </FilterChip>
      ) : null}
      {filters.delivery !== "any" ? (
        <FilterChip onRemove={() => onChange({ delivery: "any" })} removeLabel={t("common.clear")}>
          {t("orders.filter.delivery")}: {t(`delivery.${filters.delivery}`)}
        </FilterChip>
      ) : null}

      <Button variant="ghost" className="ms-auto" onClick={onClear}>
        {t("common.clearFilters")}
      </Button>
    </div>
  )
}

export { OrdersFiltersBar }
