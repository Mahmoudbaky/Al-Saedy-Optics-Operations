import type { Prescription } from "@/types"

const minutesAgo = (m: number) => new Date(Date.now() - m * 60_000).toISOString()

const empty = { sph: null, cyl: null, axis: null }

export const prescriptions: Prescription[] = [
  {
    id: "rx-1",
    customerId: "c-1",
    customerName: "Maryam Abdullah",
    status: "pending",
    source: "upload",
    od: { sph: -1.25, cyl: -0.5, axis: 180 },
    os: { sph: -1.0, cyl: -0.75, axis: 195 },
    pd: "62",
    add: null,
    doctorName: "Dr. Ahmed Al-Saedy",
    issuedOn: "2026-08-11",
    expiresOn: "2027-08-11",
    imageFileName: "maryam-rx-2026-08-11.jpg",
    imageSizeMb: 1.4,
    submittedAt: minutesAgo(380),
    verifiedBy: null,
    verifiedOn: null,
    previousCount: 2,
    expiredCount: 1,
    waitingOrderNumber: 10428,
  },
  { id: "rx-2", customerId: "c-2", customerName: "Hassan Al-Ani", status: "pending", source: "typed", od: { sph: -2.0, cyl: null, axis: null }, os: { sph: -2.25, cyl: null, axis: null }, pd: "64", add: null, doctorName: null, issuedOn: "2026-08-10", expiresOn: "2027-08-10", imageFileName: null, imageSizeMb: null, submittedAt: minutesAgo(302), verifiedBy: null, verifiedOn: null, previousCount: 0, expiredCount: 0, waitingOrderNumber: 10427 },
  { id: "rx-3", customerId: "c-3", customerName: "Zahra Kareem", status: "pending", source: "upload", od: empty, os: empty, pd: null, add: null, doctorName: null, issuedOn: null, expiresOn: null, imageFileName: "zahra-rx.jpg", imageSizeMb: 2.1, submittedAt: minutesAgo(281), verifiedBy: null, verifiedOn: null, previousCount: 1, expiredCount: 0, waitingOrderNumber: null },
  { id: "rx-4", customerId: "c-5", customerName: "Omar Saleh", status: "pending", source: "typed", od: { sph: -0.75, cyl: null, axis: null }, os: { sph: -0.5, cyl: null, axis: null }, pd: "63", add: null, doctorName: null, issuedOn: "2026-08-09", expiresOn: "2027-08-09", imageFileName: null, imageSizeMb: null, submittedAt: minutesAgo(198), verifiedBy: null, verifiedOn: null, previousCount: 0, expiredCount: 0, waitingOrderNumber: null },
  { id: "rx-5", customerId: "c-8", customerName: "Layla Mahmoud", status: "pending", source: "exam", od: { sph: 1.5, cyl: null, axis: null }, os: { sph: 1.5, cyl: null, axis: null }, pd: "61", add: "+1.50", doctorName: "Dr. Ahmed Al-Saedy", issuedOn: "2026-08-12", expiresOn: "2027-08-12", imageFileName: null, imageSizeMb: null, submittedAt: minutesAgo(175), verifiedBy: null, verifiedOn: null, previousCount: 3, expiredCount: 2, waitingOrderNumber: 10424 },
  { id: "rx-6", customerId: "c-6", customerName: "Ali Jabbar", status: "pending", source: "typed", od: { sph: -3.0, cyl: -1.0, axis: 90 }, os: { sph: -3.0, cyl: -1.0, axis: 90 }, pd: "65", add: null, doctorName: null, issuedOn: "2026-08-12", expiresOn: "2027-08-12", imageFileName: null, imageSizeMb: null, submittedAt: minutesAgo(90), verifiedBy: null, verifiedOn: null, previousCount: 0, expiredCount: 0, waitingOrderNumber: null },
  { id: "rx-7", customerId: "c-9", customerName: "Noor Al-Saedi", status: "pending", source: "upload", od: empty, os: empty, pd: null, add: null, doctorName: null, issuedOn: null, expiresOn: null, imageFileName: "noor-rx.png", imageSizeMb: 0.9, submittedAt: minutesAgo(48), verifiedBy: null, verifiedOn: null, previousCount: 0, expiredCount: 0, waitingOrderNumber: null },
]

export const PENDING_PRESCRIPTIONS_COUNT = 12
