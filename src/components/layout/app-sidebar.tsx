import { ChevronsUpDownIcon, LogOutIcon, UserRoundIcon } from "lucide-react"
import { Link, useLocation } from "react-router"

import { BrandMark } from "@/components/shared/brand-logo"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useI18n } from "@/lib/i18n"
import { initials } from "@/lib/utils"
import { navGroups } from "./nav-items"

function AppSidebar() {
  const { t, n, dir } = useI18n()
  const { pathname } = useLocation()
  const { isMobile } = useSidebar()

  return (
    <Sidebar side={dir === "rtl" ? "right" : "left"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-5">
        <div className="flex items-center gap-3">
          <span className="flex shrink-0 rounded-sm bg-white p-1.5">
            <BrandMark />
          </span>
          <div className="flex flex-col gap-0.5 group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-sidebar-accent-foreground">
              {t("brand.product")}
            </span>
            <span className="text-[11px] text-sidebar-foreground/70">{t("brand.org")}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1 pt-2">
        {navGroups.map((group) => (
          <SidebarGroup key={group.labelKey}>
            <SidebarGroupLabel className="label-caps text-sidebar-foreground/60">
              {t(group.labelKey)}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.to
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        isActive={active}
                        tooltip={t(item.labelKey)}
                        className="h-9 gap-2.5 px-3 data-active:shadow-[inset_2px_0_0_var(--sidebar-primary)] rtl:data-active:shadow-[inset_-2px_0_0_var(--sidebar-primary)]"
                        render={<Link to={item.to} aria-current={active ? "page" : undefined} />}
                      >
                        <item.icon />
                        <span>{t(item.labelKey)}</span>
                      </SidebarMenuButton>
                      {item.badge ? (
                        <SidebarMenuBadge className="rounded-sm bg-sidebar-primary px-1.5 text-[11px] font-semibold text-sidebar-primary-foreground">
                          {n(item.badge)}
                        </SidebarMenuBadge>
                      ) : null}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="gap-2.5 data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                  />
                }
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-[#0d2340] text-[13px] font-semibold text-white">
                    {initials(t("user.name"))}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col text-start leading-tight">
                  <span className="text-[13px] font-semibold text-sidebar-accent-foreground">
                    {t("user.name")}
                  </span>
                  <span className="text-[11px] text-sidebar-foreground/70">{t("user.role")}</span>
                </div>
                <ChevronsUpDownIcon className="ms-auto" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={isMobile ? "bottom" : dir === "rtl" ? "left" : "right"}
                align="end"
                className="min-w-56"
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <UserRoundIcon />
                    {t("user.profile")}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <LogOutIcon />
                    {t("user.signOut")}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export { AppSidebar }
