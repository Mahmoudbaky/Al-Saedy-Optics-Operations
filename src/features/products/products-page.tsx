import * as React from "react"
import { PlusIcon, SearchIcon } from "lucide-react"
import { useSearchParams } from "react-router"

import { PageHeader } from "@/components/layout/page-header"
import { BulkActionBar } from "@/components/shared/bulk-action-bar"
import { FilterChip } from "@/components/shared/filter-chip"
import { FilterSelect, type FilterOption } from "@/components/shared/filter-select"
import { SubHeading } from "@/components/shared/section-heading"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import { LOW_STOCK_THRESHOLD, products as seed } from "@/data/products"
import { useI18n } from "@/lib/i18n"
import type { FrameShape, Product, ProductCategory, ProductGender } from "@/types"
import { ProductsTable, ProductsTableSkeleton } from "./products-table"

type CategoryFilter = ProductCategory | "any"
type BrandFilter = string
type ShapeFilter = FrameShape | "any"
type GenderFilter = ProductGender | "any"
const SHAPES: FrameShape[] = ["rectangular", "aviator", "square", "round", "none"]
const GENDERS: ProductGender[] = ["men", "women", "unisex", "kids"]
const CATEGORIES: ProductCategory[] = ["eyeglasses", "sunglasses", "contact_lenses", "kids", "reading", "accessories"]

/** GET /admin/products?lowStock=3 — catalogue with bulk actions and a loading state. */
function ProductsPage() {
  const { t } = useI18n()
  const [params, setParams] = useSearchParams()
  const [products, setProducts] = React.useState<Product[]>(seed)
  const [query, setQuery] = React.useState("")
  const [category, setCategory] = React.useState<CategoryFilter>("any")
  const [brand, setBrand] = React.useState<BrandFilter>("any")
  const [shape, setShape] = React.useState<ShapeFilter>("any")
  const [gender, setGender] = React.useState<GenderFilter>("any")
  const [showInactive, setShowInactive] = React.useState(true)
  const [selectedIds, setSelectedIds] = React.useState<ReadonlySet<string>>(new Set())

  const lowStockOnly = params.has("lowStock")
  const setLowStockOnly = (on: boolean) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (on) next.set("lowStock", String(LOW_STOCK_THRESHOLD))
        else next.delete("lowStock")
        return next
      },
      { replace: true }
    )

  const brands = React.useMemo(
    () => [...new Set(products.map((p) => p.brand).filter((b): b is string => b !== null))].sort(),
    [products]
  )

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return products.filter((p) => {
      if (!showInactive && !p.isActive) return false
      if (category !== "any" && p.category !== category) return false
      if (brand !== "any" && p.brand !== brand) return false
      if (shape !== "any" && p.shape !== shape) return false
      if (gender !== "any" && p.gender !== gender) return false
      if (lowStockOnly && !p.colours.some((c) => c.stock <= LOW_STOCK_THRESHOLD)) return false
      if (q && !`${p.name} ${p.nameAr} ${p.modelCode}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [products, query, category, brand, shape, gender, showInactive, lowStockOnly])

  const categoryOptions: FilterOption<CategoryFilter>[] = [
    { value: "any", label: t("common.any") },
    ...CATEGORIES.map((c) => ({ value: c, label: t(`category.${c}`) })),
  ]
  const brandOptions: FilterOption<BrandFilter>[] = [
    { value: "any", label: t("common.any") },
    ...brands.map((b) => ({ value: b, label: b })),
  ]

  const shapeOptions: FilterOption<ShapeFilter>[] = [
    { value: "any", label: t("common.any") },
    ...SHAPES.map((v) => ({ value: v, label: t(`shape.${v}`) })),
  ]
  const genderOptions: FilterOption<GenderFilter>[] = [
    { value: "any", label: t("common.any") },
    ...GENDERS.map((v) => ({ value: v, label: t(`gender.${v}`) })),
  ]

  const setActive = (product: Product, isActive: boolean) => {
    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isActive } : p)))
    toast.add({
      type: "success",
      title: t("products.toast.activated", {
        name: product.name,
        state: isActive ? t("products.stateActive") : t("products.stateInactive"),
      }),
    })
  }

  /** POST /admin/products/bulk */
  const bulk = (patch: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (selectedIds.has(p.id) ? { ...p, ...patch } : p)))
    setSelectedIds(new Set())
  }
  const bulkDelete = () => {
    setProducts((prev) => prev.filter((p) => !selectedIds.has(p.id)))
    setSelectedIds(new Set())
  }

  return (
    <>
      <PageHeader title={t("products.title")} endpoint="/api/v1/admin/products" />
      <div className="flex flex-col gap-4 p-4 md:px-6 md:py-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <InputGroup className="w-full bg-card sm:w-[260px]">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput
              placeholder={t("products.search")}
              aria-label={t("products.search")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </InputGroup>
          <FilterSelect label={t("products.filter.category")} value={category} options={categoryOptions} onChange={setCategory} />
          <FilterSelect label={t("products.filter.brand")} value={brand} options={brandOptions} onChange={setBrand} />
          <FilterSelect label={t("products.filter.shape")} value={shape} options={shapeOptions} onChange={setShape} />
          <FilterSelect label={t("products.filter.gender")} value={gender} options={genderOptions} onChange={setGender} />
          {lowStockOnly ? (
            <FilterChip tone="critical" onRemove={() => setLowStockOnly(false)} removeLabel={t("common.clear")}>
              {t("products.lowStock", { n: LOW_STOCK_THRESHOLD })}
            </FilterChip>
          ) : null}
          <Field orientation="horizontal" className="w-auto gap-2">
            <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
            <FieldLabel htmlFor="show-inactive" className="text-[13px] font-normal">
              {t("products.showInactive")}
            </FieldLabel>
          </Field>
          <div className="ms-auto flex gap-2">
            <Button variant="outline">{t("products.importCsv")}</Button>
            <Button>
              <PlusIcon data-icon="inline-start" />
              {t("products.new")}
            </Button>
          </div>
        </div>

        {selectedIds.size > 0 ? (
          <BulkActionBar
            summary={t("products.selected", { n: selectedIds.size })}
            endpoint="POST /admin/products/bulk"
          >
            <Button variant="outline" onClick={() => bulk({ isActive: true })}>
              {t("products.activate")}
            </Button>
            <Button variant="outline" onClick={() => bulk({ isActive: false })}>
              {t("products.deactivate")}
            </Button>
            <Button variant="outline" onClick={() => bulk({ isBestSeller: true })}>
              {t("products.markBestSeller")}
            </Button>
            <Button variant="destructive" onClick={bulkDelete}>
              {t("products.delete")}
            </Button>
          </BulkActionBar>
        ) : null}

        <ProductsTable
          products={visible}
          selectedIds={selectedIds}
          onToggle={(id, checked) =>
            setSelectedIds((prev) => {
              const next = new Set(prev)
              if (checked) next.add(id)
              else next.delete(id)
              return next
            })
          }
          onToggleAll={(checked) => setSelectedIds(checked ? new Set(visible.map((p) => p.id)) : new Set())}
          onActiveChange={setActive}
        />

        <section className="flex flex-col gap-2.5">
          <SubHeading>{t("products.loading")}</SubHeading>
          <ProductsTableSkeleton />
        </section>
      </div>
    </>
  )
}

export { ProductsPage }
