import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { api } from "./client"
import { qk } from "./query-keys"
import type { AdminOrder, OrderListQuery, OrderStatus, UpdateOrderDetailsInput } from "./types"

export function useOrders(params: OrderListQuery) {
  return useQuery({
    queryKey: qk.orders.list(params),
    queryFn: () => api.getPaged<AdminOrder>("/admin/orders", params),
    placeholderData: keepPreviousData,
  })
}

export function useOrder(id: string | null) {
  return useQuery({
    queryKey: qk.orders.detail(id ?? ""),
    queryFn: () => api.get<AdminOrder>(`/admin/orders/${id}`),
    enabled: !!id,
  })
}

/** Writes the returned order into the detail cache and refreshes lists + dashboard counters. */
function useOrderMutation<TVars>(mutationFn: (vars: TVars) => Promise<AdminOrder>) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (order) => {
      qc.setQueryData(qk.orders.detail(order.id), order)
      qc.invalidateQueries({ queryKey: qk.orders.all })
      qc.invalidateQueries({ queryKey: qk.dashboard.overview })
    },
  })
}

export function useUpdateOrderStatus() {
  return useOrderMutation(({ id, status, note }: { id: string; status: OrderStatus; note?: string }) =>
    api.post<AdminOrder>(`/admin/orders/${id}/status`, note ? { status, note } : { status })
  )
}

export function useUpdateOrderDetails() {
  return useOrderMutation(({ id, ...input }: UpdateOrderDetailsInput & { id: string }) =>
    api.patch<AdminOrder>(`/admin/orders/${id}`, input)
  )
}
