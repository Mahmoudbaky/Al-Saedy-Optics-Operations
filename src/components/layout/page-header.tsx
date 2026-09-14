import { BellIcon, DownloadIcon, SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useI18n } from "@/lib/i18n"
import { LanguageToggle } from "./language-toggle"

interface PageHeaderProps {
  title: string
  /** API route the screen reads from — shown as a developer annotation. */
  endpoint?: string
  /** Show the global search box (overview only). */
  search?: boolean
  actions?: React.ReactNode
}

function PageHeader({ title, endpoint, search, actions }: PageHeaderProps) {
  const { t } = useI18n()
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b bg-card px-4 md:px-6">
      <SidebarTrigger className="md:hidden" aria-label={t("header.toggleSidebar")} />
      <h1 className="font-heading text-lg font-semibold">{title}</h1>
      {endpoint ? (
        <span className="hidden font-mono text-[11px] text-muted-foreground/70 lg:inline">
          {endpoint}
        </span>
      ) : null}
      {search ? (
        <InputGroup className="ms-4 hidden max-w-[360px] flex-1 bg-background md:flex">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput placeholder={t("header.search")} aria-label={t("header.search")} />
        </InputGroup>
      ) : null}
      <div className="ms-auto flex items-center gap-2.5">
        <LanguageToggle />
        <Button variant="ghost" size="icon" aria-label={t("header.notifications")}>
          <BellIcon />
        </Button>
        {actions ?? (
          <Button variant="outline" className="hidden sm:inline-flex">
            <DownloadIcon data-icon="inline-start" />
            {t("header.export")}
          </Button>
        )}
      </div>
    </header>
  )
}

export { PageHeader }
