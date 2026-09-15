import axios from "axios"

/** Codes emitted by the backend's error handler, plus client-side ones. */
export type ApiErrorCode =
  | "BAD_REQUEST"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "ALREADY_EXISTS"
  | "REFERENCE_ERROR"
  | "RATE_LIMITED"
  | "TOO_MANY_REQUESTS"
  | "INTERNAL_ERROR"
  | "NETWORK"
  | "TIMEOUT"
  | (string & {})

export interface ValidationIssue {
  in?: "params" | "query" | "body"
  /** Dotted path, e.g. `od.axis`. */
  path: string
  message: string
}

export class ApiError extends Error {
  override readonly name = "ApiError"

  readonly code: ApiErrorCode
  readonly status: number
  readonly details: unknown

  constructor(code: ApiErrorCode, status: number, message: string, details?: unknown) {
    super(message)
    this.code = code
    this.status = status
    this.details = details
  }

  get issues(): ValidationIssue[] {
    return Array.isArray(this.details)
      ? (this.details as ValidationIssue[]).filter((i) => typeof i?.path === "string")
      : []
  }

  /** `{ "od.axis": "…" }` for binding to form fields. */
  fieldErrors(): Record<string, string> {
    const out: Record<string, string> = {}
    for (const issue of this.issues) if (!(issue.path in out)) out[issue.path] = issue.message
    return out
  }

  static is(error: unknown, code?: ApiErrorCode): error is ApiError {
    return error instanceof ApiError && (code === undefined || error.code === code)
  }

  /** Normalises anything axios throws into an ApiError. */
  static from(error: unknown): ApiError {
    if (error instanceof ApiError) return error
    if (axios.isAxiosError(error)) {
      const body = error.response?.data as { error?: { code?: string; message?: string; details?: unknown } } | undefined
      if (error.response) {
        return new ApiError(
          body?.error?.code ?? "INTERNAL_ERROR",
          error.response.status,
          body?.error?.message ?? error.response.statusText ?? error.message,
          body?.error?.details
        )
      }
      return new ApiError(error.code === "ECONNABORTED" ? "TIMEOUT" : "NETWORK", 0, error.message)
    }
    return new ApiError("INTERNAL_ERROR", 0, error instanceof Error ? error.message : String(error))
  }
}
