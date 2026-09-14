import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useI18n } from "@/lib/i18n"
import { cn } from "@/lib/utils"

/** Table header row in the brand's small-caps label style. */
function DataTableHeader({ className, ...props }: React.ComponentProps<typeof TableHeader>) {
  return (
    <TableHeader
      className={cn("bg-muted/60 [&_tr]:hover:bg-transparent", className)}
      {...props}
    />
  )
}

function DataTableHead({ className, ...props }: React.ComponentProps<typeof TableHead>) {
  return (
    <TableHead
      className={cn("label-caps h-9 px-3 text-start font-medium text-muted-foreground first:ps-4 last:pe-4", className)}
      {...props}
    />
  )
}

function DataTableRow({ className, ...props }: React.ComponentProps<typeof TableRow>) {
  return (
    <TableRow
      className={cn("data-[state=selected]:bg-info-soft data-[state=selected]:hover:bg-info-soft", className)}
      {...props}
    />
  )
}

interface DataTablePaginationProps {
  from: number
  to: number
  total: number
  page: number
  pageCount: number
  pageSize: number
  onPageSizeChange?: (size: number) => void
  onPageChange?: (page: number) => void
}

function DataTablePagination({
  from,
  to,
  total,
  page,
  pageCount,
  pageSize,
  onPageSizeChange,
  onPageChange,
}: DataTablePaginationProps) {
  const { t, n } = useI18n()
  return (
    <div className="flex items-center gap-4 bg-muted/60 px-4 py-2.5 text-[13px] text-muted-foreground">
      <span>
        {t("common.rows", { from, to, total })} · {t("common.page", { page, pages: pageCount })}
      </span>
      <div className="ms-auto flex items-center gap-2">
        <span>{t("common.rowsPerPage")}</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange?.(Number(v))}>
          <SelectTrigger size="sm" className="w-[76px] bg-card" aria-label={t("common.rowsPerPage")}>
            <SelectValue>{(v: string) => n(Number(v))}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {[10, 25, 50, 100].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {n(size)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t("common.previous")}
          disabled={page <= 1}
          onClick={() => onPageChange?.(page - 1)}
        >
          <ChevronLeftIcon className="rtl:-scale-x-100" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={t("common.next")}
          disabled={page >= pageCount}
          onClick={() => onPageChange?.(page + 1)}
        >
          <ChevronRightIcon className="rtl:-scale-x-100" />
        </Button>
      </div>
    </div>
  )
}

export { DataTableHeader, DataTableHead, DataTableRow, DataTablePagination }
