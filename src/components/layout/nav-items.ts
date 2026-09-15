import {
  FileTextIcon,
  GlassesIcon,
  LayersIcon,
  LayoutDashboardIcon,
  PackageIcon,
  UserRoundIcon,
  type LucideIcon,
} from "lucide-react"

import type { MessageKey } from "@/lib/i18n"

export interface NavItem {
  to: string
  labelKey: MessageKey
  icon: LucideIcon
}

export interface NavGroup {
  labelKey: MessageKey
  items: NavItem[]
}

export const navGroups: NavGroup[] = [
  {
    labelKey: "nav.operations",
    items: [
      { to: "/", labelKey: "nav.overview", icon: LayoutDashboardIcon },
      { to: "/orders", labelKey: "nav.orders", icon: PackageIcon },
      { to: "/prescriptions", labelKey: "nav.prescriptions", icon: FileTextIcon },
    ],
  },
  {
    labelKey: "nav.catalog",
    items: [
      { to: "/products", labelKey: "nav.products", icon: GlassesIcon },
      { to: "/lens-addons", labelKey: "nav.lensAddons", icon: LayersIcon },
    ],
  },
  {
    labelKey: "nav.people",
    items: [{ to: "/customers", labelKey: "nav.customers", icon: UserRoundIcon }],
  },
]
