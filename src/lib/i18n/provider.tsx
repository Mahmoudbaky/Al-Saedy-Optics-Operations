import * as React from "react"

import type { Language } from "@/types"
import { I18nContext, type Direction, type I18nContextValue, type Params } from "./context"
import { messages } from "./messages"

const STORAGE_KEY = "alsaedy-admin-locale"
const INTL_LOCALE: Record<Language, string> = { en: "en-GB", ar: "ar-EG" }
const DIRECTION: Record<Language, Direction> = { en: "ltr", ar: "rtl" }

const isLanguage = (value: string | null): value is Language => value === "ar" || value === "en"

/** `?lang=ar` wins (shareable links), then the remembered choice, then English. */
function readInitialLocale(): Language {
  const fromUrl = new URLSearchParams(window.location.search).get("lang")
  if (isLanguage(fromUrl)) return fromUrl
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isLanguage(stored) ? stored : "en"
  } catch {
    return "en"
  }
}

function interpolate(template: string, params: Params | undefined, format: (v: number) => string) {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = params[key]
    if (value === undefined) return `{${key}}`
    return typeof value === "number" ? format(value) : value
  })
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Language>(readInitialLocale)
  const dir = DIRECTION[locale]

  React.useLayoutEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = dir
  }, [locale, dir])

  const setLocale = React.useCallback((next: Language) => {
    setLocaleState(next)
    try {
      window.localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage is a convenience; the in-memory state is the source of truth.
    }
  }, [])

  const value = React.useMemo<I18nContextValue>(() => {
    const intl = INTL_LOCALE[locale]
    const numberFormat = new Intl.NumberFormat(intl)
    const n: I18nContextValue["n"] = (v, options) =>
      options ? new Intl.NumberFormat(intl, options).format(v) : numberFormat.format(v)

    const id: I18nContextValue["id"] = (v) => n(v, { useGrouping: false })

    const t: I18nContextValue["t"] = (key, params) =>
      interpolate(messages[locale][key], params, n)

    const compact: I18nContextValue["compact"] = (v) => {
      if (v < 1_000_000) return n(v)
      const millions = Math.round((v / 1_000_000) * 10) / 10
      return locale === "ar" ? `${n(millions)} مليون` : `${n(millions)}M`
    }

    const duration: I18nContextValue["duration"] = (minutes) => {
      const h = Math.floor(minutes / 60)
      const m = minutes % 60
      const parts: string[] = []
      if (h > 0) parts.push(t("time.h", { n: h }))
      if (m > 0 || h === 0) parts.push(t("time.m", { n: m }))
      return parts.join(" ")
    }

    const waitingSince: I18nContextValue["waitingSince"] = (iso) =>
      t("time.waiting", { duration: duration(Math.round((Date.now() - new Date(iso).getTime()) / 60_000)) })

    const relative: I18nContextValue["relative"] = (iso) => {
      const minutes = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000))
      return minutes < 60
        ? t("time.minAgo", { n: minutes })
        : t("time.hAgo", { n: Math.round(minutes / 60) })
    }

    const monthYear: I18nContextValue["monthYear"] = (iso) =>
      new Intl.DateTimeFormat(intl, { month: "short", year: "numeric" }).format(new Date(iso))

    const dateTime: I18nContextValue["dateTime"] = (iso) =>
      new Intl.DateTimeFormat(intl, {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(iso))

    return { locale, dir, setLocale, t, n, id, compact, relative, duration, waitingSince, monthYear, dateTime }
  }, [locale, dir, setLocale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
