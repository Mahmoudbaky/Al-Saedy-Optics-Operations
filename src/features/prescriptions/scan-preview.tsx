import { FileImageIcon, InfoIcon } from "lucide-react"

import { SubHeading } from "@/components/shared/section-heading"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { useI18n } from "@/lib/i18n"
import type { Prescription } from "@/types"

/** The uploaded scan (uploadthing `prescriptionImage`) with viewer controls. */
function ScanPreview({ prescription }: { prescription: Prescription }) {
  const { t, n } = useI18n()
  const hasScan = prescription.imageFileName !== null

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3.5">
      <SubHeading>{t("rx.uploadedTitle")}</SubHeading>
      <Empty className="flex-1 border border-dashed border-input bg-card text-muted-foreground/70">
        <EmptyHeader>
          <EmptyMedia>
            <FileImageIcon className="size-8" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle className="font-sans text-sm font-normal text-muted-foreground">
            {hasScan ? t("rx.scanPreview") : t("rx.noScan")}
          </EmptyTitle>
          {hasScan ? (
            <EmptyDescription className="text-[13px]">
              {prescription.imageFileName} · {n(prescription.imageSizeMb ?? 0, { maximumFractionDigits: 1 })} MB
            </EmptyDescription>
          ) : null}
        </EmptyHeader>
        {hasScan ? (
          <div className="flex gap-2">
            <Button variant="outline">{t("rx.zoom")}</Button>
            <Button variant="outline">{t("rx.rotate")}</Button>
            <Button variant="ghost">{t("rx.openOriginal")}</Button>
          </div>
        ) : null}
      </Empty>
      {hasScan ? (
        <Alert className="border-info-soft bg-info-soft text-foreground">
          <InfoIcon className="text-info" />
          <AlertDescription className="text-[13px] leading-relaxed text-foreground/85">
            {t("rx.readFromScan")}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}

export { ScanPreview }
