import * as React from "react"
import {
  BanIcon,
  CheckIcon,
  FlaskConicalIcon,
  PackageCheckIcon,
  StoreIcon,
  TruckIcon,
  XIcon,
  type LucideIcon,
} from "lucide-react"

import { SubHeading } from "@/components/shared/section-heading"
import { OrderStatusBadge, RxStatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useI18n, type MessageKey } from "@/lib/i18n"
import type { EyeValues, Order, OrderStatus } from "@/types"

const ACTION_ICON: Partial<Record<OrderStatus, LucideIcon>> = {
  confirmed: CheckIcon,
  in_lab: FlaskConicalIcon,
  on_the_way: TruckIcon,
  ready: StoreIcon,
  delivered: PackageCheckIcon,
  cancelled: BanIcon,
}

const ACTION_LABEL: Partial<Record<OrderStatus, MessageKey>> = {
  confirmed: "orders.action.confirmed",
  in_lab: "orders.action.in_lab",
  on_the_way: "orders.action.on_the_way",
  ready: "orders.action.ready",
  delivered: "orders.action.delivered",
  cancelled: "orders.action.cancelled",
}

function formatEye(value: number | null, fractionDigits = 2) {
  return value === null ? "—" : value.toFixed(fractionDigits)
}

function EyeRow({ label, eye, pd }: { label: string; eye: EyeValues; pd: string | null }) {
  return (
    <TableRow>
      <TableCell className="ps-3.5 font-semibold">{label}</TableCell>
      <TableCell className="tabular-nums">{formatEye(eye.sph)}</TableCell>
      <TableCell className="tabular-nums">{formatEye(eye.cyl)}</TableCell>
      <TableCell className="tabular-nums">{formatEye(eye.axis, 0)}</TableCell>
      <TableCell className="pe-3.5 tabular-nums">{pd ?? "—"}</TableCell>
    </TableRow>
  )
}

interface OrderDrawerProps {
  order: Order | null
  onOpenChange: (open: boolean) => void
  onAdvance: (order: Order, status: OrderStatus) => void
  onSave: (order: Order, patch: Pick<Order, "courier" | "adminNote">) => void
}

