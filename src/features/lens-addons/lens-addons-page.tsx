import * as React from "react"
import { PencilIcon, PlusIcon, Trash2Icon, TriangleAlertIcon } from "lucide-react"

import { useApiErrorMessage, useDeleteLensAddon, useLensAddons, useUpdateLensAddon } from "@/api"
import { PageHeader } from "@/components/layout/page-header"
import { DataTableHead, DataTableHeader } from "@/components/shared/data-table"
import { QueryState } from "@/components/shared/query-state"
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
import { useI18n } from "@/lib/i18n"
import type { LensAddon } from "@/types"
import { AddonForm } from "./addon-form"
import { DeleteAddonDialog } from "./delete-addon-dialog"

/** /admin/lens-addons — catalogue pricing with create/edit and a delete confirmation. */
function LensAddonsPage() {
  const { t, n, locale } = useI18n()
  const errorMessage = useApiErrorMessage()
  const addons = useLensAddons()
  const update = useUpdateLensAddon()
  const del = useDeleteLensAddon()
  const [includeInactive, setIncludeInactive] = React.useState(true)
  const [pendingDelete, setPendingDelete] = React.useState<LensAddon | null>(null)
  const [form, setForm] = React.useState<{ kind: "new" } | { kind: "edit"; addon: LensAddon } | null>(null)

  const visible = (addons.data ?? []).filter((a) => includeInactive || a.isActive).sort((a, b) => a.sortOrder - b.sortOrder)

  /** PATCH /admin/lens-addons/:id */
  const setActive = async (addon: LensAddon, isActive: boolean) => {
    try {
      await update.mutateAsync({ id: addon.id, isActive })
    } catch (err) {
      toast.add({ type: "error", title: t("addons.toast.failed", { name: addon.name[locale] }), description: errorMessage(err) })
    }
  }

  /** DELETE /admin/lens-addons/:id */
  const remove = async (addon: LensAddon) => {
    setPendingDelete(null)
    try {
      await del.mutateAsync(addon.id)
      toast.add({ type: "success", title: t("addons.toast.deleted", { name: addon.name[locale] }), description: t("addons.toast.deletedHint") })
    } catch (err) {
      toast.add({ type: "error", title: t("addons.toast.failed", { name: addon.name[locale] }), description: errorMessage(err) })
    }
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
          <Button onClick={() => setForm({ kind: "new" })}>
            <PlusIcon data-icon="inline-start" />
            {t("addons.new")}
          </Button>
        </div>

        <QueryState query={addons} empty={visible.length === 0}>
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
                    {addon.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium">{addon.name.en}</span>
                      <span className="text-[11px] text-muted-foreground">{addon.description?.en}</span>
                    </div>
                  </TableCell>
                  <TableCell dir="rtl" lang="ar" className="text-start">
                    {addon.name.ar}
                  </TableCell>
                  <TableCell className="text-end font-semibold tabular-nums">{n(addon.price)}</TableCell>
                  <TableCell className="text-end text-muted-foreground tabular-nums">{n(addon.sortOrder)}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      aria-label={`${t("addons.col.active")}: ${addon.name.en}`}
                      checked={addon.isActive}
                      disabled={update.isPending}
                      onCheckedChange={(checked) => void setActive(addon, checked)}
                    />
                  </TableCell>
                  <TableCell className="pe-3 text-center">
                    <RowActionsMenu>
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => setForm({ kind: "edit", addon })}>
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
        </QueryState>

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
        onConfirm={(addon) => void remove(addon)}
      />
      <AddonForm mode={form} onOpenChange={(open) => !open && setForm(null)} />
    </>
  )
}

export { LensAddonsPage }
