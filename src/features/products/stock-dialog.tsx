import * as React from "react"

import { useAdjustStock, useApiErrorMessage } from "@/api"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { toast } from "@/components/ui/toast"
import { useI18n } from "@/lib/i18n"
import type { Product, ProductVariant } from "@/types"

interface StockDialogProps {
  target: { product: Product; variant: ProductVariant } | null
  onOpenChange: (open: boolean) => void
}

/** PATCH /admin/products/:id/variants/:variantId/stock — absolute stock for one colour. */
function StockDialog({ target, onOpenChange }: StockDialogProps) {
  const { dir } = useI18n()
  return (
    <Sheet open={target !== null} onOpenChange={onOpenChange}>
      <SheetContent side={dir === "rtl" ? "left" : "right"} className="sm:max-w-[400px]">
        {target ? <StockForm key={target.variant.id} target={target} onOpenChange={onOpenChange} /> : null}
      </SheetContent>
    </Sheet>
  )
}

/** Keyed by variant so the input starts from that variant's current stock. */
function StockForm({ target, onOpenChange }: { target: NonNullable<StockDialogProps["target"]>; onOpenChange: (open: boolean) => void }) {
  const { t, locale } = useI18n()
  const errorMessage = useApiErrorMessage()
  const adjust = useAdjustStock()
  const [value, setValue] = React.useState(() => String(target.variant.stock))
  const [error, setError] = React.useState<string | null>(null)

  const submit = async () => {
    const stock = Number(value)
    if (!Number.isInteger(stock) || stock < 0) return setError(t("error.validation"))
    try {
      await adjust.mutateAsync({ productId: target.product.id, variantId: target.variant.id, stock })
      toast.add({ type: "success", title: t("products.stockUpdated") })
      onOpenChange(false)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <>
            <SheetHeader>
              <SheetTitle>{t("products.adjustStock")}</SheetTitle>
              <SheetDescription>
                {t("products.stockFor", { name: `${target.product.name[locale]} · ${target.variant.colorName?.[locale] ?? target.variant.colorHex}` })}
              </SheetDescription>
            </SheetHeader>
            <div className="px-4">
              <Field data-invalid={error ? true : undefined}>
                <FieldLabel htmlFor="stock">{t("products.newStock")}</FieldLabel>
                <Input id="stock" type="number" min={0} inputMode="numeric" dir="ltr" value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
                {error ? <FieldError>{error}</FieldError> : null}
              </Field>
            </div>
            <SheetFooter>
              <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={adjust.isPending}>
                {t("common.cancel")}
              </Button>
              <Button onClick={submit} disabled={adjust.isPending}>
                {t("common.save")}
              </Button>
            </SheetFooter>
    </>
  )
}

export { StockDialog }