/** Order detail: status transitions the API allows, courier/ETA and a staff-only note. */
function OrderDrawer({ order, onOpenChange, onAdvance, onSave }: OrderDrawerProps) {
  const { dir } = useI18n()

  return (
    <Sheet open={order !== null} onOpenChange={onOpenChange}>
      <SheetContent
        side={dir === "rtl" ? "left" : "right"}
        showCloseButton={false}
        className="w-full gap-0 sm:max-w-[660px]"
      >
        {order ? (
          <OrderDrawerBody
            key={order.id}
            order={order}
            onAdvance={onAdvance}
            onSave={onSave}
          />
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

/** Keyed by order id from the parent so local form state resets per order. */
function OrderDrawerBody({
  order,
  onAdvance,
  onSave,
}: {
  order: Order
  onAdvance: OrderDrawerProps["onAdvance"]
  onSave: OrderDrawerProps["onSave"]
}) {
  const { t, n, id, dateTime, relative } = useI18n()
  const [courier, setCourier] = React.useState(
    order.courier ?? { name: "", phone: "", etaEn: "", etaAr: "" }
  )
  const [note, setNote] = React.useState(order.adminNote ?? "")
  const dirty =
    note !== (order.adminNote ?? "") ||
    JSON.stringify(courier) !== JSON.stringify(order.courier ?? { name: "", phone: "", etaEn: "", etaAr: "" })

  const discard = () => {
    setCourier(order.courier ?? { name: "", phone: "", etaEn: "", etaAr: "" })
    setNote(order.adminNote ?? "")
  }

  return (
    <>
      <SheetHeader className="flex-row items-start gap-3.5 border-b px-6 py-5">
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <SheetTitle className="text-[22px] font-bold">
              {t("orders.col.order")} #{id(order.number)}
            </SheetTitle>
            <OrderStatusBadge status={order.status} />
          </div>
          <SheetDescription className="text-[13px]">
            {t("orders.placed", {
              date: dateTime(order.placedAt),
              items: order.items.length,
              total: n(order.total),
              payment: t(`orders.paymentLong.${order.paymentMethod}`),
            })}
          </SheetDescription>
        </div>
        <SheetClose render={<Button variant="ghost" size="icon" aria-label={t("orders.close")} />}>
          <XIcon />
        </SheetClose>
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-[18px] overflow-y-auto px-6 py-5">
        <section className="flex flex-col gap-2.5">
          <SubHeading>{t("orders.advanceStatus")}</SubHeading>
          <div className="flex flex-wrap items-center gap-2">
            {order.nextStatuses.map((status, index) => {
              const Icon = ACTION_ICON[status]
              const variant =
                status === "cancelled" ? "ghost" : index === 0 ? "default" : "outline"
              return (
                <Button key={status} variant={variant} onClick={() => onAdvance(order, status)}>
                  {Icon ? <Icon data-icon="inline-start" /> : null}
                  {t(ACTION_LABEL[status] ?? `status.${status}`)}
                </Button>
              )
            })}
            <span className="ms-auto text-[11px] text-muted-foreground/70">
              {t("orders.nextFromApi")}
            </span>
          </div>
        </section>

        <dl className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/60 p-4">
          {[
            [t("orders.customer"), order.customer.name],
            [t("orders.phone"), order.customer.phone],
            [t("orders.address"), order.address ?? t("delivery.pickup")],
            [
              t("orders.deliveryLabel"),
              order.deliveryMethod === "home"
                ? `${t("delivery.homeLong")}${order.deliveryEta ? ` · ${order.deliveryEta}` : ""}`
                : t("delivery.pickup"),
            ],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="label-caps text-muted-foreground">{label}</dt>
              <dd className="text-sm">{value}</dd>
            </div>
          ))}
        </dl>

        <section className="flex flex-col gap-2.5">
          <SubHeading>{t("orders.items")}</SubHeading>
          <ul className="flex flex-col gap-2.5">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center gap-3">
                <span className="size-[46px] shrink-0 rounded-sm border bg-muted" aria-hidden="true" />
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium">
                    {item.modelCode} · {item.productName}
                  </span>
                  <span className="text-[13px] text-muted-foreground">
                    {item.variant} · ×{n(item.quantity)}
                  </span>
                </div>
                <span className="text-sm font-semibold tabular-nums">{n(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
        </section>

        {order.prescription ? (
          <section className="flex flex-col gap-2.5">
            <SubHeading>{t("orders.rxOnOrder")}</SubHeading>
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="label-caps h-8 w-[70px] ps-3.5 text-muted-foreground" />
                    <TableHead className="label-caps h-8 text-muted-foreground">{t("rx.sph")}</TableHead>
                    <TableHead className="label-caps h-8 text-muted-foreground">{t("rx.cyl")}</TableHead>
                    <TableHead className="label-caps h-8 text-muted-foreground">{t("rx.axis")}</TableHead>
                    <TableHead className="label-caps h-8 pe-3.5 text-muted-foreground">{t("rx.pdAdd")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <EyeRow label={t("rx.od")} eye={order.prescription.od} pd={order.prescription.pd} />
                  <EyeRow label={t("rx.os")} eye={order.prescription.os} pd={null} />
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <RxStatusBadge status={order.prescription.status} />
              {order.prescription.verifiedBy
                ? t("orders.verifiedBy", {
                    name: order.prescription.verifiedBy,
                    date: order.prescription.verifiedOn ?? "",
                  })
                : null}
            </div>
          </section>
        ) : null}

        <section className="flex flex-col gap-2.5">
          <SubHeading>
            {t("orders.courierEta")} <span className="font-mono normal-case tracking-normal">· PATCH /admin/orders/:id</span>
          </SubHeading>
          <FieldGroup className="gap-3">
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="courier-name">{t("orders.courierName")}</FieldLabel>
                <Input
                  id="courier-name"
                  value={courier.name}
                  onChange={(e) => setCourier({ ...courier, name: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="courier-phone">{t("orders.courierPhone")}</FieldLabel>
                <Input
                  id="courier-phone"
                  dir="ltr"
                  value={courier.phone}
                  onChange={(e) => setCourier({ ...courier, phone: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="eta-en">{t("orders.etaEn")}</FieldLabel>
                <Input
                  id="eta-en"
                  dir="ltr"
                  value={courier.etaEn}
                  onChange={(e) => setCourier({ ...courier, etaEn: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="eta-ar">{t("orders.etaAr")}</FieldLabel>
                <Input
                  id="eta-ar"
                  dir="rtl"
                  lang="ar"
                  value={courier.etaAr}
                  onChange={(e) => setCourier({ ...courier, etaAr: e.target.value })}
                />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="admin-note">{t("orders.internalNote")}</FieldLabel>
              <Textarea
                id="admin-note"
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <FieldDescription>{t("orders.internalNoteHint")}</FieldDescription>
            </Field>
          </FieldGroup>
        </section>
      </div>

      <SheetFooter className="mt-0 flex-row items-center gap-2.5 border-t bg-muted/60 px-6 py-4">
        <span className="text-[13px] text-muted-foreground">
          {t("orders.lastEdited", { time: relative(order.updatedAt) })}
        </span>
        <div className="ms-auto flex gap-2.5">
          <Button variant="ghost" size="lg" disabled={!dirty} onClick={discard}>
            {t("common.discard")}
          </Button>
          <Button
            variant="secondary"
            size="lg"
            disabled={!dirty}
            onClick={() => onSave(order, { courier: courier.name ? courier : null, adminNote: note || null })}
          >
            {t("common.save")}
          </Button>
        </div>
      </SheetFooter>
    </>
  )
}

export { OrderDrawer }
