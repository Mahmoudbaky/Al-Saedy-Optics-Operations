import { useI18n } from "@/lib/i18n"

import { ApiError } from "./errors"

/** Localised message for any error thrown by the API layer. */
export function useApiErrorMessage() {
  const { t, locale } = useI18n()
  return (error: unknown): string => {
    if (!ApiError.is(error)) return t("error.unknown")
    switch (error.code) {
      case "NETWORK":
      case "TIMEOUT":
        return t("error.network")
      case "UNAUTHORIZED":
        return t("auth.sessionExpired")
      case "FORBIDDEN":
        return t("error.forbidden")
      case "NOT_FOUND":
        return t("error.notFound")
      case "CONFLICT":
      case "ALREADY_EXISTS":
      case "REFERENCE_ERROR":
        return t("error.conflict")
      case "VALIDATION_ERROR":
        return error.issues[0]?.message ?? t("error.validation")
      case "RATE_LIMITED":
      case "TOO_MANY_REQUESTS":
        return t("error.rateLimited")
      case "BAD_REQUEST":
        // Backend messages are English; show them as-is there, generic copy in Arabic.
        return locale === "en" ? error.message : t("error.unknown")
      default:
        return t("error.server")
    }
  }
}
