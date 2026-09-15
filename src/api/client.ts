import axios, { type AxiosRequestConfig } from "axios"

import { API_V1 } from "./config"
import { ApiError } from "./errors"
import type { PageMeta } from "./types"

/**
 * Axios instance for `/api/v1`. The Better Auth session cookie rides along via
 * `withCredentials` (the panel origin is in the backend's CORS_ORIGINS), so no
 * token handling is needed here. Responses are unwrapped from the `{ success, data, meta }`
 * envelope by the interceptor; failures always surface as `ApiError`.
 */
export const http = axios.create({
  baseURL: API_V1,
  withCredentials: true,
  timeout: 20_000,
  headers: { Accept: "application/json" },
  // Arrays become `ids=a,b,c` – what the backend's CSV params expect.
  paramsSerializer: { indexes: null, serialize: (params) => serializeParams(params) },
})

type Params = object

function serializeParams(params: Record<string, unknown>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "" || value === "any") continue
    search.set(key, Array.isArray(value) ? value.join(",") : String(value))
  }
  return search.toString()
}

interface Envelope<T> {
  success: boolean
  data: T
  meta?: unknown
  error?: { code?: string; message?: string; details?: unknown }
}

/** Listeners for 401s – the auth provider uses this to drop a stale session. */
const unauthorizedListeners = new Set<() => void>()
export function onUnauthorized(listener: () => void): () => void {
  unauthorizedListeners.add(listener)
  return () => unauthorizedListeners.delete(listener)
}

http.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const apiError = ApiError.from(error)
    if (apiError.status === 401) for (const listener of unauthorizedListeners) listener()
    return Promise.reject(apiError)
  }
)

async function unwrap<T>(request: Promise<{ status: number; data: Envelope<T> | "" }>): Promise<T> {
  const res = await request
  if (res.status === 204 || res.data === "") return null as T
  return res.data.data
}

export interface Paged<T, M = PageMeta> {
  data: T[]
  meta: M
}

export const api = {
  get: <T>(url: string, params?: Params, config?: AxiosRequestConfig) =>
    unwrap<T>(http.get<Envelope<T>>(url, { params, ...config })),
  getPaged: async <T, M = PageMeta>(url: string, params?: Params): Promise<Paged<T, M>> => {
    const res = await http.get<Envelope<T[]>>(url, { params })
    return { data: res.data.data ?? [], meta: res.data.meta as M }
  },
  post: <T>(url: string, body?: unknown) => unwrap<T>(http.post<Envelope<T>>(url, body)),
  put: <T>(url: string, body?: unknown) => unwrap<T>(http.put<Envelope<T>>(url, body)),
  patch: <T>(url: string, body?: unknown) => unwrap<T>(http.patch<Envelope<T>>(url, body)),
  delete: <T = null>(url: string, body?: unknown) => unwrap<T>(http.delete<Envelope<T>>(url, { data: body })),
}
