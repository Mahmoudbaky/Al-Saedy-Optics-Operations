import { createBrowserRouter } from "react-router"

import { RequireAdmin } from "@/auth"
import { AppShell } from "@/components/layout/app-shell"
import { LoginPage } from "@/features/auth/login-page"
import { CustomersPage } from "@/features/customers/customers-page"
import { LensAddonsPage } from "@/features/lens-addons/lens-addons-page"
import { OrdersPage } from "@/features/orders/orders-page"
import { OverviewPage } from "@/features/overview/overview-page"
import { PrescriptionsPage } from "@/features/prescriptions/prescriptions-page"
import { ProductsPage } from "@/features/products/products-page"

export const router = createBrowserRouter([
  { path: "/login", Component: LoginPage },
  {
    Component: RequireAdmin,
    children: [
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
    ],
  },
])
