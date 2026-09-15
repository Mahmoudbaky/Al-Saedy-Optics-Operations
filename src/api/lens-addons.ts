import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "./client"
import { qk } from "./query-keys"
import type { LensAddon, LensAddonInput } from "./types"

export function useLensAddons() {
  return useQuery({ queryKey: qk.lensAddons, queryFn: () => api.get<LensAddon[]>("/admin/lens-addons") })
}

function useInvalidateAddons() {
  const qc = useQueryClient()
  return () => qc.invalidateQueries({ queryKey: qk.lensAddons })
}

export function useCreateLensAddon() {
  const invalidate = useInvalidateAddons()
  return useMutation({ mutationFn: (input: LensAddonInput) => api.post<LensAddon>("/admin/lens-addons", input), onSuccess: invalidate })
}

export function useUpdateLensAddon() {
  const invalidate = useInvalidateAddons()
  return useMutation({
    mutationFn: ({ id, ...patch }: Partial<Omit<LensAddonInput, "id">> & { id: string }) =>
      api.patch<LensAddon>(`/admin/lens-addons/${id}`, patch),
    onSuccess: invalidate,
  })
}

export function useDeleteLensAddon() {
  const invalidate = useInvalidateAddons()
  return useMutation({ mutationFn: (id: string) => api.delete(`/admin/lens-addons/${id}`), onSuccess: invalidate })
}
