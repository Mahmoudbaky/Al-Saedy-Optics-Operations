import { PackagePlusIcon, Trash2Icon } from "lucide-react"

import type { PageMeta } from "@/api/types"
import {
  DataTableHead,
  DataTableHeader,
  DataTablePagination,
  DataTableRow,
} from "@/components/shared/data-table"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import type { Product, ProductVariant } from "@/types"

interface ProductsTableProps {
  products: Product[]
  meta: PageMeta | undefined
  busy?: boolean
  lowStockThreshold: number
  selectedIds: ReadonlySet<string>
  onToggle: (id: string, checked: boolean) => void
  onToggleAll: (checked: boolean) => void
  onActiveChange: (product: Product, active: boolean) => void
  onAdjustStock: (product: Product, variant: ProductVariant) => void
  onDelete: (product: Product) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
}

function ColumnHeaders() {
  const { t } = useI18n()
  return (
    <>
      <DataTableHead className="w-[64px]">
        <span className="sr-only">{t("products.col.product")}</span>
      </DataTableHead>
      <DataTableHead>{t("products.col.product")}</DataTableHead>
      <DataTableHead className="w-[120px]">{t("products.col.category")}</DataTableHead>
      <DataTableHead className="w-[110px]">{t("products.col.brand")}</DataTableHead>
      <DataTableHead className="w-[120px] text-end">{t("products.col.price")}</DataTableHead>
      <DataTableHead className="w-[190px]">{t("products.col.colours")}</DataTableHead>
      <DataTableHead className="w-[76px] text-end">{t("products.col.sold")}</DataTableHead>
      <DataTableHead className="w-[150px]">{t("products.col.flags")}</DataTableHead>
      <DataTableHead className="w-[84px] text-center">{t("products.col.active")}</DataTableHead>
      <DataTableHead className="w-12">
        <span className="sr-only">{t("common.actions")}</span>
      </DataTableHead>
    </>
  )
}

