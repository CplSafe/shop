"use client"

import { createContext, useContext } from "react"
import en from "./messages/en.json"
import fr from "./messages/fr.json"
import zh from "./messages/zh.json"
import { AppLocale, DEFAULT_LOCALE } from "./config"
import { interpolate } from "./interpolate"
import { getStoreName } from "@lib/util/env"

type Messages = typeof en

const MESSAGES: Record<AppLocale, Messages> = {
  en,
  fr: fr as Messages,
  zh: zh as Messages,
}

const LocaleContext = createContext<AppLocale>(DEFAULT_LOCALE)

/**
 * Wraps the app so client components can translate via useT(). The active
 * locale is resolved on the server (from the `_medusa_locale` cookie) and
 * passed in — messages are bundled, so no fetch is needed on the client.
 */
export function I18nProvider({
  locale,
  children,
}: {
  locale: AppLocale
  children: React.ReactNode
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  )
}

/**
 * Client-side translator hook scoped to a namespace. Supports {{param}}
 * interpolation via an optional second argument: t("hello", { name: "Ada" }).
 */
export function useT(namespace: keyof Messages) {
  const locale = useContext(LocaleContext)
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
