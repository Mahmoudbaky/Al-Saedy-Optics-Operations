import * as React from "react"
import { CheckIcon, ChevronLeftIcon, Trash2Icon } from "lucide-react"
import { Link, useBlocker, useNavigate, useParams } from "react-router"

import {
  ApiError,
  useAddImages,
  useAddVariant,
  useApiErrorMessage,
  useBrands,
  useCategories,
  useCreateProduct,
  useDeleteImage,
  useDeleteProduct,
  useDeleteVariant,
  useProductDetail,
  useReorderImages,
  useUpdateProduct,
  useUpdateVariant,
  type Product,
} from "@/api"
import { LanguageToggle } from "@/components/layout/language-toggle"
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
import { Card, CardContent } from "@/components/ui/card"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { toast } from "@/components/ui/toast"
import { useI18n, type MessageKey } from "@/lib/i18n"
import { ImagesSection } from "./form/images-section"
import {
  emptyValues,
  imageToInput,
  newKey,
  toCreateInput,
  toPatch,
  validate,
  valuesFromProduct,
  variantToInput,
  type FormErrors,
  type ImageRow,
  type ProductFormValues,
} from "./form/product-form-state"
import { ClassificationSection, IdentitySection, PricingSection, VariantsSection } from "./form/sections"
import { StatusSection } from "./form/status-section"

/** Route entry: `/products/new` and `/products/:id/edit` share the form; edit waits for the product. */
function ProductFormPage() {
  const { id } = useParams<{ id: string }>()
  const product = useProductDetail(id)
  if (!id) return <ProductForm key="new" />
  return (
    <QueryState query={product} skeleton={<div className="p-6 text-sm text-muted-foreground">…</div>}>
      {product.data ? <ProductForm key={product.data.id} product={product.data} /> : null}
    </QueryState>
  )
}

