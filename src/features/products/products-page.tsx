import * as React from "react"
import { SearchIcon, Trash2Icon } from "lucide-react"
import { useSearchParams } from "react-router"

import {
  useApiErrorMessage,
  useBrands,
  useBulkProductAction,
  useCategories,
  useDashboardOverview,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
  type BulkProductAction,
  type ProductListQuery,
} from "@/api"
import { PageHeader } from "@/components/layout/page-header"
import { BulkActionBar } from "@/components/shared/bulk-action-bar"
import { FilterChip } from "@/components/shared/filter-chip"
import { FilterSelect, type FilterOption } from "@/components/shared/filter-select"
import { QueryState } from "@/components/shared/query-state"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/toast"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useI18n } from "@/lib/i18n"
import { FRAME_SHAPES, GENDERS, type FrameShape, type Product, type ProductGender, type ProductVariant } from "@/types"
import { ProductsTable, ProductsTableSkeleton } from "./products-table"
import { StockDialog } from "./stock-dialog"

type ShapeFilter = FrameShape | "any"
type GenderFilter = ProductGender | "any"
const DEFAULT_LOW_STOCK = 3

/** GET /admin/products — server-side filters, pagination, bulk actions, stock adjustments. */
function ProductsPage() {
  const { t, locale } = useI18n()
  const errorMessage = useApiErrorMessage()
  const [params, setParams] = useSearchParams()
  const [query, setQueryState] = React.useState("")
  const search = useDebouncedValue(query.trim(), 300)
  const [category, setCategoryState] = React.useState("any")
  const [brand, setBrandState] = React.useState("any")
  const [shape, setShapeState] = React.useState<ShapeFilter>("any")
  const [gender, setGenderState] = React.useState<GenderFilter>("any")
  const [showInactive, setShowInactiveState] = React.useState(true)
  const [page, setPage] = React.useState(1)
  const [pageSize, setPageSizeState] = React.useState(25)
  const [selectedIds, setSelectedIds] = React.useState<ReadonlySet<string>>(new Set())
  const [stockTarget, setStockTarget] = React.useState<{ product: Product; variant: ProductVariant } | null>(null)
  const [deleteTarget, setDeleteTarget] = React.useState<Product[] | null>(null)

  const overview = useDashboardOverview()
  const lowStockThreshold = overview.data?.catalog.lowStockThreshold ?? DEFAULT_LOW_STOCK
  const lowStockOnly = params.has("lowStock")
  const setLowStockOnly = (on: boolean) => {
    setPage(1)
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (on) next.set("lowStock", String(lowStockThreshold))
        else next.delete("lowStock")
        return next
      },
      { replace: true }
    )
  }

  // Any filter change restarts pagination.
  const resetting = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v)
    setPage(1)
  }

  const setQuery = resetting(setQueryState)
  const setCategory = resetting(setCategoryState)
  const setBrand = resetting(setBrandState)
  const setShape = resetting(setShapeState)
  const setGender = resetting(setGenderState)
  const setShowInactive = resetting(setShowInactiveState)
  const setPageSize = resetting(setPageSizeState)

  const listQuery: ProductListQuery = {
    search: search || undefined,
    category: category === "any" ? undefined : category,
    brand: brand === "any" ? undefined : brand,
    shape: shape === "any" ? undefined : shape,
    gender: gender === "any" ? undefined : gender,
    includeInactive: showInactive,
    lowStock: lowStockOnly ? Number(params.get("lowStock")) || lowStockThreshold : undefined,
    page,
    limit: pageSize,
  }
  const products = useProducts(listQuery)
  const rows = products.data?.data ?? []
  const categories = useCategories()
  const brands = useBrands()
  const update = useUpdateProduct()
  const bulk = useBulkProductAction()
  const remove = useDeleteProduct()

  const categoryOptions: FilterOption<string>[] = [
    { value: "any", label: t("common.any") },
    ...(categories.data ?? []).map((c) => ({ value: c.slug, label: c.name[locale] })),
  ]
  const brandOptions: FilterOption<string>[] = [
    { value: "any", label: t("common.any") },
    ...(brands.data ?? []).map((b) => ({ value: b.slug, label: b.name[locale] })),
  ]
  const shapeOptions: FilterOption<ShapeFilter>[] = [{ value: "any", label: t("common.any") }, ...FRAME_SHAPES.map((v) => ({ value: v, label: t(`shape.${v}`) }))]
  const genderOptions: FilterOption<GenderFilter>[] = [{ value: "any", label: t("common.any") }, ...GENDERS.map((v) => ({ value: v, label: t(`gender.${v}`) }))]

  /** PATCH /admin/products/:id */
  const setActive = async (product: Product, isActive: boolean) => {
    try {
      await update.mutateAsync({ id: product.id, isActive })
      toast.add({
        type: "success",
        title: t("products.toast.activated", { name: product.name[locale], state: isActive ? t("products.stateActive") : t("products.stateInactive") }),
      })
    } catch (err) {
      toast.add({ type: "error", title: t("products.toast.failed", { name: product.name[locale] }), description: errorMessage(err) })
    }
  }

  /** POST /admin/products/bulk */
  const runBulk = async (action: BulkProductAction, ids: string[]) => {
    try {
      const { affected } = await bulk.mutateAsync({ ids, action })
      setSelectedIds(new Set())
      toast.add({ type: "success", title: t("products.bulkDone", { n: affected }) })
    } catch (err) {
      toast.add({ type: "error", title: t("error.unknown"), description: errorMessage(err) })
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    const targets = deleteTarget
    setDeleteTarget(null)
    if (targets.length === 1) {
      try {
        await remove.mutateAsync(targets[0]!.id)
        toast.add({ type: "success", title: t("products.bulkDone", { n: 1 }) })
      } catch (err) {
        toast.add({ type: "error", title: t("products.toast.failed", { name: targets[0]!.name[locale] }), description: errorMessage(err) })
      }
    } else {
      await runBulk("delete", targets.map((p) => p.id))
    }
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
            <InputGroupInput placeholder={t("products.search")} aria-label={t("products.search")} value={query} onChange={(e) => setQuery(e.target.value)} />
          </InputGroup>
          <FilterSelect label={t("products.filter.category")} value={category} options={categoryOptions} onChange={setCategory} />
          <FilterSelect label={t("products.filter.brand")} value={brand} options={brandOptions} onChange={setBrand} />
          <FilterSelect label={t("products.filter.shape")} value={shape} options={shapeOptions} onChange={setShape} />
          <FilterSelect label={t("products.filter.gender")} value={gender} options={genderOptions} onChange={setGender} />
          {lowStockOnly ? (
            <FilterChip tone="critical" onRemove={() => setLowStockOnly(false)} removeLabel={t("common.clear")}>
              {t("products.lowStock", { n: lowStockThreshold })}
            </FilterChip>
          ) : null}
          <Field orientation="horizontal" className="w-auto gap-2">
            <Switch id="show-inactive" checked={showInactive} onCheckedChange={setShowInactive} />
            <FieldLabel htmlFor="show-inactive" className="text-[13px] font-normal">
              {t("products.showInactive")}
            </FieldLabel>
          </Field>
        </div>

        {selectedIds.size > 0 ? (
          <BulkActionBar summary={t("products.selected", { n: selectedIds.size })} endpoint="POST /admin/products/bulk">
            <Button variant="outline" disabled={bulk.isPending} onClick={() => runBulk("activate", [...selectedIds])}>
              {t("products.activate")}
            </Button>
            <Button variant="outline" disabled={bulk.isPending} onClick={() => runBulk("deactivate", [...selectedIds])}>
              {t("products.deactivate")}
            </Button>
            <Button variant="outline" disabled={bulk.isPending} onClick={() => runBulk("markBestSeller", [...selectedIds])}>
              {t("products.markBestSeller")}
            </Button>
            <Button variant="destructive" disabled={bulk.isPending} onClick={() => setDeleteTarget(rows.filter((p) => selectedIds.has(p.id)))}>
              {t("products.delete")}
            </Button>
          </BulkActionBar>
        ) : null}

        <QueryState query={products} empty={rows.length === 0} skeleton={<ProductsTableSkeleton rows={6} />}>
          <ProductsTable
            products={rows}
            meta={products.data?.meta}
            busy={products.isFetching}
            lowStockThreshold={lowStockThreshold}
            selectedIds={selectedIds}
            onToggle={(id, checked) =>
              setSelectedIds((prev) => {
                const next = new Set(prev)
                if (checked) next.add(id)
                else next.delete(id)
                return next
              })
            }
            onToggleAll={(checked) => setSelectedIds(checked ? new Set(rows.map((p) => p.id)) : new Set())}
            onActiveChange={setActive}
            onAdjustStock={(product, variant) => setStockTarget({ product, variant })}
            onDelete={(product) => setDeleteTarget([product])}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </QueryState>
      </div>

      <StockDialog target={stockTarget} onOpenChange={(open) => !open && setStockTarget(null)} />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="sm:max-w-[480px]">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-critical-soft text-critical">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-lg font-bold">{t("products.deleteConfirm", { n: deleteTarget?.length ?? 0 })}</AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">{t("products.deleteConfirmHint")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="ghost" size="lg">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" size="lg" onClick={() => void confirmDelete()}>
              {t("products.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export { ProductsPage }
