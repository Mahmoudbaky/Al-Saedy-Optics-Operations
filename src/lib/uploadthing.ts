import { generateReactHelpers } from "@uploadthing/react"
import type { FileRouter } from "uploadthing/server"

import { API_URL } from "@/api/config"

/**
 * UploadThing client bound to the backend's `/api/uploadthing` router. The browser
 * uploads straight to UploadThing; the backend only authorises (admin session cookie,
 * hence `credentials: "include"`) and returns the stored URL.
 *
 * Route slugs: `productImage` (admin, image ≤4 MB ×8), `prescriptionImage`, `avatar`.
 */
const apiOrigin = new URL(API_URL).origin

/**
 * Send the session cookie only to our API (presign + completion callbacks). The
 * client also talks straight to UploadThing's ingest host, which replies with
 * `Access-Control-Allow-Origin: *` — browsers reject credentialed requests there.
 */
const fetchWithSession: typeof fetch = (input, init) => {
  const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
  const sameApi = new URL(url, window.location.href).origin === apiOrigin
  return fetch(input, sameApi ? { ...init, credentials: "include" } : init)
}

export const { useUploadThing, uploadFiles } = generateReactHelpers<FileRouter>({
  url: `${API_URL}/api/uploadthing`,
  fetch: fetchWithSession,
})

/** What `onUploadComplete` returns for every route in the backend router. */
export interface UploadedImage {
  url: string
}
