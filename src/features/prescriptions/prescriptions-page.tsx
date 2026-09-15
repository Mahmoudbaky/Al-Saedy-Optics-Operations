import * as React from "react"
import { InboxIcon } from "lucide-react"

import { useApiErrorMessage, usePrescriptions, useReviewPrescription, type ReviewPrescriptionInput } from "@/api"
import { PageHeader } from "@/components/layout/page-header"
import { QueryState } from "@/components/shared/query-state"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { toast } from "@/components/ui/toast"
import { useI18n } from "@/lib/i18n"
import type { Prescription } from "@/types"
import { ReviewQueue, type RxStatusFilter, type SourceFilter } from "./review-queue"
import { RxReviewForm, type RxFormValues } from "./rx-review-form"
import { ScanPreview } from "./scan-preview"

const clean = (value: string) => (value.trim() === "" ? null : value.trim())

/** GET /admin/prescriptions?status=pending — review queue + verify/reject. */
function PrescriptionsPage() {
  const { t, id } = useI18n()
  const errorMessage = useApiErrorMessage()
  const [status, setStatus] = React.useState<RxStatusFilter>("pending")
  const [source, setSource] = React.useState<SourceFilter>("any")
  const [selectedId, setSelectedId] = React.useState<string | null>(null)

  // The API filters by status; source is a client-side refinement of the current page.
  const list = usePrescriptions({ status: status === "any" ? undefined : status, limit: 100 })
  const pending = usePrescriptions({ status: "pending", limit: 1 })
  const review = useReviewPrescription()

  const queue = React.useMemo(
    () =>
      (list.data?.data ?? [])
        .filter((rx) => source === "any" || rx.source === source)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [list.data, source]
  )
  const selected = queue.find((rx) => rx.id === selectedId) ?? queue[0] ?? null
  const pendingCount = pending.data?.meta.total ?? 0

  /** POST /admin/prescriptions/:id/review */
  const submit = async (rx: Prescription, values: RxFormValues, decision: "verified" | "rejected") => {
    const input: ReviewPrescriptionInput = {
      status: decision,
      reviewNote: clean(values.note),
      od: { sph: clean(values.od.sph), cyl: clean(values.od.cyl), axis: clean(values.od.axis) },
      os: { sph: clean(values.os.sph), cyl: clean(values.os.cyl), axis: clean(values.os.axis) },
      pd: clean(values.pd),
      add: clean(values.add),
      expiresOn: clean(values.expiresOn),
    }
    try {
      await review.mutateAsync({ id: rx.id, ...input })
      const next = queue.find((item) => item.id !== rx.id)
      setSelectedId(next?.id ?? null)
      toast.add(
        decision === "verified"
          ? {
              type: "success",
              title: t("rx.toast.verified", { name: rx.user.name }),
              description: rx.waitingOrderNumber !== null ? t("rx.toast.verifiedHint", { number: id(rx.waitingOrderNumber) }) : undefined,
            }
          : { type: "info", title: t("rx.toast.rejected", { name: rx.user.name }), description: t("rx.toast.rejectedHint") }
      )
    } catch (err) {
      toast.add({ type: "error", title: t("rx.toast.failed"), description: errorMessage(err) })
    }
  }

  return (
    <>
      <PageHeader title={t("rx.title")} endpoint="/api/v1/admin/prescriptions?status=pending" />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <ReviewQueue
          items={queue}
          loading={list.isPending}
          pendingCount={pendingCount}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
          status={status}
          onStatusChange={(next) => {
            setStatus(next)
            setSelectedId(null)
          }}
          source={source}
          onSourceChange={setSource}
        />
        <QueryState query={list} empty={false} skeleton={<div className="flex-1" />}>
          {selected ? (
            <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:px-6 md:py-5 xl:flex-row">
              <ScanPreview key={selected.id} prescription={selected} />
              <RxReviewForm
                key={`form-${selected.id}`}
                prescription={selected}
                submitting={review.isPending}
                onVerify={(values) => void submit(selected, values, "verified")}
                onReject={(values) => void submit(selected, values, "rejected")}
              />
            </div>
          ) : (
            <Empty className="m-6 flex-1 border bg-card">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <InboxIcon />
                </EmptyMedia>
                <EmptyTitle>{t("rx.empty")}</EmptyTitle>
                <EmptyDescription>{t("rx.emptyHint")}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </QueryState>
      </div>
    </>
  )
}

export { PrescriptionsPage }
