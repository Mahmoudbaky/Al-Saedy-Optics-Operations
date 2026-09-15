import type { UseQueryResult } from "@tanstack/react-query"
import { InboxIcon, TriangleAlertIcon } from "lucide-react"

import { useApiErrorMessage } from "@/api/use-api-error-message"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { useI18n } from "@/lib/i18n"

interface QueryStateProps {
  query: Pick<UseQueryResult, "isPending" | "isError" | "error" | "refetch">
  /** Render the empty state instead of children (data loaded but nothing to show). */
  empty?: boolean
  emptyTitle?: string
  emptyHint?: string
  skeleton?: React.ReactNode
  children: React.ReactNode
}

/** Loading / error / empty wrapper for list screens. */
function QueryState({ query, empty = false, emptyTitle, emptyHint, skeleton, children }: QueryStateProps) {
  const { t } = useI18n()
  const errorMessage = useApiErrorMessage()

  if (query.isPending) {
    return (
      <>
        {skeleton ?? (
          <div className="flex flex-col gap-2 rounded-lg border bg-card p-4">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        )}
      </>
    )
  }
  if (query.isError) {
    return (
      <Empty className="border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TriangleAlertIcon />
          </EmptyMedia>
          <EmptyTitle>{errorMessage(query.error)}</EmptyTitle>
        </EmptyHeader>
        <Button variant="outline" onClick={() => void query.refetch()}>
          {t("error.retry")}
        </Button>
      </Empty>
    )
  }
  if (empty) {
    return (
      <Empty className="border bg-card">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <InboxIcon />
          </EmptyMedia>
          <EmptyTitle>{emptyTitle ?? t("common.empty")}</EmptyTitle>
          <EmptyDescription>{emptyHint ?? t("common.emptyHint")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }
  return <>{children}</>
}

export { QueryState }
