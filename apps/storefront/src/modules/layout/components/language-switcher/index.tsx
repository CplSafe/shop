"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateLocale } from "@lib/data/locale-actions"
import { AppLocale, LOCALES, LOCALE_LABELS, LOCALE_SHORT } from "@lib/i18n/config"

/**
 * Cookie-based language switcher (EN / FR / 中).
 * Writes the `_medusa_locale` cookie via the server action and refreshes so
 * server components re-render with the new locale. Does not alter the URL.
 */
export default function LanguageSwitcher({
  current,
}: {
  current: AppLocale
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const choose = (locale: AppLocale) => {
    setOpen(false)
    if (locale === current) return
    startTransition(async () => {
      await updateLocale(locale)
      router.refresh()
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        onClick={() => setOpen((v) => !v)}
        disabled={isPending}
        className="text-sm font-medium text-ui-fg-subtle hover:text-ui-fg-base transition-colors disabled:opacity-50 cursor-pointer"
      >
        {LOCALE_SHORT[current]}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <ul
            role="listbox"
            className="absolute right-0 z-50 mt-2 min-w-[140px] border border-ui-border-base bg-white shadow-md"
          >
            {LOCALES.map((locale) => (
              <li key={locale} role="option" aria-selected={locale === current}>
                <button
                  type="button"
                  onClick={() => choose(locale)}
                  className={`flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-ui-bg-subtle transition-colors cursor-pointer ${
                    locale === current
                      ? "font-semibold text-ui-fg-base"
                      : "text-ui-fg-subtle"
                  }`}
                >
                  {LOCALE_LABELS[locale]}
                  <span className="text-xs text-ui-fg-muted">
                    {LOCALE_SHORT[locale]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
