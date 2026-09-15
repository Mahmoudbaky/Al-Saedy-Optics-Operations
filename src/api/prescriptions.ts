import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "./client"
import { qk } from "./query-keys"
import type { AdminPrescription, PrescriptionListQuery, ReviewPrescriptionInput } from "./types"

export function usePrescriptions(params: PrescriptionListQuery) {
  return useQuery({
    queryKey: qk.prescriptions.list(params),
    queryFn: () => api.getPaged<AdminPrescription>("/admin/prescriptions", params),
    placeholderData: keepPreviousData,
  })
}

export function useReviewPrescription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...input }: ReviewPrescriptionInput & { id: string }) =>
      api.post<Omit<AdminPrescription, "user" | "waitingOrderNumber">>(`/admin/prescriptions/${id}/review`, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.prescriptions.all })
      // Orders show the live Rx status; the dashboard counts pending reviews.
      qc.invalidateQueries({ queryKey: qk.orders.all })
      qc.invalidateQueries({ queryKey: qk.dashboard.overview })
    },
  })
}
