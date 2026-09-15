import * as React from "react"

import { ApiError, useApiErrorMessage, useCreateLensAddon, useUpdateLensAddon, type LensAddonInput } from "@/api"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { useI18n } from "@/lib/i18n"
import type { LensAddon } from "@/types"

type Mode = { kind: "new" } | { kind: "edit"; addon: LensAddon } | null

interface AddonFormProps {
  mode: Mode
  onOpenChange: (open: boolean) => void
}

const KEY_RE = /^[a-z][A-Za-z0-9]{1,40}$/

/** POST / PATCH /admin/lens-addons — create or edit one add-on in a side sheet. */
function AddonForm({ mode, onOpenChange }: AddonFormProps) {
  const { dir } = useI18n()
  return (
    <Sheet open={mode !== null} onOpenChange={onOpenChange}>
      <SheetContent side={dir === "rtl" ? "left" : "right"} className="sm:max-w-[480px]">
        {mode ? <AddonFields key={mode.kind === "edit" ? mode.addon.id : "new"} editing={mode.kind === "edit" ? mode.addon : null} onOpenChange={onOpenChange} /> : null}
      </SheetContent>
    </Sheet>
  )
}

const emptyForm = { id: "", nameEn: "", nameAr: "", descriptionEn: "", descriptionAr: "", price: "", sortOrder: "0", isActive: true }

/** Keyed by add-on id so the fields initialise from the record being edited. */
function AddonFields({ editing, onOpenChange }: { editing: LensAddon | null; onOpenChange: (open: boolean) => void }) {
  const { t } = useI18n()
  const errorMessage = useApiErrorMessage()
  const create = useCreateLensAddon()
  const update = useUpdateLensAddon()

  const [form, setForm] = React.useState(() =>
    editing
      ? {
          id: editing.id,
          nameEn: editing.name.en,
          nameAr: editing.name.ar,
          descriptionEn: editing.description?.en ?? "",
          descriptionAr: editing.description?.ar ?? "",
          price: String(editing.price),
          sortOrder: String(editing.sortOrder),
          isActive: editing.isActive,
        }
      : emptyForm
  )
  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [formError, setFormError] = React.useState<string | null>(null)

  const set = (field: keyof typeof form) => (value: string | boolean) => setForm((f) => ({ ...f, [field]: value }))
  const saving = create.isPending || update.isPending

  const submit = async () => {
    const next: Record<string, string> = {}
    if (!editing && !KEY_RE.test(form.id)) next.id = t("addons.keyHint")
    if (!form.nameEn.trim()) next["name.en"] = t("error.validation")
    if (!form.nameAr.trim()) next["name.ar"] = t("error.validation")
    const price = Number(form.price)
    if (!Number.isInteger(price) || price < 0) next.price = t("error.validation")
    setErrors(next)
    setFormError(null)
    if (Object.keys(next).length) return

    const input: LensAddonInput = {
      id: form.id.trim(),
      name: { en: form.nameEn.trim(), ar: form.nameAr.trim() },
      description: form.descriptionEn.trim() || form.descriptionAr.trim() ? { en: form.descriptionEn.trim() || null, ar: form.descriptionAr.trim() || null } : null,
      price,
      sortOrder: Number(form.sortOrder) || 0,
      isActive: form.isActive,
    }
    try {
      if (editing) {
        const { id: _key, ...patch } = input
        await update.mutateAsync({ id: editing.id, ...patch })
      } else {
        await create.mutateAsync(input)
      }
      toast.add({ type: "success", title: t("addons.saved") })
      onOpenChange(false)
    } catch (err) {
      if (ApiError.is(err, "VALIDATION_ERROR")) setErrors(err.fieldErrors())
      setFormError(errorMessage(err))
    }
  }

  return (
    <>
        <SheetHeader>
          <SheetTitle>{editing ? t("addons.edit") : t("addons.new")}</SheetTitle>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-4">
          <FieldGroup className="gap-4">
            <Field data-invalid={errors.id ? true : undefined}>
              <FieldLabel htmlFor="addon-key">{t("addons.key")}</FieldLabel>
              <Input id="addon-key" dir="ltr" className="font-mono" value={form.id} disabled={!!editing} onChange={(e) => set("id")(e.target.value)} placeholder="blueLight" />
              <FieldDescription>{t("addons.keyHint")}</FieldDescription>
              {errors.id ? <FieldError>{errors.id}</FieldError> : null}
            </Field>
            <Field data-invalid={errors["name.en"] ? true : undefined}>
              <FieldLabel htmlFor="addon-name-en">{t("addons.nameEn")}</FieldLabel>
              <Input id="addon-name-en" dir="ltr" value={form.nameEn} onChange={(e) => set("nameEn")(e.target.value)} />
              {errors["name.en"] ? <FieldError>{errors["name.en"]}</FieldError> : null}
            </Field>
            <Field data-invalid={errors["name.ar"] ? true : undefined}>
              <FieldLabel htmlFor="addon-name-ar">{t("addons.nameAr")}</FieldLabel>
              <Input id="addon-name-ar" dir="rtl" lang="ar" value={form.nameAr} onChange={(e) => set("nameAr")(e.target.value)} />
              {errors["name.ar"] ? <FieldError>{errors["name.ar"]}</FieldError> : null}
            </Field>
            <Field>
              <FieldLabel htmlFor="addon-desc-en">{t("addons.descriptionEn")}</FieldLabel>
              <Textarea id="addon-desc-en" dir="ltr" rows={2} value={form.descriptionEn} onChange={(e) => set("descriptionEn")(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="addon-desc-ar">{t("addons.descriptionAr")}</FieldLabel>
              <Textarea id="addon-desc-ar" dir="rtl" lang="ar" rows={2} value={form.descriptionAr} onChange={(e) => set("descriptionAr")(e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field data-invalid={errors.price ? true : undefined}>
                <FieldLabel htmlFor="addon-price">{t("addons.price")}</FieldLabel>
                <Input id="addon-price" type="number" min={0} dir="ltr" value={form.price} onChange={(e) => set("price")(e.target.value)} />
                {errors.price ? <FieldError>{errors.price}</FieldError> : null}
              </Field>
              <Field>
                <FieldLabel htmlFor="addon-sort">{t("addons.sortOrder")}</FieldLabel>
                <Input id="addon-sort" type="number" dir="ltr" value={form.sortOrder} onChange={(e) => set("sortOrder")(e.target.value)} />
              </Field>
            </div>
            <Field orientation="horizontal" className="gap-2">
              <Switch id="addon-active" checked={form.isActive} onCheckedChange={(v) => set("isActive")(v)} />
              <FieldLabel htmlFor="addon-active" className="font-normal">
                {t("addons.active")}
              </FieldLabel>
            </Field>
            {formError ? <p className="text-[13px] text-critical">{formError}</p> : null}
          </FieldGroup>
        </div>
        <SheetFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            {t("common.cancel")}
          </Button>
          <Button onClick={submit} disabled={saving}>
            {t("common.saveShort")}
          </Button>
        </SheetFooter>
    </>
  )
}

export { AddonForm }
