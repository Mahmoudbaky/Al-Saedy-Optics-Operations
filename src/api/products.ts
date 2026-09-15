import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "./client"
import { qk } from "./query-keys"
import type { Brand, BulkProductAction, Category, Product, ProductListQuery } from "./types"

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

export function useUpdateProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: ({ id, ...patch }: { id: string; isActive?: boolean; isBestSeller?: boolean }) =>
      api.patch<Product>(`/admin/products/${id}`, patch),
    onSuccess: invalidate,
  })
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
