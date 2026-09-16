import { PlusIcon, Trash2Icon } from "lucide-react"

import type { Brand, Category, FrameShape, Gender } from "@/api/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { FRAME_SHAPES, GENDERS } from "@/types"
import { FormField, FormSection, FormSelect } from "./form-primitives"
import { emptyVariant, type ProductFormValues, type VariantRow } from "./product-form-state"

export interface SectionProps {
  values: ProductFormValues
  errors: Record<string, string | undefined>
  set: <K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => void
}

const MATERIALS = ["Acetate", "Metal", "Titanium", "TR90", "Nylon", "Plastic", "Acetate / metal"]

/* ── Identity ─────────────────────────────────────────────────────── */

export function IdentitySection({ values, errors, set }: SectionProps) {
  const { t } = useI18n()
  return (
    <FormSection title={t("pf.identity")} api={t("pf.identityApi")}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField id="name-en" label={t("pf.nameEn")} hint={t("pf.nameEnHint")} error={errors["name.en"]}>
          <Input id="name-en" dir="ltr" placeholder="Rectangular acetate frame" value={values.nameEn} onChange={(e) => set("nameEn", e.target.value)} aria-invalid={!!errors["name.en"]} />
        </FormField>
        <FormField id="name-ar" label={t("pf.nameAr")} hint={t("pf.nameArHint")} error={errors["name.ar"]}>
          <Input id="name-ar" dir="rtl" lang="ar" placeholder="إطار أسيتات مستطيل" value={values.nameAr} onChange={(e) => set("nameAr", e.target.value)} aria-invalid={!!errors["name.ar"]} />
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField id="code" label={t("pf.code")} hint={t("pf.codeHint")} error={errors.code}>
          <Input id="code" dir="ltr" placeholder="VC 214" value={values.code} onChange={(e) => set("code", e.target.value.toUpperCase())} />
        </FormField>
        <FormField id="slug" label={t("pf.slug")} hint={t("pf.slugHint")} error={errors.slug}>
          <Input id="slug" dir="ltr" className="font-mono" placeholder="vc-214-rectangular-acetate" value={values.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} />
        </FormField>
        <FormField id="note-en" label={t("pf.noteEn")} hint={t("pf.noteHint")} error={errors["note.en"]}>
          <Input id="note-en" dir="ltr" placeholder="Light · 8 g" value={values.noteEn} onChange={(e) => set("noteEn", e.target.value)} />
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField id="description-en" label={t("pf.descriptionEn")} error={errors["description.en"]}>
          <Textarea id="description-en" dir="ltr" rows={3} placeholder={t("pf.descriptionPlaceholderEn")} value={values.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} />
        </FormField>
        <FormField id="description-ar" label={t("pf.descriptionAr")} error={errors["description.ar"]}>
          <Textarea id="description-ar" dir="rtl" lang="ar" rows={3} placeholder={t("pf.descriptionPlaceholderAr")} value={values.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} />
        </FormField>
      </div>
      <FormField id="note-ar" label={t("pf.noteAr")} error={errors["note.ar"]} className="md:max-w-[calc(50%-0.5rem)]">
        <Input id="note-ar" dir="rtl" lang="ar" placeholder="خفيف · ٨ غرام" value={values.noteAr} onChange={(e) => set("noteAr", e.target.value)} />
      </FormField>
    </FormSection>
  )
}

/* ── Classification ───────────────────────────────────────────────── */

