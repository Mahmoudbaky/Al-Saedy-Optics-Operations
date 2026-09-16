import * as React from "react"
import { useDropzone } from "@uploadthing/react"
import { ChevronDownIcon, ChevronUpIcon, ImagePlusIcon, Trash2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/shared/spinner"
import { useI18n } from "@/lib/i18n"
import { useUploadThing, type UploadedImage } from "@/lib/uploadthing"
import { cn } from "@/lib/utils"
import { FormSection, FormSelect } from "./form-primitives"
import type { ImageRow, VariantRow } from "./product-form-state"

const MAX_FILES = 8
const ACCEPT = { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }

interface ImagesSectionProps {
  images: ImageRow[]
  variants: VariantRow[]
  /** Called with the stored URLs once UploadThing has them. */
  onUploaded: (urls: string[]) => void
  onChange: (image: ImageRow, patch: Partial<ImageRow>) => void
  onRemove: (image: ImageRow) => void
  onMove: (image: ImageRow, direction: -1 | 1) => void
  /** A server round-trip for images is in flight (edit mode). */
  busy?: boolean
  onError: (message: string) => void
}

/** UploadThing `productImage` dropzone + ordered thumbnails with alt text and colour link. */
export function ImagesSection({ images, variants, onUploaded, onChange, onRemove, onMove, busy = false, onError }: ImagesSectionProps) {
  const { t, n, locale } = useI18n()
  const [pending, setPending] = React.useState(0)

  const { startUpload, isUploading } = useUploadThing("productImage", {
    onUploadError: (err) => onError(err.message || t("pf.uploadFailed")),
  })

  const onDrop = React.useCallback(
    async (files: File[]) => {
      const room = MAX_FILES - images.length
      const batch = files.slice(0, Math.max(0, room))
      if (!batch.length) return
      setPending(batch.length)
      try {
        const result = await startUpload(batch)
        const urls = (result ?? []).map((f) => (f.serverData as UploadedImage | null)?.url ?? f.ufsUrl).filter(Boolean)
        if (urls.length) onUploaded(urls)
      } catch (err) {
        onError(err instanceof Error ? err.message : t("pf.uploadFailed"))
      } finally {
        setPending(0)
      }
    },
    [images.length, startUpload, onUploaded, onError, t]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxSize: 4 * 1024 * 1024,
    multiple: true,
    disabled: isUploading || busy || images.length >= MAX_FILES,
  })

  const colourOptions = [
    { value: "", label: t("pf.imageAnyColour") },
    ...variants.filter((v) => /^#[0-9a-fA-F]{6}$/.test(v.colorHex)).map((v) => ({ value: v.colorHex.toUpperCase(), label: v[locale === "ar" ? "colorAr" : "colorEn"] || v.colorHex.toUpperCase() })),
  ]

  return (
    <FormSection title={t("pf.images")} api={t("pf.imagesApi")}>
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/40 px-4 py-6 text-center transition-colors",
          isDragActive && "border-secondary bg-info-soft",
          (isUploading || busy || images.length >= MAX_FILES) && "cursor-not-allowed opacity-60"
        )}
      >
        <input {...getInputProps()} />
        {isUploading ? <Spinner /> : <ImagePlusIcon className="size-6 text-muted-foreground" aria-hidden="true" />}
        <span className="text-sm font-medium">{isUploading ? t("pf.uploading", { n: pending }) : t("pf.dropzone")}</span>
        <span className="text-[11px] text-muted-foreground">{t("pf.dropzoneHint")}</span>
      </div>

      {images.length ? (
        <ul className="flex flex-col gap-2.5">
          {images.map((image, i) => (
            <li key={image.key} className="flex items-start gap-3 rounded-lg border p-2">
              <div className="relative shrink-0">
                <img src={image.url} alt={image.alt} className="size-16 rounded-md border object-cover" />
                {i === 0 ? <span className="absolute -start-1 -top-1 rounded-sm bg-secondary px-1.5 text-[10px] font-semibold text-secondary-foreground">{t("pf.cover")}</span> : null}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Input value={image.alt} placeholder={t("pf.imageAlt")} aria-label={t("pf.imageAlt")} onChange={(e) => onChange(image, { alt: e.target.value })} className="h-8" />
                <FormSelect id={`image-colour-${image.key}`} value={image.variantColorHex} onChange={(v) => onChange(image, { variantColorHex: v })} options={colourOptions} />
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <Button variant="ghost" size="icon-sm" aria-label={t("pf.moveUp")} disabled={i === 0 || busy} onClick={() => onMove(image, -1)}>
                  <ChevronUpIcon />
                </Button>
                <Button variant="ghost" size="icon-sm" aria-label={t("pf.moveDown")} disabled={i === images.length - 1 || busy} onClick={() => onMove(image, 1)}>
                  <ChevronDownIcon />
                </Button>
                <Button variant="ghost" size="icon-sm" className="text-destructive" aria-label={t("pf.removeImage")} disabled={busy} onClick={() => onRemove(image)}>
                  <Trash2Icon />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="text-[11px] text-muted-foreground">{`${n(images.length)} / ${n(MAX_FILES)}`}</p>
    </FormSection>
  )
}
