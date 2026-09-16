import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "./client"
import { qk } from "./query-keys"
import type { Brand, BulkProductAction, Category, ImageInput, Product, ProductInput, ProductListQuery, ProductPatch, VariantInput } from "./types"

export function useProducts(params: ProductListQuery) {
  return useQuery({
    queryKey: qk.products.list(params),
    queryFn: () => api.getPaged<Product>("/admin/products", params),
    placeholderData: keepPreviousData,
  })
}

export function useCategories() {
  return useQuery({ queryKey: qk.categories, queryFn: () => api.get<Category[]>("/admin/categories"), staleTime: 5 * 60_000 })
}

export function useBrands() {
  return useQuery({ queryKey: qk.brands, queryFn: () => api.get<Brand[]>("/admin/brands"), staleTime: 5 * 60_000 })
}

function useInvalidateProducts() {
  const qc = useQueryClient()
  return () => {
    qc.invalidateQueries({ queryKey: qk.products.all })
    qc.invalidateQueries({ queryKey: qk.dashboard.overview })
  }
}

/** `GET /admin/products/:id` – full detail for the edit form. */
export function useProductDetail(id: string | undefined) {
  return useQuery({
    queryKey: qk.products.detail(id ?? ""),
    queryFn: () => api.get<Product>(`/admin/products/${id}`),
    enabled: !!id,
  })
}

/** Product mutations that return the updated detail: cache it and refresh the lists. */
function useProductMutation<TVars>(mutationFn: (vars: TVars) => Promise<Product>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (product) => {
      qc.setQueryData(qk.products.detail(product.id), product)
      qc.invalidateQueries({ queryKey: qk.products.all })
      qc.invalidateQueries({ queryKey: qk.dashboard.overview })
    },
  })
}

export function useCreateProduct() {
  return useProductMutation((input: ProductInput) => api.post<Product>("/admin/products", input))
}

export function useUpdateProduct() {
  return useProductMutation(({ id, ...patch }: ProductPatch & { id: string }) => api.patch<Product>(`/admin/products/${id}`, patch))
}

export function useAddVariant() {
  return useProductMutation(({ productId, ...input }: VariantInput & { productId: string }) =>
    api.post<Product>(`/admin/products/${productId}/variants`, input)
  )
}

export function useUpdateVariant() {
  return useProductMutation(({ productId, variantId, ...patch }: Partial<VariantInput> & { productId: string; variantId: string }) =>
    api.patch<Product>(`/admin/products/${productId}/variants/${variantId}`, patch)
  )
}

export function useDeleteVariant() {
  return useProductMutation(({ productId, variantId }: { productId: string; variantId: string }) =>
    api.delete<Product>(`/admin/products/${productId}/variants/${variantId}`)
  )
}

export function useAddImages() {
  return useProductMutation(({ productId, images }: { productId: string; images: ImageInput[] }) =>
    api.post<Product>(`/admin/products/${productId}/images`, { images })
  )
}

export function useReorderImages() {
  return useProductMutation(({ productId, imageIds }: { productId: string; imageIds: string[] }) =>
    api.put<Product>(`/admin/products/${productId}/images/order`, { imageIds })
  )
}

export function useDeleteImage() {
  return useProductMutation(({ productId, imageId }: { productId: string; imageId: string }) =>
    api.delete<Product>(`/admin/products/${productId}/images/${imageId}`)
  )
}

export function useBulkProductAction() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (input: { ids: string[]; action: BulkProductAction }) => api.post<{ affected: number }>("/admin/products/bulk", input),
    onSuccess: invalidate,
  })
}

export function useDeleteProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation({ mutationFn: (id: string) => api.delete(`/admin/products/${id}`), onSuccess: invalidate })
}

export function useAdjustStock() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: ({ productId, variantId, stock }: { productId: string; variantId: string; stock: number }) =>
      api.patch<{ variantId: string; stock: number }>(`/admin/products/${productId}/variants/${variantId}/stock`, { stock }),
    onSuccess: invalidate,
  })
}
