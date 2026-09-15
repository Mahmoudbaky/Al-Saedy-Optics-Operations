import * as React from "react"
import { FileImageIcon, InfoIcon } from "lucide-react"

import { SubHeading } from "@/components/shared/section-heading"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { useI18n } from "@/lib/i18n"
import type { Prescription } from "@/types"

/** The uploaded scan (uploadthing `prescriptionImage`) with viewer controls. */
function ScanPreview({ prescription }: { prescription: Prescription }) {
  const { t } = useI18n()
  const url = prescription.imageUrl
  const [zoom, setZoom] = React.useState(1)
  const [rotation, setRotation] = React.useState(0)
  const isPdf = url ? /\.pdf(\?|$)/i.test(url) : false

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3.5">
      <SubHeading>{t("rx.uploadedTitle")}</SubHeading>
      {url && !isPdf ? (
        <div className="flex flex-1 flex-col gap-3">
          <div className="flex min-h-[320px] flex-1 items-center justify-center overflow-auto rounded-lg border bg-muted/40 p-3">
            <img
              src={url}
              alt={t("rx.uploadedTitle")}
              className="max-h-[520px] max-w-full transition-transform"
              style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setZoom((z) => (z >= 2 ? 1 : z + 0.5))}>
              {t("rx.zoom")}
            </Button>
            <Button variant="outline" onClick={() => setRotation((r) => (r + 90) % 360)}>
              {t("rx.rotate")}
            </Button>
            <Button variant="ghost" render={<a href={url} target="_blank" rel="noreferrer" />}>
              {t("rx.openOriginal")}
            </Button>
          </div>
        </div>
      ) : (
        <Empty className="flex-1 border border-dashed border-input bg-card text-muted-foreground/70">
          <EmptyHeader>
            <EmptyMedia>
              <FileImageIcon className="size-8" aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="font-sans text-sm font-normal text-muted-foreground">{url ? t("rx.scanPreview") : t("rx.noScan")}</EmptyTitle>
          </EmptyHeader>
          {url ? (
            <Button variant="outline" render={<a href={url} target="_blank" rel="noreferrer" />}>
              {t("rx.scanOpen")}
            </Button>
          ) : null}
        </Empty>
      )}
      {url ? (
        <Alert className="border-info-soft bg-info-soft text-foreground">
          <InfoIcon className="text-info" />
          <AlertDescription className="text-[13px] leading-relaxed text-foreground/85">{t("rx.readFromScan")}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  )
}

export { ScanPreview }
