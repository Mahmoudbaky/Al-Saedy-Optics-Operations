import { createBrowserRouter } from "react-router"

import { AppShell } from "@/components/layout/app-shell"
import { CustomersPage } from "@/features/customers/customers-page"
import { LensAddonsPage } from "@/features/lens-addons/lens-addons-page"
import { OrdersPage } from "@/features/orders/orders-page"
import { OverviewPage } from "@/features/overview/overview-page"
import { PrescriptionsPage } from "@/features/prescriptions/prescriptions-page"
import { ProductsPage } from "@/features/products/products-page"

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppShell,
    children: [
      { index: true, Component: OverviewPage },
      { path: "orders", Component: OrdersPage },
      { path: "prescriptions", Component: PrescriptionsPage },
      { path: "products", Component: ProductsPage },
      { path: "lens-addons", Component: LensAddonsPage },
      { path: "customers", Component: CustomersPage },
    ],
  },
])
