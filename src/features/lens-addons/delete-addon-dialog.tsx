import { Trash2Icon } from "lucide-react"

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
import { useI18n } from "@/lib/i18n"
import type { LensAddon } from "@/types"

interface DeleteAddonDialogProps {
  addon: LensAddon | null
  onOpenChange: (open: boolean) => void
  onConfirm: (addon: LensAddon) => void
}

/** DELETE /admin/lens-addons/:id — destructive, so it asks first. */
function DeleteAddonDialog({ addon, onOpenChange, onConfirm }: DeleteAddonDialogProps) {
  const { t } = useI18n()
  return (
    <AlertDialog open={addon !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[480px]">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-critical-soft text-critical">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle className="text-lg font-bold">
            {t("addons.deleteTitle", { name: addon?.nameEn ?? "" })}
          </AlertDialogTitle>
          <AlertDialogDescription className="leading-relaxed">
            {t("addons.deleteBody", { n: addon?.pastOrdersCount ?? 0 })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="ghost" size="lg">
            {t("addons.keep")}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            size="lg"
            onClick={() => {
              if (addon) onConfirm(addon)
            }}
          >
            {t("addons.confirmDelete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export { DeleteAddonDialog }
