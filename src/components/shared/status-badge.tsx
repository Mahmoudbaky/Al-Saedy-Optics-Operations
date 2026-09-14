import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n"
import type { OrderStatus, PrescriptionStatus, UserRole, UserStatus } from "@/types"

type BadgeVariant = NonNullable<React.ComponentProps<typeof Badge>["variant"]>

const ORDER_STATUS_VARIANT: Record<OrderStatus, BadgeVariant> = {
  pending: "warning",
  confirmed: "info",
  in_lab: "secondary",
  on_the_way: "info",
  ready: "neutral",
  delivered: "success",
  cancelled: "neutral",
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { t } = useI18n()
  return (
    <Badge variant={ORDER_STATUS_VARIANT[status]}>
      {status === "on_the_way" ? (
        <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      ) : null}
      {t(`status.${status}`)}
    </Badge>
  )
}

const RX_STATUS_VARIANT: Record<PrescriptionStatus, BadgeVariant> = {
  verified: "success",
  pending: "warning",
  rejected: "critical",
}

function RxStatusBadge({ status }: { status: PrescriptionStatus | null }) {
  const { t } = useI18n()
  if (!status) {
    return <span className="text-[13px] text-muted-foreground/70">{t("common.none")}</span>
  }
  return <Badge variant={RX_STATUS_VARIANT[status]}>{t(`rx.${status}`)}</Badge>
}

function UserStatusBadge({ status }: { status: UserStatus }) {
  const { t } = useI18n()
  return (
    <Badge variant={status === "active" ? "success" : "critical"}>
      {t(`userStatus.${status}`)}
    </Badge>
  )
}

function UserRoleLabel({ role }: { role: UserRole }) {
  const { t } = useI18n()
  if (role === "admin") return <Badge variant="secondary">{t("role.admin")}</Badge>
  return <span className="text-[13px] text-muted-foreground">{t("role.customer")}</span>
}

export { OrderStatusBadge, RxStatusBadge, UserStatusBadge, UserRoleLabel }
