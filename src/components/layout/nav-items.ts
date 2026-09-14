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
  /** Live count surfaced as a red badge (orders needing action, Rx to verify). */
  badge?: number
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
      { to: "/orders", labelKey: "nav.orders", icon: PackageIcon, badge: 34 },
      { to: "/prescriptions", labelKey: "nav.prescriptions", icon: FileTextIcon, badge: 12 },
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
