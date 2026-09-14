import * as React from "react"

import type { Language } from "@/types"
import type { MessageKey } from "./messages"

export type Direction = "ltr" | "rtl"
export type Params = Record<string, string | number>

export interface I18nContextValue {
  locale: Language
  dir: Direction
  setLocale: (locale: Language) => void
  /** Translate a key, interpolating `{name}` placeholders. Numbers are localised. */
  t: (key: MessageKey, params?: Params) => string
  /** Format a number in the active locale (Arabic-Indic digits for `ar`). */
  n: (value: number, options?: Intl.NumberFormatOptions) => string
  /** Identifiers (order numbers) — localised digits, no grouping. */
  id: (value: number) => string
  /** Compact money: 28.4M / ٢٨٫٤ مليون. */
  compact: (value: number) => string
  /** Relative time like "12 min ago" / "قبل ١٢ دقيقة". */
  relative: (iso: string) => string
  /** Elapsed duration like "6 h 20 m". */
  duration: (minutes: number) => string
  /** "waiting 6 h 20 m" for a queue item submitted at `iso`. */
  waitingSince: (iso: string) => string
  /** Short month + year, e.g. "Aug 2025". */
  monthYear: (iso: string) => string
  /** Date + time for order headers, e.g. "Mon 11 Aug, 2:14 PM". */
  dateTime: (iso: string) => string
}

export const I18nContext = React.createContext<I18nContextValue | null>(null)
