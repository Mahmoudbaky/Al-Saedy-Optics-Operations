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

import { useApiErrorMessage, type UpdateOrderDetailsInput } from "@/api"
import { SubHeading } from "@/components/shared/section-heading"
import { Spinner } from "@/components/shared/spinner"
import { OrderStatusBadge, RxStatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { useI18n, type MessageKey } from "@/lib/i18n"
import type { EyeValues, Order, OrderStatus } from "@/types"

const ACTION_ICON: Partial<Record<OrderStatus, LucideIcon>> = {
  confirmed: CheckIcon,
  lab: FlaskConicalIcon,
  onTheWay: TruckIcon,
  ready: StoreIcon,
  delivered: PackageCheckIcon,
  cancelled: BanIcon,
}

const ACTION_LABEL: Partial<Record<OrderStatus, MessageKey>> = {
  confirmed: "orders.action.confirmed",
  lab: "orders.action.lab",
  onTheWay: "orders.action.onTheWay",
  ready: "orders.action.ready",
  delivered: "orders.action.delivered",
  cancelled: "orders.action.cancelled",
}

function EyeRow({ label, eye, pd }: { label: string; eye: EyeValues; pd: string | null }) {
  return (
    <TableRow>
      <TableCell className="ps-3.5 font-semibold">{label}</TableCell>
      <TableCell className="tabular-nums" dir="ltr">{eye.sph ?? "—"}</TableCell>
      <TableCell className="tabular-nums" dir="ltr">{eye.cyl ?? "—"}</TableCell>
      <TableCell className="tabular-nums" dir="ltr">{eye.axis ?? "—"}</TableCell>
      <TableCell className="pe-3.5 tabular-nums" dir="ltr">{pd ?? "—"}</TableCell>
    </TableRow>
  )
}

interface CourierForm {
  name: string
  phone: string
  etaEn: string
  etaAr: string
}

const courierForm = (order: Order): CourierForm => ({
  name: order.courier?.name ?? "",
  phone: order.courier?.phone ?? "",
  etaEn: order.eta?.en ?? "",
  etaAr: order.eta?.ar ?? "",
})

interface OrderDrawerProps {
  open: boolean
  order: Order | null
  loading: boolean
  error: unknown
  saving: boolean
  onOpenChange: (open: boolean) => void
  onAdvance: (order: Order, status: OrderStatus) => void
  onSave: (order: Order, patch: UpdateOrderDetailsInput) => void
}

/** Order detail: status transitions the API allows, courier/ETA and a staff-only note. */
function OrderDrawer({ open, order, loading, error, saving, onOpenChange, onAdvance, onSave }: OrderDrawerProps) {
  const { dir } = useI18n()
  const errorMessage = useApiErrorMessage()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={dir === "rtl" ? "left" : "right"} showCloseButton={false} className="w-full gap-0 sm:max-w-[660px]">
        {order ? (
          <OrderDrawerBody key={`${order.id}-${order.updatedAt}`} order={order} saving={saving} onAdvance={onAdvance} onSave={onSave} />
        ) : loading ? (
          <div className="flex flex-1 items-center justify-center">
            <Spinner />
          </div>
        ) : error ? (
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted-foreground">{errorMessage(error)}</div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}

/** Keyed by order id + updatedAt from the parent so local form state resets per order version. */
function OrderDrawerBody({
  order,
  saving,
  onAdvance,
  onSave,
}: {
  order: Order
  saving: boolean
  onAdvance: OrderDrawerProps["onAdvance"]
  onSave: OrderDrawerProps["onSave"]
}) {
  const { t, n, id, locale, dateTime, relative } = useI18n()
  const [courier, setCourier] = React.useState<CourierForm>(() => courierForm(order))
  const [note, setNote] = React.useState(order.adminNote ?? "")
  const initial = courierForm(order)
  const dirty = note !== (order.adminNote ?? "") || JSON.stringify(courier) !== JSON.stringify(initial)

  const discard = () => {
    setCourier(initial)
    setNote(order.adminNote ?? "")
  }

  const save = () =>
    onSave(order, {
      courierName: courier.name.trim() || null,
      courierPhone: courier.phone.trim() || null,
      eta: courier.etaEn.trim() || courier.etaAr.trim() ? { en: courier.etaEn.trim() || courier.etaAr.trim(), ar: courier.etaAr.trim() || courier.etaEn.trim() } : null,
      adminNote: note.trim() || null,
    })

  const l = (v: { ar: string; en: string }) => v[locale]

  return (
    <>
      <SheetHeader className="flex-row items-start gap-3.5 border-b px-6 py-5">
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <SheetTitle className="text-[22px] font-bold">
              {t("orders.col.order")} #{id(order.number)}
            </SheetTitle>
            <OrderStatusBadge status={order.status} />
            {order.paymentStatus === "paid" ? <Badge variant="success">{t("orders.paid")}</Badge> : null}
          </div>
          <SheetDescription className="text-[13px]">
            {t("orders.placed", {
              date: dateTime(order.createdAt),
              items: order.itemCount,
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
              const variant = status === "cancelled" ? "ghost" : index === 0 ? "default" : "outline"
              return (
                <Button key={status} variant={variant} disabled={saving} onClick={() => onAdvance(order, status)}>
                  {Icon ? <Icon data-icon="inline-start" /> : null}
                  {t(ACTION_LABEL[status] ?? `status.${status}`)}
                </Button>
              )
            })}
            <span className="ms-auto text-[11px] text-muted-foreground/70">{t("orders.nextFromApi")}</span>
          </div>
        </section>

        <dl className="grid grid-cols-2 gap-4 rounded-lg border bg-muted/60 p-4">
          {[
            [t("orders.customer"), order.user.name],
            [t("orders.phone"), order.address?.phone ?? order.user.phone ?? order.user.email],
            [t("orders.address"), order.address?.formatted ?? t("delivery.pickup")],
            [t("orders.deliveryLabel"), order.deliveryMethod === "home" ? `${t("delivery.homeLong")}${order.eta ? ` · ${l(order.eta)}` : ""}` : t("delivery.pickup")],
            ...(order.customerNote ? [[t("orders.customerNote"), order.customerNote]] : []),
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
            {order.items.map((item) => {
              const details = [item.variantLabel, ...item.addons.map((a) => l(a.name))].filter(Boolean).join(" · ")
              return (
                <li key={item.id} className="flex items-center gap-3">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt="" className="size-[46px] shrink-0 rounded-sm border object-cover" />
                  ) : (
                    <span className="size-[46px] shrink-0 rounded-sm border bg-muted" aria-hidden="true" />
                  )}
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium">{item.code ? `${item.code} · ` : ""}{l(item.name)}</span>
                    <span className="text-[13px] text-muted-foreground">
                      {item.colorHex ? <span className="me-1.5 inline-block size-2.5 rounded-full border align-middle" style={{ backgroundColor: item.colorHex }} /> : null}
                      {details ? `${details} · ` : ""}×{n(item.quantity)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">{n(item.lineTotal)}</span>
                </li>
              )
            })}
          </ul>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
            {order.discount > 0 ? (
              <>
                <dt>{order.promoCode}</dt>
                <dd className="text-end tabular-nums">− {n(order.discount)}</dd>
              </>
            ) : null}
            <dt>{t("delivery.homeLong")}</dt>
            <dd className="text-end tabular-nums">{n(order.deliveryFee)}</dd>
          </dl>
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
                  <EyeRow label={t("rx.os")} eye={order.prescription.os} pd={order.prescription.add} />
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <span>{t("orders.prescriptionLive")}</span>
              <RxStatusBadge status={order.prescriptionStatus} />
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
                <Input id="courier-name" value={courier.name} onChange={(e) => setCourier({ ...courier, name: e.target.value })} />
              </Field>
              <Field>
                <FieldLabel htmlFor="courier-phone">{t("orders.courierPhone")}</FieldLabel>
                <Input id="courier-phone" dir="ltr" value={courier.phone} onChange={(e) => setCourier({ ...courier, phone: e.target.value })} />
              </Field>
              <Field>
                <FieldLabel htmlFor="eta-en">{t("orders.etaEn")}</FieldLabel>
                <Input id="eta-en" dir="ltr" value={courier.etaEn} onChange={(e) => setCourier({ ...courier, etaEn: e.target.value })} />
              </Field>
              <Field>
                <FieldLabel htmlFor="eta-ar">{t("orders.etaAr")}</FieldLabel>
                <Input id="eta-ar" dir="rtl" lang="ar" value={courier.etaAr} onChange={(e) => setCourier({ ...courier, etaAr: e.target.value })} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="admin-note">{t("orders.internalNote")}</FieldLabel>
              <Textarea id="admin-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
              <FieldDescription>{t("orders.internalNoteHint")}</FieldDescription>
            </Field>
          </FieldGroup>
        </section>

        <section className="flex flex-col gap-2.5">
          <SubHeading>{t("orders.events")}</SubHeading>
          <ol className="flex flex-col gap-1.5 text-[13px]">
            {[...order.events].reverse().map((event, i) => (
              <li key={`${event.at}-${i}`} className="flex items-baseline gap-2">
                <span className="w-[150px] shrink-0 text-muted-foreground">{dateTime(event.at)}</span>
                <span className="font-medium">{t(`status.${event.status}`)}</span>
                <span className="text-muted-foreground">
                  {event.actorId ? t("orders.byStaff") : t("orders.bySystem")}
                  {event.note ? ` · ${event.note}` : ""}
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <SheetFooter className="mt-0 flex-row items-center gap-2.5 border-t bg-muted/60 px-6 py-4">
        <span className="text-[13px] text-muted-foreground">{t("orders.lastEdited", { time: relative(order.updatedAt) })}</span>
        <div className="ms-auto flex gap-2.5">
          <Button variant="ghost" size="lg" disabled={!dirty || saving} onClick={discard}>
            {t("common.discard")}
          </Button>
          <Button variant="secondary" size="lg" disabled={!dirty || saving} onClick={save}>
            {t("common.save")}
          </Button>
        </div>
      </SheetFooter>
    </>
  )
}

export { OrderDrawer }
