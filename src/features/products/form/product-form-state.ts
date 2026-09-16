import type { FrameShape, Gender, ImageInput, Product, ProductInput, ProductPatch, VariantInput } from "@/api/types"
import type { MessageKey } from "@/lib/i18n"

/** Everything the form edits, as strings so inputs stay controlled; converted on save. */
export interface VariantRow {
  /** Local key; `id` is set for variants that already exist on the server. */
  key: string
  id?: string
  colorHex: string
  colorEn: string
  colorAr: string
  sku: string
  stock: string
  isActive: boolean
}

export interface ImageRow {
  key: string
  id?: string
  url: string
  alt: string
  /** Hex of the variant the image belongs to, or "" for the product gallery. */
  variantColorHex: string
}

export interface ProductFormValues {
  nameEn: string
  nameAr: string
  code: string
  slug: string
  noteEn: string
  noteAr: string
  descriptionEn: string
  descriptionAr: string
  categoryId: string
  brandId: string
  shape: FrameShape | ""
  gender: Gender
  material: string
  /** `54-18-145` → lensWidth-bridge-templeLength */
  size: string
  weightGrams: string
  price: string
  compareAtPrice: string
  isActive: boolean
  isBestSeller: boolean
  requiresPrescription: boolean
  supportsLensAddons: boolean
  variants: VariantRow[]
  images: ImageRow[]
}

export type FormErrors = Partial<Record<string, MessageKey | string>>

let counter = 0
export const newKey = () => `k${Date.now().toString(36)}${(counter++).toString(36)}`

export const emptyVariant = (): VariantRow => ({ key: newKey(), colorHex: "#22262B", colorEn: "", colorAr: "", sku: "", stock: "0", isActive: true })

export function emptyValues(): ProductFormValues {
  return {
    nameEn: "",
    nameAr: "",
    code: "",
    slug: "",
    noteEn: "",
    noteAr: "",
    descriptionEn: "",
    descriptionAr: "",
    categoryId: "",
    brandId: "",
    shape: "rectangle",
    gender: "unisex",
    material: "",
    size: "",
    weightGrams: "",
    price: "",
    compareAtPrice: "",
    isActive: true,
    isBestSeller: false,
    requiresPrescription: false,
    supportsLensAddons: true,
    variants: [emptyVariant()],
    images: [],
  }
}

