import { getLocale } from "@lib/data/locale-actions"
import { AppLocale, DEFAULT_LOCALE, normalizeLocale } from "./config"
import { interpolate } from "./interpolate"
import { getStoreName } from "@lib/util/env"
import en from "./messages/en.json"
import fr from "./messages/fr.json"
import zh from "./messages/zh.json"

type Messages = typeof en

const MESSAGES: Record<AppLocale, Messages> = {
  en,
  fr: fr as Messages,
  zh: zh as Messages,
}

/**
 * Resolves the active UI locale from the `_medusa_locale` cookie (set by the
 * language switcher). Falls back to the default when unset or unsupported.
 */
export async function getActiveLocale(): Promise<AppLocale> {
  const cookieLocale = await getLocale()
  return normalizeLocale(cookieLocale)
}

/**
 * Server-side translator. Returns a `t(key, params?)` function scoped to a
 * namespace, e.g. `const t = await getTranslations("hero"); t("cta_browse")`.
 * Supports {{param}} interpolation. Missing keys fall back to English, then
 * to the raw key.
 */
export async function getTranslations(namespace: keyof Messages) {
  const locale = await getActiveLocale()
  const dict = MESSAGES[locale] ?? MESSAGES[DEFAULT_LOCALE]
  const fallback = MESSAGES[DEFAULT_LOCALE]

  return function t(
    key: string,
    params?: Record<string, string | number>
  ): string {
    const ns = dict[namespace] as Record<string, string> | undefined
    const fbNs = fallback[namespace] as Record<string, string> | undefined
    const template = ns?.[key] ?? fbNs?.[key] ?? key
    return interpolate(template, {
      storeName: getStoreName(),
      ...params,
    })
  }
}
