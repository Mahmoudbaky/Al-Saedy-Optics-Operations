import * as React from "react"
import { ShieldCheckIcon, XIcon } from "lucide-react"

import { RxStatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/lib/i18n"
import type { EyeValues, Prescription } from "@/types"

type Eye = "od" | "os"
type EyeField = keyof EyeValues

interface EyeForm {
  sph: string
  cyl: string
  axis: string
}

export interface RxFormValues {
  od: EyeForm
  os: EyeForm
  pd: string
  add: string
  doctorName: string
  issuedOn: string
  expiresOn: string
  note: string
}

const toForm = (eye: EyeValues): EyeForm => ({
  sph: eye.sph ?? "",
  cyl: eye.cyl ?? "",
  axis: eye.axis ?? "",
})

function initialValues(rx: Prescription): RxFormValues {
  return {
    od: toForm(rx.od),
    os: toForm(rx.os),
    pd: rx.pd ?? "",
    add: rx.add ?? "",
    doctorName: rx.doctorName ?? "",
    issuedOn: rx.issuedOn ?? "",
    expiresOn: rx.expiresOn ?? "",
    note: rx.reviewNote ?? "",
  }
}

/** Axis is only meaningful with a cylinder and must sit in 0–180. */
function axisError(eye: EyeForm): boolean {
  if (eye.axis === "") return false
  const axis = Number(eye.axis)
  return !Number.isInteger(axis) || axis < 0 || axis > 180
}

interface RxReviewFormProps {
  prescription: Prescription
  submitting?: boolean
  onVerify: (values: RxFormValues) => void
  onReject: (values: RxFormValues) => void
}

/** POST /admin/prescriptions/:id/review — corrections are saved back onto the Rx. */
function RxReviewForm({ prescription, submitting = false, onVerify, onReject }: RxReviewFormProps) {
  const { t, id, relative } = useI18n()
  const [values, setValues] = React.useState(() => initialValues(prescription))

  const setEye = (eye: Eye, field: EyeField, value: string) =>
    setValues((v) => ({ ...v, [eye]: { ...v[eye], [field]: value } }))
  const set = (field: keyof Omit<RxFormValues, "od" | "os">, value: string) =>
    setValues((v) => ({ ...v, [field]: value }))

  const errors = { od: axisError(values.od), os: axisError(values.os) }
  const invalid = errors.od || errors.os

  const eyeRow = (eye: Eye, label: string) => (
    <div className="grid grid-cols-[78px_1fr_1fr_1fr] items-start gap-3">
      <span className="pt-2 text-sm font-semibold">{label}</span>
      <Field>
        <FieldLabel htmlFor={`${eye}-sph`} className="sr-only">
          {label} {t("rx.sph")}
        </FieldLabel>
        <Input
          id={`${eye}-sph`}
          inputMode="decimal"
          dir="ltr"
          value={values[eye].sph}
          onChange={(e) => setEye(eye, "sph", e.target.value)}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${eye}-cyl`} className="sr-only">
          {label} {t("rx.cyl")}
        </FieldLabel>
        <Input
          id={`${eye}-cyl`}
          inputMode="decimal"
          dir="ltr"
          value={values[eye].cyl}
          onChange={(e) => setEye(eye, "cyl", e.target.value)}
        />
      </Field>
      <Field data-invalid={errors[eye] || undefined}>
        <FieldLabel htmlFor={`${eye}-axis`} className="sr-only">
          {label} {t("rx.axis")}
        </FieldLabel>
        <Input
          id={`${eye}-axis`}
          inputMode="numeric"
          dir="ltr"
          aria-invalid={errors[eye] || undefined}
          value={values[eye].axis}
          onChange={(e) => setEye(eye, "axis", e.target.value)}
        />
        {errors[eye] ? <FieldError className="text-[11px]">{t("rx.axisError")}</FieldError> : null}
      </Field>
    </div>
  )

  return (
    <div className="flex w-full shrink-0 flex-col gap-3.5 xl:w-[560px]">
      <div className="flex flex-wrap items-center gap-2.5">
        <h2 className="font-heading text-lg font-semibold">{prescription.user.name}</h2>
        <RxStatusBadge status={prescription.status} />
        <span className="ms-auto text-[13px] text-muted-foreground">
          {t("rx.submitted", { time: relative(prescription.createdAt) })}
        </span>
      </div>

      <Card>
        <CardContent>
          <FieldGroup className="gap-3.5">
            <div className="label-caps grid grid-cols-[78px_1fr_1fr_1fr] gap-3 text-muted-foreground" aria-hidden="true">
              <span />
              <span>{t("rx.sph")}</span>
              <span>{t("rx.cyl")}</span>
              <span>{t("rx.axis")}</span>
            </div>
            {eyeRow("od", t("rx.right"))}
            {eyeRow("os", t("rx.left"))}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Field>
                <FieldLabel htmlFor="rx-pd">{t("rx.pd")}</FieldLabel>
                <Input id="rx-pd" dir="ltr" value={values.pd} onChange={(e) => set("pd", e.target.value)} />
                <FieldDescription>{t("rx.pdHint")}</FieldDescription>
              </Field>
              <Field>
                <FieldLabel htmlFor="rx-add">{t("rx.add")}</FieldLabel>
                <Input
                  id="rx-add"
                  dir="ltr"
                  placeholder={t("rx.optional")}
                  value={values.add}
                  onChange={(e) => set("add", e.target.value)}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="rx-doctor">{t("rx.doctor")}</FieldLabel>
                <Input id="rx-doctor" value={values.doctorName} onChange={(e) => set("doctorName", e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="rx-issued">{t("rx.issuedOn")}</FieldLabel>
                <Input id="rx-issued" type="date" value={values.issuedOn} onChange={(e) => set("issuedOn", e.target.value)} />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="rx-expires">{t("rx.expiresOn")}</FieldLabel>
              <Input id="rx-expires" type="date" value={values.expiresOn} onChange={(e) => set("expiresOn", e.target.value)} />
              <FieldDescription>{t("rx.expiresHint")}</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="rx-note">{t("rx.note")}</FieldLabel>
              <Textarea
                id="rx-note"
                rows={2}
                placeholder={t("rx.notePlaceholder")}
                value={values.note}
                onChange={(e) => set("note", e.target.value)}
              />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-2.5">
          <span className="flex-1 text-[13px] text-muted-foreground">
            {prescription.waitingOrderNumber !== null
              ? t("rx.waitingOrder", { number: id(prescription.waitingOrderNumber) })
              : t("rx.noWaitingOrder")}
          </span>
          <Button variant="outline" size="lg" disabled={submitting} onClick={() => onReject(values)}>
            <XIcon data-icon="inline-start" />
            {t("rx.reject")}
          </Button>
          <Button size="lg" disabled={invalid || submitting} onClick={() => onVerify(values)}>
            <ShieldCheckIcon data-icon="inline-start" />
            {t("rx.verify")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export { RxReviewForm }
