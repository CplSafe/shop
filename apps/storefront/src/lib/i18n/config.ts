export const LOCALES = ["en", "fr", "zh"] as const
export type AppLocale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = "en"

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "English",
  fr: "Français",
  zh: "中文",
}

export const LOCALE_SHORT: Record<AppLocale, string> = {
  en: "EN",
  fr: "FR",
  zh: "中",
}

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && LOCALES.includes(value as AppLocale)
}

export function normalizeLocale(value: unknown): AppLocale {
  if (isAppLocale(value)) return value
  // Accept region-tagged values like "fr-CI" or "zh-CN".
  if (typeof value === "string") {
    const base = value.split("-")[0].toLowerCase()
    if (isAppLocale(base)) return base
  }
  return DEFAULT_LOCALE
}