export function ClassificationSection({ values, errors, set, categories, brands }: SectionProps & { categories: Category[]; brands: Brand[] }) {
  const { t, locale } = useI18n()
  return (
    <FormSection title={t("pf.classification")} api={t("pf.classificationApi")}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField id="category" label={t("pf.category")} hint={t("pf.categoryHint")} error={errors.categoryId}>
          <FormSelect id="category" value={values.categoryId} onChange={(v) => set("categoryId", v)} placeholder="—" aria-invalid={!!errors.categoryId} options={categories.map((c) => ({ value: c.id, label: c.name[locale] }))} />
        </FormField>
        <FormField id="brand" label={t("pf.brand")} error={errors.brandId}>
          <FormSelect id="brand" value={values.brandId} onChange={(v) => set("brandId", v)} options={[{ value: "", label: t("pf.noBrand") }, ...brands.map((b) => ({ value: b.id, label: b.name[locale] }))]} />
        </FormField>
        <FormField id="shape" label={t("pf.shape")} error={errors.shape}>
          <FormSelect<FrameShape | "">
            id="shape"
            value={values.shape}
            onChange={(v) => set("shape", v)}
            options={[{ value: "", label: t("pf.noShape") }, ...FRAME_SHAPES.map((s) => ({ value: s, label: t(`shape.${s}`) }))]}
          />
        </FormField>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <FormField id="gender" label={t("pf.gender")} error={errors.gender}>
          <FormSelect<Gender> id="gender" value={values.gender} onChange={(v) => set("gender", v)} options={GENDERS.map((g) => ({ value: g, label: t(`gender.${g}`) }))} />
        </FormField>
        <FormField id="material" label={t("pf.material")} error={errors["specs.material"]}>
          <Input id="material" dir="ltr" list="material-options" placeholder="Acetate" value={values.material} onChange={(e) => set("material", e.target.value)} />
          <datalist id="material-options">
            {MATERIALS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </FormField>
        <FormField id="size" label={t("pf.size")} hint={t("pf.sizeHint")} error={errors.size}>
          <Input id="size" dir="ltr" inputMode="numeric" placeholder="54-18-145" value={values.size} onChange={(e) => set("size", e.target.value)} aria-invalid={!!errors.size} />
        </FormField>
        <FormField id="weight" label={t("pf.weight")} error={errors.weightGrams}>
          <Input id="weight" dir="ltr" inputMode="decimal" placeholder="24" value={values.weightGrams} onChange={(e) => set("weightGrams", e.target.value)} aria-invalid={!!errors.weightGrams} />
        </FormField>
      </div>
    </FormSection>
  )
}

/* ── Pricing ──────────────────────────────────────────────────────── */

export function PricingSection({ values, errors, set }: SectionProps) {
  const { t, n } = useI18n()
  const price = Number(values.price)
  const compare = Number(values.compareAtPrice)
  const discount = price > 0 && compare > price ? Math.round((1 - price / compare) * 100) : null
  return (
    <FormSection title={t("pf.pricing")} api={t("pf.pricingApi")}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <FormField id="price" label={t("pf.price")} hint={t("pf.priceHint")} error={errors.price}>
          <Input id="price" dir="ltr" inputMode="numeric" placeholder="75000" value={values.price} onChange={(e) => set("price", e.target.value.replace(/[^\d]/g, ""))} aria-invalid={!!errors.price} />
        </FormField>
        <FormField id="compare-at" label={t("pf.compareAt")} hint={t("pf.compareAtHint")} error={errors.compareAtPrice}>
          <Input id="compare-at" dir="ltr" inputMode="numeric" placeholder="95000" value={values.compareAtPrice} onChange={(e) => set("compareAtPrice", e.target.value.replace(/[^\d]/g, ""))} aria-invalid={!!errors.compareAtPrice} />
        </FormField>
        <FormField id="discount" label={t("pf.discount")} hint={t("pf.discountHint")}>
          <div id="discount" className="flex h-8 items-center text-sm text-muted-foreground">{discount === null ? "—" : `${n(discount)}%`}</div>
        </FormField>
      </div>
    </FormSection>
  )
}

/* ── Colour variants & stock ──────────────────────────────────────── */

interface VariantsSectionProps extends SectionProps {
  /** Existing variants cannot be removed below one on the server. */
  minRows?: number
}

export function VariantsSection({ values, errors, set, minRows = 1 }: VariantsSectionProps) {
  const { t } = useI18n()
  const rows = values.variants
  const update = (key: string, patch: Partial<VariantRow>) => set("variants", rows.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  const remove = (key: string) => set("variants", rows.filter((r) => r.key !== key))
  const cols = "grid grid-cols-[44px_1fr_1fr_140px_100px_72px_36px] items-center gap-3"

  return (
    <FormSection title={t("pf.variants")} api={t("pf.variantsApi")}>
      <div className={cn(cols, "label-caps border-b pb-2 text-muted-foreground")}>
        <span>{t("pf.swatch")}</span>
        <span>{t("pf.colourEn")}</span>
        <span>{t("pf.colourAr")}</span>
        <span>{t("pf.sku")}</span>
        <span>{t("pf.stock")}</span>
        <span className="text-center">{t("pf.active")}</span>
        <span />
      </div>
      {rows.map((row, i) => {
        const hexError = errors[`variants.${i}.colorHex`]
        const stockError = errors[`variants.${i}.stock`]
        return (
          <div key={row.key} className={cn(cols, "border-b py-1 last:border-b-0")}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <label
                    className={cn("relative block size-[34px] cursor-pointer rounded-md border shadow-xs", hexError && "border-destructive ring-2 ring-destructive/30")}
                    style={{ backgroundColor: /^#[0-9a-fA-F]{6}$/.test(row.colorHex) ? row.colorHex : "#fff" }}
                  />
                }
              >
                <input type="color" className="absolute inset-0 size-full cursor-pointer opacity-0" value={/^#[0-9a-fA-F]{6}$/.test(row.colorHex) ? row.colorHex : "#000000"} onChange={(e) => update(row.key, { colorHex: e.target.value.toUpperCase() })} aria-label={t("pf.swatch")} />
              </TooltipTrigger>
              <TooltipContent dir="ltr">{hexError ?? row.colorHex}</TooltipContent>
            </Tooltip>
            <Input dir="ltr" placeholder="Black" value={row.colorEn} onChange={(e) => update(row.key, { colorEn: e.target.value })} aria-label={t("pf.colourEn")} />
            <Input dir="rtl" lang="ar" placeholder="أسود" value={row.colorAr} onChange={(e) => update(row.key, { colorAr: e.target.value })} aria-label={t("pf.colourAr")} />
            <Input dir="ltr" className="font-mono text-[13px]" placeholder="VC214-BLK" value={row.sku} onChange={(e) => update(row.key, { sku: e.target.value.toUpperCase() })} aria-label={t("pf.sku")} />
            <Input dir="ltr" inputMode="numeric" value={row.stock} onChange={(e) => update(row.key, { stock: e.target.value.replace(/[^\d]/g, "") })} aria-label={t("pf.stock")} aria-invalid={!!stockError} />
            <div className="flex justify-center">
              <Switch checked={row.isActive} onCheckedChange={(v) => update(row.key, { isActive: v })} aria-label={t("pf.active")} />
            </div>
            <Button variant="ghost" size="icon-sm" aria-label={t("pf.removeColour")} disabled={rows.length <= minRows} onClick={() => remove(row.key)}>
              <Trash2Icon />
            </Button>
          </div>
        )
      })}
      {errors.variants ? <p className="text-[11px] text-destructive">{errors.variants}</p> : null}
      <div>
        <Button variant="outline" size="sm" onClick={() => set("variants", [...rows, emptyVariant()])}>
          <PlusIcon data-icon="inline-start" />
          {t("pf.addColour")}
        </Button>
      </div>
    </FormSection>
  )
}