function ProductForm({ product }: { product?: Product }) {
  const { t, locale } = useI18n()
  const navigate = useNavigate()
  const errorMessage = useApiErrorMessage()
  const categories = useCategories()
  const brands = useBrands()

  const [values, setValues] = React.useState<ProductFormValues>(() => (product ? valuesFromProduct(product) : emptyValues()))
  const [initial, setInitial] = React.useState(values)
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [formError, setFormError] = React.useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = React.useState(false)
  const dirty = JSON.stringify(values) !== JSON.stringify(initial)

  const set = React.useCallback(<K extends keyof ProductFormValues>(field: K, value: ProductFormValues[K]) => setValues((v) => ({ ...v, [field]: value })), [])

  // Warn before losing edits – in-app navigation via the router, tab close via beforeunload.
  const blocker = useBlocker(dirty)
  React.useEffect(() => {
    if (!dirty) return
    const handler = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [dirty])

  const create = useCreateProduct()
  const update = useUpdateProduct()
  const addVariant = useAddVariant()
  const updateVariant = useUpdateVariant()
  const deleteVariant = useDeleteVariant()
  const addImages = useAddImages()
  const deleteImage = useDeleteImage()
  const reorderImages = useReorderImages()
  const deleteProduct = useDeleteProduct()
  const saving = create.isPending || update.isPending || addVariant.isPending || updateVariant.isPending || deleteVariant.isPending
  const imagesBusy = addImages.isPending || deleteImage.isPending || reorderImages.isPending

  const localizedErrors = React.useMemo(
    () => Object.fromEntries(Object.entries(errors).map(([k, v]) => [k, v && (v.startsWith("pf.") ? t(v as MessageKey) : v)])),
    [errors, t]
  )

  const fail = (err: unknown) => {
    if (ApiError.is(err, "VALIDATION_ERROR")) setErrors((prev) => ({ ...prev, ...err.fieldErrors() }))
    setFormError(errorMessage(err))
    toast.add({ type: "error", title: t("pf.failed"), description: errorMessage(err) })
  }

  /* ── create ─────────────────────────────────────────────────────── */
  const submitCreate = async (asDraft: boolean) => {
    const next = { ...values, isActive: asDraft ? false : values.isActive }
    const v = validate(next)
    setErrors(v)
    setFormError(null)
    if (Object.keys(v).length) return
    try {
      const created = await create.mutateAsync(toCreateInput(next))
      setInitial(next)
      setValues(next)
      toast.add({ type: "success", title: t("pf.created"), description: created.name[locale] })
      navigate(`/products/${created.id}/edit`, { replace: true })
    } catch (err) {
      fail(err)
    }
  }

  /* ── edit ───────────────────────────────────────────────────────── */
  const syncImages = (p: Product) => {
    const next = valuesFromProduct(p).images
    setValues((v) => ({ ...v, images: next }))
    setInitial((v) => ({ ...v, images: next }))
  }

  const submitEdit = async () => {
    if (!product) return
    const v = validate(values)
    setErrors(v)
    setFormError(null)
    if (Object.keys(v).length) return
    try {
      let latest = await update.mutateAsync({ id: product.id, ...toPatch(values) })

      // Variants: diff local rows against what the server has.
      const serverIds = new Set(latest.variants.map((x) => x.id))
      const keep = new Set(values.variants.map((r) => r.id).filter(Boolean))
      for (const [i, row] of values.variants.entries()) {
        const input = variantToInput(row, i)
        if (!row.id) {
          latest = await addVariant.mutateAsync({ productId: product.id, ...input })
        } else if (serverIds.has(row.id)) {
          const before = latest.variants.find((x) => x.id === row.id)!
          const changed =
            before.colorHex !== input.colorHex ||
            (before.colorName?.en ?? null) !== (input.colorName?.en ?? null) ||
            (before.colorName?.ar ?? null) !== (input.colorName?.ar ?? null) ||
            (before.sku ?? null) !== input.sku ||
            before.stock !== input.stock ||
            before.sortOrder !== input.sortOrder ||
            before.isActive !== input.isActive
          if (changed) latest = await updateVariant.mutateAsync({ productId: product.id, variantId: row.id, ...input })
        }
      }
      for (const variant of latest.variants) {
        if (!keep.has(variant.id)) latest = await deleteVariant.mutateAsync({ productId: product.id, variantId: variant.id })
      }

      // Images: alt / colour edits have no PATCH route – re-add the image, then restore the order.
      const initialById = new Map(initial.images.map((img) => [img.id, img]))
      const edited = values.images.filter((img) => img.id && (initialById.get(img.id)?.alt !== img.alt || initialById.get(img.id)?.variantColorHex !== img.variantColorHex))
      if (edited.length) {
        for (const img of edited) latest = await deleteImage.mutateAsync({ productId: product.id, imageId: img.id! })
        latest = await addImages.mutateAsync({ productId: product.id, images: edited.map((img) => imageToInput(img, values.images.findIndex((x) => x.key === img.key))) })
        const byUrl = new Map(latest.images.map((img) => [img.url, img.id]))
        latest = await reorderImages.mutateAsync({ productId: product.id, imageIds: values.images.map((img) => byUrl.get(img.url)!).filter(Boolean) })
      }

      const synced = valuesFromProduct(latest)
      setValues(synced)
      setInitial(synced)
      toast.add({ type: "success", title: t("pf.saved") })
    } catch (err) {
      fail(err)
    }
  }

  /* ── images (uploaded through UploadThing before we get here) ─── */
  const onUploaded = async (urls: string[]) => {
    const start = values.images.length
    if (!product) {
      set("images", [...values.images, ...urls.map((url) => ({ key: newKey(), url, alt: "", variantColorHex: "" }))])
      return
    }
    try {
      const p = await addImages.mutateAsync({ productId: product.id, images: urls.map((url, i) => ({ url, sortOrder: start + i })) })
      syncImages(p)
      toast.add({ type: "success", title: t("pf.imageAdded") })
    } catch (err) {
      toast.add({ type: "error", title: t("pf.uploadFailed"), description: errorMessage(err) })
    }
  }
  const onRemoveImage = async (image: ImageRow) => {
    if (!product || !image.id) return set("images", values.images.filter((i) => i.key !== image.key))
    try {
      syncImages(await deleteImage.mutateAsync({ productId: product.id, imageId: image.id }))
      toast.add({ type: "info", title: t("pf.imageRemoved") })
    } catch (err) {
      toast.add({ type: "error", title: t("pf.failed"), description: errorMessage(err) })
    }
  }
  const onMoveImage = async (image: ImageRow, direction: -1 | 1) => {
    const list = [...values.images]
    const from = list.findIndex((i) => i.key === image.key)
    const to = from + direction
    if (to < 0 || to >= list.length) return
    ;[list[from], list[to]] = [list[to]!, list[from]!]
    if (!product) return set("images", list)
    try {
      syncImages(await reorderImages.mutateAsync({ productId: product.id, imageIds: list.map((i) => i.id!).filter(Boolean) }))
    } catch (err) {
      toast.add({ type: "error", title: t("pf.failed"), description: errorMessage(err) })
    }
  }

  const removeProduct = async () => {
    if (!product) return
    setConfirmDelete(false)
    try {
      await deleteProduct.mutateAsync(product.id)
      setInitial(values)
      toast.add({ type: "success", title: t("pf.deleted") })
      navigate("/products", { replace: true })
    } catch (err) {
      toast.add({ type: "error", title: t("pf.failed"), description: errorMessage(err) })
    }
  }

  const title = product ? `${t("pf.edit")}${product.code ? ` · ${product.code}` : ""}` : t("pf.new")

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-3.5 border-b bg-card px-4 md:px-6">
        <SidebarTrigger className="md:hidden" aria-label={t("header.toggleSidebar")} />
        <Button variant="ghost" size="icon" render={<Link to="/products" aria-label={t("pf.breadcrumb")} />}>
          <ChevronLeftIcon className="rtl:-scale-x-100" />
        </Button>
        <nav className="flex items-baseline gap-2 text-[13px] text-muted-foreground" aria-label="Breadcrumb">
          <Link to="/products" className="hover:text-foreground">
            {t("pf.breadcrumb")}
          </Link>
          <span>/</span>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </nav>
        <span className="hidden font-mono text-[11px] text-muted-foreground/70 lg:inline">{product ? `/api/v1/admin/products/${product.id}` : "/api/v1/admin/products"}</span>
        <div className="ms-auto flex items-center gap-2.5">
          <LanguageToggle />
          <Button variant="ghost" size="sm" render={<Link to="/products" />}>
            {t("pf.cancel")}
          </Button>
          {product ? (
            <Button size="sm" disabled={!dirty || saving} onClick={() => void submitEdit()}>
              <CheckIcon data-icon="inline-start" />
              {saving ? t("pf.saving") : t("pf.save")}
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" disabled={saving} onClick={() => void submitCreate(true)}>
                {t("pf.saveDraft")}
              </Button>
              <Button size="sm" disabled={saving} onClick={() => void submitCreate(false)}>
                <CheckIcon data-icon="inline-start" />
                {saving ? t("pf.saving") : t("pf.create")}
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-col gap-6 p-4 md:p-6 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          {formError ? <p className="rounded-lg border border-critical-soft bg-critical-soft px-4 py-2.5 text-[13px] text-critical">{formError}</p> : null}
          <IdentitySection values={values} errors={localizedErrors} set={set} />
          <ClassificationSection values={values} errors={localizedErrors} set={set} categories={categories.data ?? []} brands={brands.data ?? []} />
          <PricingSection values={values} errors={localizedErrors} set={set} />
          <VariantsSection values={values} errors={localizedErrors} set={set} minRows={1} />
        </div>
        <div className="flex w-full flex-col gap-6 xl:w-[380px] xl:shrink-0">
          <ImagesSection
            images={values.images}
            variants={values.variants}
            onUploaded={(urls) => void onUploaded(urls)}
            onChange={(image, patch) => set("images", values.images.map((i) => (i.key === image.key ? { ...i, ...patch } : i)))}
            onRemove={(image) => void onRemoveImage(image)}
            onMove={(image, dir) => void onMoveImage(image, dir)}
            busy={imagesBusy}
            onError={(message) => toast.add({ type: "error", title: t("pf.uploadFailed"), description: message })}
          />
          <StatusSection values={values} set={set} product={product} />
          {product ? (
            <section className="flex flex-col gap-3">
              <div className="border-b-2 border-critical pb-1.5">
                <h2 className="label-caps font-medium text-critical">{t("pf.danger")}</h2>
              </div>
              <Card className="py-4">
                <CardContent className="flex items-center gap-3 px-5">
                  <p className="flex-1 text-[13px] text-muted-foreground">{t("pf.deleteHint")}</p>
                  <Button variant="destructive" size="sm" onClick={() => setConfirmDelete(true)}>
                    <Trash2Icon data-icon="inline-start" />
                    {t("pf.delete")}
                  </Button>
                </CardContent>
              </Card>
            </section>
          ) : null}
        </div>
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent className="sm:max-w-[480px]">
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-critical-soft text-critical">
              <Trash2Icon />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-lg font-bold">{t("pf.delete")}</AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">{t("pf.deleteHint")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="ghost" size="lg">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" size="lg" onClick={() => void removeProduct()}>
              {t("pf.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={blocker.state === "blocked"} onOpenChange={(open) => !open && blocker.reset?.()}>
        <AlertDialogContent className="sm:max-w-[440px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">{t("pf.leave")}</AlertDialogTitle>
            <AlertDialogDescription>{t("pf.leaveHint")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel variant="ghost" size="lg" onClick={() => blocker.reset?.()}>
              {t("pf.stay")}
            </AlertDialogCancel>
            <AlertDialogAction variant="destructive" size="lg" onClick={() => blocker.proceed?.()}>
              {t("pf.discard")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

export { ProductFormPage }
