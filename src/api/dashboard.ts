import { useQuery } from "@tanstack/react-query"

import { api } from "./client"
import { qk } from "./query-keys"
import type { DashboardOverview, RevenuePoint, TopProduct } from "./types"

export function useDashboardOverview() {
  return useQuery({
    queryKey: qk.dashboard.overview,
    queryFn: () => api.get<DashboardOverview>("/admin/dashboard/overview"),
    refetchInterval: 60_000,
  })
}

export function useRevenue(days: number) {
  return useQuery({
    queryKey: qk.dashboard.revenue(days),
    queryFn: () => api.get<RevenuePoint[]>("/admin/dashboard/revenue", { days }),
  })
}

export function useTopProducts(days = 30, limit = 5) {
  return useQuery({
    queryKey: qk.dashboard.topProducts(days, limit),
    queryFn: () => api.get<TopProduct[]>("/admin/dashboard/top-products", { days, limit }),
  })
}