function ProductsTable({
  products,
  meta,
  busy = false,
  lowStockThreshold,
  selectedIds,
  onToggle,
  onToggleAll,
  onActiveChange,
  onAdjustStock,
  onDelete,
  onPageChange,
  onPageSizeChange,
}: ProductsTableProps) {
  const { t, n, locale } = useI18n()
  const allSelected = products.length > 0 && products.every((p) => selectedIds.has(p.id))
  const someSelected = !allSelected && products.some((p) => selectedIds.has(p.id))

  return (
    <Card className={cn("gap-0 py-0 transition-opacity", busy && "opacity-60")}>
      <Table>
        <DataTableHeader>
          <TableRow>
            <DataTableHead className="w-10">
              <Checkbox
                aria-label={t("common.selectAll")}
                checked={allSelected}
                indeterminate={someSelected}
                onCheckedChange={onToggleAll}
              />
            </DataTableHead>
            <ColumnHeaders />
          </TableRow>
        </DataTableHeader>
        <TableBody>
          {products.map((product) => {
            const selected = selectedIds.has(product.id)
            return (
              <DataTableRow key={product.id} data-state={selected ? "selected" : undefined} className="h-[60px]">
                <TableCell className="ps-4">
                  <Checkbox
                    aria-label={`${t("common.selectRow")} ${product.name.en}`}
                    checked={selected}
                    onCheckedChange={(checked) => onToggle(product.id, checked)}
                  />
                </TableCell>
                <TableCell>
                  {product.image ? (
                    <img src={product.image} alt="" className="block size-10 rounded-sm border object-cover" />
                  ) : (
                    <span className="block size-10 rounded-sm border bg-muted" aria-hidden="true" />
                  )}
                </TableCell>
                <TableCell className="max-w-0">
                  <div className="flex flex-col gap-0.5">
                    <span className="truncate font-medium">{product.name[locale]}</span>
                    <span className="truncate text-[11px] text-muted-foreground">
                      {product.code ? `${product.code} · ` : ""}
                      <span lang={locale === "ar" ? "en" : "ar"}>{locale === "ar" ? product.name.en : product.name.ar}</span>
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-[13px]">{product.category.name[locale]}</TableCell>
                <TableCell className="text-[13px]">{product.brand?.name[locale] ?? t("common.none")}</TableCell>
                <TableCell className="text-end">
                  <div className="flex flex-col">
                    <span className="font-semibold tabular-nums">{n(product.price)}</span>
                    {product.compareAtPrice ? (
                      <s className="text-[11px] text-muted-foreground/70 tabular-nums">{n(product.compareAtPrice)}</s>
                    ) : null}
                  </div>
                </TableCell>
                <TableCell>
                  <ul className="flex items-center gap-2.5" aria-label={t("products.col.colours")}>
                    {product.variants.map((variant) => {
                      const low = variant.stock <= lowStockThreshold
                      return (
                        <li key={variant.id}>
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <button
                                  type="button"
                                  className={cn("flex items-center gap-1 rounded-sm px-0.5 hover:bg-muted", !variant.isActive && "opacity-40")}
                                  onClick={() => onAdjustStock(product, variant)}
                                  aria-label={t("products.adjustStock")}
                                />
                              }
                            >
                              <span className="size-3.5 rounded-full border" style={{ backgroundColor: variant.colorHex }} aria-hidden="true" />
                              <span className={cn("text-[11px] tabular-nums", low ? "font-semibold text-critical" : "text-muted-foreground")}>
                                {n(variant.stock)}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {variant.colorName?.[locale] ?? variant.colorHex} · {t("products.stockUnits", { n: variant.stock })}
                            </TooltipContent>
                          </Tooltip>
                        </li>
                      )
                    })}
                  </ul>
                </TableCell>
                <TableCell className="text-end tabular-nums">{n(product.soldCount)}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {product.isBestSeller ? <Badge variant="secondary">{t("products.bestSeller")}</Badge> : null}
                    {product.requiresPrescription ? <Badge variant="info">{t("products.rx")}</Badge> : null}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Switch
                    aria-label={`${t("products.col.active")}: ${product.name.en}`}
                    checked={product.isActive}
                    onCheckedChange={(checked) => onActiveChange(product, checked)}
                  />
                </TableCell>
                <TableCell className="pe-3 text-center">
                  <RowActionsMenu>
                    <DropdownMenuGroup>
                      {product.variants[0] ? (
                        <DropdownMenuItem onClick={() => onAdjustStock(product, product.variants[0]!)}>
                          <PackagePlusIcon />
                          {t("products.adjustStock")}
                        </DropdownMenuItem>
                      ) : null}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <DropdownMenuItem variant="destructive" onClick={() => onDelete(product)}>
                        <Trash2Icon />
                        {t("products.delete")}
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </RowActionsMenu>
                </TableCell>
              </DataTableRow>
            )
          })}
        </TableBody>
      </Table>
      {meta ? (
        <DataTablePagination
          from={meta.total === 0 ? 0 : (meta.page - 1) * meta.limit + 1}
          to={Math.min(meta.page * meta.limit, meta.total)}
          total={meta.total}
          page={meta.page}
          pageCount={Math.max(1, meta.pages)}
          pageSize={meta.limit}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
        />
      ) : null}
    </Card>
  )
}

/** Skeleton rows shown while `GET /admin/products` resolves. */
function ProductsTableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card className="gap-0 py-0" aria-busy="true">
      <Table>
        <TableBody>
          {Array.from({ length: rows }, (_, i) => (
            <TableRow key={i} className="h-[60px] hover:bg-transparent">
              <TableCell className="w-10 ps-4">
                <Skeleton className="size-4 rounded-[3px]" />
              </TableCell>
              <TableCell className="w-[64px]">
                <Skeleton className="size-10 rounded-[3px]" />
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-[62%]" />
                  <Skeleton className="h-2.5 w-[38%]" />
                </div>
              </TableCell>
              <TableCell className="w-[120px]">
                <Skeleton className="h-2.5 w-[70%]" />
              </TableCell>
              <TableCell className="w-[110px]">
                <Skeleton className="h-2.5 w-[60%]" />
              </TableCell>
              <TableCell className="w-[120px]">
                <Skeleton className="ms-auto h-2.5 w-[80%]" />
              </TableCell>
              <TableCell className="w-[190px]">
                <div className="flex gap-2">
                  <Skeleton className="size-3.5 rounded-[3px]" />
                  <Skeleton className="size-3.5 rounded-[3px]" />
                  <Skeleton className="size-3.5 rounded-[3px]" />
                </div>
              </TableCell>
              <TableCell className="w-[76px]">
                <Skeleton className="ms-auto h-2.5 w-[50%]" />
              </TableCell>
              <TableCell className="w-[150px]">
                <Skeleton className="h-2.5 w-[72%]" />
              </TableCell>
              <TableCell className="w-[84px]">
                <Skeleton className="mx-auto h-[18px] w-8 rounded-full" />
              </TableCell>
              <TableCell className="w-12" />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

export { ProductsTable, ProductsTableSkeleton }
