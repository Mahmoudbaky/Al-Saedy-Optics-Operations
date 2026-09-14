import * as React from "react"
import { PencilIcon, PlusIcon, Trash2Icon, TriangleAlertIcon } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { DataTableHead, DataTableHeader } from "@/components/shared/data-table"
import { RowActionsMenu } from "@/components/shared/row-actions-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/toast"
import { lensAddons as seed } from "@/data/lens-addons"
import { useI18n } from "@/lib/i18n"
import type { LensAddon } from "@/types"
import { DeleteAddonDialog } from "./delete-addon-dialog"

/** /admin/lens-addons — catalogue pricing with a delete confirmation. */
function LensAddonsPage() {
  const { t, n } = useI18n()
  const [addons, setAddons] = React.useState<LensAddon[]>(seed)
  const [includeInactive, setIncludeInactive] = React.useState(true)
  const [pendingDelete, setPendingDelete] = React.useState<LensAddon | null>(null)

  const visible = addons
    .filter((a) => includeInactive || a.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const setActive = (addon: LensAddon, isActive: boolean) =>
    setAddons((prev) => prev.map((a) => (a.id === addon.id ? { ...a, isActive } : a)))

  const remove = (addon: LensAddon) => {
    setAddons((prev) => prev.filter((a) => a.id !== addon.id))
    setPendingDelete(null)
    toast.add({
      type: "success",
      title: t("addons.toast.deleted", { name: addon.nameEn }),
      description: t("addons.toast.deletedHint"),
    })
  }

  return (
    <>
      <PageHeader title={t("addons.title")} endpoint="/api/v1/admin/lens-addons" />
      <div className="flex flex-col gap-4 p-4 md:px-6 md:py-5">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h2 className="font-heading text-lg font-semibold">{t("addons.catalogue")}</h2>
            <p className="text-[13px] text-muted-foreground">{t("addons.catalogueHint")}</p>
          </div>
          <Field orientation="horizontal" className="w-auto gap-2">
            <Switch id="include-inactive" checked={includeInactive} onCheckedChange={setIncludeInactive} />
            <FieldLabel htmlFor="include-inactive" className="text-[13px] font-normal">
              {t("addons.includeInactive")}
            </FieldLabel>
          </Field>
          <Button>
            <PlusIcon data-icon="inline-start" />
            {t("addons.new")}
          </Button>
        </div>

        <Card className="max-w-[1200px] gap-0 py-0">
          <Table>
            <DataTableHeader>
              <TableRow>
                <DataTableHead className="w-[150px]">{t("addons.col.key")}</DataTableHead>
                <DataTableHead>{t("addons.col.nameEn")}</DataTableHead>
                <DataTableHead>{t("addons.col.nameAr")}</DataTableHead>
                <DataTableHead className="w-[130px] text-end">{t("addons.col.price")}</DataTableHead>
                <DataTableHead className="w-[70px] text-end">{t("addons.col.sort")}</DataTableHead>
                <DataTableHead className="w-[90px] text-center">{t("addons.col.active")}</DataTableHead>
                <DataTableHead className="w-12">
                  <span className="sr-only">{t("common.actions")}</span>
                </DataTableHead>
              </TableRow>
            </DataTableHeader>
            <TableBody>
              {visible.map((addon) => (
                <TableRow key={addon.id} className="h-[58px]">
                  <TableCell className="ps-4 font-mono text-[13px] text-muted-foreground" dir="ltr">
                    {addon.key}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{addon.nameEn}</span>
                      <span className="text-[11px] text-muted-foreground">{addon.descriptionEn}</span>
                    </div>
                  </TableCell>
                  <TableCell dir="rtl" lang="ar" className="text-start">
                    {addon.nameAr}
                  </TableCell>
                  <TableCell className="text-end font-semibold tabular-nums">{n(addon.price)}</TableCell>
                  <TableCell className="text-end text-muted-foreground tabular-nums">{n(addon.sortOrder)}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      aria-label={`${t("addons.col.active")}: ${addon.nameEn}`}
                      checked={addon.isActive}
                      onCheckedChange={(checked) => setActive(addon, checked)}
                    />
                  </TableCell>
                  <TableCell className="pe-3 text-center">
                    <RowActionsMenu>
                      <DropdownMenuGroup>
                        <DropdownMenuItem>
                          <PencilIcon />
                          {t("addons.edit")}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem variant="destructive" onClick={() => setPendingDelete(addon)}>
                          <Trash2Icon />
                          {t("addons.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </RowActionsMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Alert className="max-w-[1200px] border-warning-soft bg-warning-soft">
          <TriangleAlertIcon className="text-warning" />
          <AlertDescription className="text-[13px] leading-relaxed text-foreground/85">
            {t("addons.warning")}
          </AlertDescription>
        </Alert>
      </div>

      <DeleteAddonDialog
        addon={pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null)
        }}
        onConfirm={remove}
      />
    </>
  )
}

export { LensAddonsPage }