export function valuesFromProduct(p: Product): ProductFormValues {
  const s = p.specs
  const size = s?.lensWidth && s.bridge && s.templeLength ? `${s.lensWidth}-${s.bridge}-${s.templeLength}` : ""
  const hexById = new Map(p.variants.map((v) => [v.id, v.colorHex]))
  return {
    nameEn: p.name.en,
    nameAr: p.name.ar,
    code: p.code ?? "",
    slug: p.slug,
    noteEn: p.note?.en ?? "",
    noteAr: p.note?.ar ?? "",
    descriptionEn: p.description?.en ?? "",
    descriptionAr: p.description?.ar ?? "",
    categoryId: p.category.id,
    brandId: p.brand?.id ?? "",
    shape: p.shape ?? "",
    gender: p.gender ?? "unisex",
    material: s?.material ?? "",
    size,
    weightGrams: s?.weightGrams ? String(s.weightGrams) : "",
    price: String(p.price),
    compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : "",
    isActive: p.isActive,
    isBestSeller: p.isBestSeller,
    requiresPrescription: p.requiresPrescription,
    supportsLensAddons: p.supportsLensAddons,
    variants: [...p.variants]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((v) => ({ key: v.id, id: v.id, colorHex: v.colorHex, colorEn: v.colorName?.en ?? "", colorAr: v.colorName?.ar ?? "", sku: v.sku ?? "", stock: String(v.stock), isActive: v.isActive })),
    images: [...p.images]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((i) => ({ key: i.id, id: i.id, url: i.url, alt: i.alt ?? "", variantColorHex: (i.variantId && hexById.get(i.variantId)) || "" })),
  }
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/
const isInt = (v: string) => /^\d+$/.test(v.trim())
const clean = (v: string) => (v.trim() ? v.trim() : null)

export function validate(v: ProductFormValues): FormErrors {
  const e: FormErrors = {}
  if (!v.nameEn.trim()) e["name.en"] = "pf.required"
  if (!v.nameAr.trim()) e["name.ar"] = "pf.required"
  if (!v.categoryId) e.categoryId = "pf.required"
  if (!isInt(v.price)) e.price = "pf.number"
  if (v.compareAtPrice.trim() && !isInt(v.compareAtPrice)) e.compareAtPrice = "pf.number"
  if (v.weightGrams.trim() && !/^\d+(\.\d+)?$/.test(v.weightGrams.trim())) e.weightGrams = "pf.number"
  if (v.size.trim() && !/^\d{2}-\d{2}-\d{3}$/.test(v.size.trim())) e.size = "pf.sizeHint"
  if (v.variants.length === 0) e.variants = "pf.variantsMin"
  const seen = new Set<string>()
  v.variants.forEach((row, i) => {
    const hex = row.colorHex.trim().toUpperCase()
    if (!HEX_RE.test(hex)) e[`variants.${i}.colorHex`] = "pf.variantsHex"
    else if (seen.has(hex)) e[`variants.${i}.colorHex`] = "pf.variantsDuplicate"
    seen.add(hex)
    if (!isInt(row.stock)) e[`variants.${i}.stock`] = "pf.number"
  })
  return e
}

export function variantToInput(row: VariantRow, sortOrder: number): VariantInput {
  const en = clean(row.colorEn)
  const ar = clean(row.colorAr)
  return {
    colorHex: row.colorHex.trim().toUpperCase(),
    colorName: en || ar ? { en, ar } : null,
    sku: clean(row.sku),
    stock: Number(row.stock),
    sortOrder,
    isActive: row.isActive,
  }
}

export function imageToInput(row: ImageRow, sortOrder: number): ImageInput {
  return { url: row.url, alt: clean(row.alt), sortOrder, variantColorHex: row.variantColorHex || null }
}

/** Scalar product fields (everything except variants and images). */
export function toPatch(v: ProductFormValues): ProductPatch {
  const [lensWidth, bridge, templeLength] = v.size.trim() ? v.size.trim().split("-").map(Number) : []
  const specs = {
    ...(lensWidth ? { lensWidth, bridge, templeLength } : {}),
    ...(v.weightGrams.trim() ? { weightGrams: Number(v.weightGrams) } : {}),
    ...(v.material.trim() ? { material: v.material.trim() } : {}),
  }
  const descEn = clean(v.descriptionEn)
  const descAr = clean(v.descriptionAr)
  const noteEn = clean(v.noteEn)
  const noteAr = clean(v.noteAr)
  return {
    slug: v.slug.trim() || undefined,
    code: clean(v.code)?.toUpperCase() ?? null,
    name: { en: v.nameEn.trim(), ar: v.nameAr.trim() },
    description: descEn || descAr ? { en: descEn, ar: descAr } : null,
    note: noteEn || noteAr ? { en: noteEn, ar: noteAr } : null,
    categoryId: v.categoryId,
    brandId: v.brandId || null,
    price: Number(v.price),
    compareAtPrice: v.compareAtPrice.trim() ? Number(v.compareAtPrice) : null,
    shape: v.shape || null,
    gender: v.gender,
    specs: Object.keys(specs).length ? specs : null,
    supportsLensAddons: v.supportsLensAddons,
    requiresPrescription: v.requiresPrescription,
    isBestSeller: v.isBestSeller,
    isActive: v.isActive,
  }
}

export function toCreateInput(v: ProductFormValues): ProductInput {
  return {
    ...(toPatch(v) as Omit<ProductInput, "variants" | "images">),
    variants: v.variants.map(variantToInput),
    images: v.images.map(imageToInput),
  }
}
