import * as React from "react"
import { InboxIcon } from "lucide-react"

import { PageHeader } from "@/components/layout/page-header"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { toast } from "@/components/ui/toast"
import { PENDING_PRESCRIPTIONS_COUNT, prescriptions as seed } from "@/data/prescriptions"
import { useI18n } from "@/lib/i18n"
import type { Prescription } from "@/types"
import { ReviewQueue, type RxStatusFilter, type SourceFilter } from "./review-queue"
import { RxReviewForm, type RxFormValues } from "./rx-review-form"
import { ScanPreview } from "./scan-preview"

const toNumber = (value: string) => (value.trim() === "" ? null : Number(value))

/** GET /admin/prescriptions?status=pending — review queue + verify/reject. */
function PrescriptionsPage() {
  const { t, id } = useI18n()
  const [items, setItems] = React.useState<Prescription[]>(seed)
  const [status, setStatus] = React.useState<RxStatusFilter>("pending")
  const [source, setSource] = React.useState<SourceFilter>("any")
  const [selectedId, setSelectedId] = React.useState<string | null>(seed[0]?.id ?? null)

  const queue = React.useMemo(
    () =>
      items
        .filter((rx) => status === "any" || rx.status === status)
        .filter((rx) => source === "any" || rx.source === source)
        .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt)),
    [items, status, source]
  )
  const selected = queue.find((rx) => rx.id === selectedId) ?? queue[0] ?? null
  const pendingCount = PENDING_PRESCRIPTIONS_COUNT - items.filter((rx) => rx.status !== "pending").length

  /** POST /admin/prescriptions/:id/review */
  const review = (rx: Prescription, values: RxFormValues, decision: "verified" | "rejected") => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === rx.id
          ? {
              ...item,
              status: decision,
              od: { sph: toNumber(values.od.sph), cyl: toNumber(values.od.cyl), axis: toNumber(values.od.axis) },
              os: { sph: toNumber(values.os.sph), cyl: toNumber(values.os.cyl), axis: toNumber(values.os.axis) },
              pd: values.pd || null,
              add: values.add || null,
              doctorName: values.doctorName || null,
              issuedOn: values.issuedOn || null,
              expiresOn: values.expiresOn || null,
              verifiedBy: decision === "verified" ? "Dr. Ahmed Al-Saedy" : null,
              verifiedOn: decision === "verified" ? new Date().toISOString().slice(0, 10) : null,
            }
          : item
      )
    )
    const next = queue.find((item) => item.id !== rx.id)
    setSelectedId(next?.id ?? null)
    toast.add(
      decision === "verified"
        ? {
            type: "success",
            title: t("rx.toast.verified", { name: rx.customerName }),
            description:
              rx.waitingOrderNumber !== null
                ? t("rx.toast.verifiedHint", { number: id(rx.waitingOrderNumber) })
                : undefined,
          }
        : {
            type: "info",
            title: t("rx.toast.rejected", { name: rx.customerName }),
            description: t("rx.toast.rejectedHint"),
          }
    )
  }

  return (
    <>
      <PageHeader title={t("rx.title")} endpoint="/api/v1/admin/prescriptions?status=pending" />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <ReviewQueue
          items={queue}
          pendingCount={pendingCount}
          selectedId={selected?.id ?? null}
          onSelect={setSelectedId}
          status={status}
          onStatusChange={setStatus}
          source={source}
          onSourceChange={setSource}
        />
        {selected ? (
          <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:px-6 md:py-5 xl:flex-row">
            <ScanPreview key={selected.id} prescription={selected} />
            <RxReviewForm
              key={`form-${selected.id}`}
              prescription={selected}
              onVerify={(values) => review(selected, values, "verified")}
              onReject={(values) => review(selected, values, "rejected")}
            />
          </div>
        ) : (
          <Empty className="m-6 border bg-card">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <InboxIcon />
              </EmptyMedia>
              <EmptyTitle>{t("rx.empty")}</EmptyTitle>
              <EmptyDescription>{t("rx.emptyHint")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </>
  )
}

export { PrescriptionsPage }
