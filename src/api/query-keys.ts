/** Query key factory – one namespace per resource so invalidation stays coarse and safe. */
export const qk = {
  session: ["session"] as const,
  dashboard: {
    overview: ["dashboard", "overview"] as const,
    revenue: (days: number) => ["dashboard", "revenue", days] as const,
    topProducts: (days: number, limit: number) => ["dashboard", "top-products", days, limit] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (params: object) => ["orders", "list", params] as const,
    detail: (id: string) => ["orders", "detail", id] as const,
  },
  prescriptions: {
    all: ["prescriptions"] as const,
    list: (params: object) => ["prescriptions", "list", params] as const,
  },
  products: {
    all: ["products"] as const,
    list: (params: object) => ["products", "list", params] as const,
    detail: (id: string) => ["products", "detail", id] as const,
  },
  categories: ["categories"] as const,
  brands: ["brands"] as const,
  lensAddons: ["lens-addons"] as const,
  users: {
    all: ["users"] as const,
    list: (params: object) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
  },
}
