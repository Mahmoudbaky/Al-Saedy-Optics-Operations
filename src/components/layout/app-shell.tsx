import { Outlet } from "react-router"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toast"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "./app-sidebar"

/** Sidebar + main column; every screen renders inside `<Outlet />`. */
function AppShell() {
  return (
    <TooltipProvider>
      <Toaster>
        <SidebarProvider style={{ "--sidebar-width": "15.5rem" } as React.CSSProperties}>
          <AppSidebar />
          <SidebarInset className="min-h-svh">
            <Outlet />
          </SidebarInset>
        </SidebarProvider>
      </Toaster>
    </TooltipProvider>
  )
}

export { AppShell }
