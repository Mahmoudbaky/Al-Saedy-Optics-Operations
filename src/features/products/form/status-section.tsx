import type { Product } from "@/api/types"
import { Switch } from "@/components/ui/switch"
import { useI18n } from "@/lib/i18n"
import { FormSection } from "./form-primitives"
import type { SectionProps } from "./sections"

type Flag = "isActive" | "isBestSeller" | "requiresPrescription" | "supportsLensAddons"

const FLAGS: Flag[] = ["isActive", "isBestSeller", "requiresPrescription", "supportsLensAddons"]

/** The four booleans the storefront keys off, each with a one-line consequence. */
export function StatusSection({ values, set, product }: Pick<SectionProps, "values" | "set"> & { product?: Product }) {
  const { t, n, monthYear } = useI18n()
  return (
    <FormSection title={t("pf.status")} api={t("pf.statusApi")}>
      {FLAGS.map((flag) => (
        <label key={flag} className="flex cursor-pointer items-start gap-3">
          <Switch checked={values[flag]} onCheckedChange={(v) => set(flag, v)} aria-label={t(`pf.${flag}`)} />
          <span className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{t(`pf.${flag}`)}</span>
            <span className="text-[11px] text-muted-foreground">{t(`pf.${flag}Hint`)}</span>
          </span>
        </label>
      ))}
      {product ? (
        <dl className="mt-1 flex flex-col gap-1 border-t pt-3 text-[13px] text-muted-foreground">
          <dt className="label-caps">{t("pf.summary")}</dt>
          <dd>{t("pf.soldCount", { n: product.soldCount })}</dd>
          {product.rating.count > 0 ? <dd>{t("pf.rating", { avg: n(product.rating.average, { maximumFractionDigits: 1 }), n: product.rating.count })}</dd> : null}
          <dd>{t("pf.createdAt", { date: monthYear(product.createdAt) })}</dd>
        </dl>
      ) : null}
    </FormSection>
  )
}
