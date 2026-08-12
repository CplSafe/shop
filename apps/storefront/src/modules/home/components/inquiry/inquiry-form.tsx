"use client"

import { useState } from "react"
import { useT } from "@lib/i18n/client"
import { buildWhatsAppLink } from "@lib/util/env"

type FieldKey =
  | "name"
  | "company"
  | "country"
  | "whatsapp"
  | "category"
  | "quantity"
  | "packaging"
  | "target_price"
  | "details"

const TEXT_FIELDS: { key: FieldKey; required?: boolean }[] = [
  { key: "name", required: true },
  { key: "company" },
  { key: "country" },
  { key: "whatsapp", required: true },
]

const DETAIL_FIELDS: { key: FieldKey }[] = [
  { key: "quantity" },
  { key: "packaging" },
  { key: "target_price" },
]

const CATEGORY_KEYS = [
  "shower_gel",
  "shampoo",
  "body_lotion",
  "face_cream",
  "serum",
  "face_oil",
  "soap",
  "body_scrub",
  "other",
] as const

const inputClass =
  "rounded-xl border border-[var(--shop-border)] bg-white px-3.5 py-3 text-sm text-[var(--shop-ink)] outline-none transition-colors focus:border-[var(--shop-accent)] focus:ring-2 focus:ring-[var(--shop-accent-soft)]"

const labelClass = "text-xs font-semibold text-[var(--shop-ink)]"

/**
 * OEM/ODM product brief. On submit it composes a readable WhatsApp message
 * from the filled fields and opens wa.me — no backend endpoint involved, which
 * keeps the enquiry route working without server-side mail configuration.
 */
export default function InquiryForm() {
  const t = useT("inquiry")
  const [error, setError] = useState<string | null>(null)

  // Rendered on the client, so the button is hidden when no number is set.
  const hasWhatsApp = buildWhatsAppLink("probe") !== null

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const data = new FormData(event.currentTarget)
    const lines = Array.from(data.entries())
      .filter(([, value]) => String(value).trim() !== "")
      .map(([key, value]) => `${t(`field_${key}`)}: ${String(value).trim()}`)

    const link = buildWhatsAppLink(
      `${t("message_heading")}\n\n${lines.join("\n")}`
    )

    if (!link) {
      setError(t("unavailable"))
      return
    }

    window.open(link, "_blank", "noopener,noreferrer")
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {TEXT_FIELDS.map((field) => (
        <div key={field.key} className="flex flex-col gap-2">
          <label className={labelClass} htmlFor={`inquiry-${field.key}`}>
            {t(`field_${field.key}`)}
          </label>
          <input
            id={`inquiry-${field.key}`}
            name={field.key}
            required={field.required}
            placeholder={t(`field_${field.key}_placeholder`)}
            className={inputClass}
          />
        </div>
      ))}

      <div className="flex flex-col gap-2">
        <label className={labelClass} htmlFor="inquiry-category">
          {t("field_category")}
        </label>
        <select id="inquiry-category" name="category" className={inputClass}>
          {CATEGORY_KEYS.map((key) => (
            <option key={key} value={t(`category_${key}`)}>
              {t(`category_${key}`)}
            </option>
          ))}
        </select>
      </div>

      {DETAIL_FIELDS.map((field) => (
        <div key={field.key} className="flex flex-col gap-2">
          <label className={labelClass} htmlFor={`inquiry-${field.key}`}>
            {t(`field_${field.key}`)}
          </label>
          <input
            id={`inquiry-${field.key}`}
            name={field.key}
            placeholder={t(`field_${field.key}_placeholder`)}
            className={inputClass}
          />
        </div>
      ))}

      <div className="flex flex-col gap-2 sm:col-span-2">
        <label className={labelClass} htmlFor="inquiry-details">
          {t("field_details")}
        </label>
        <textarea
          id="inquiry-details"
          name="details"
          rows={5}
          placeholder={t("field_details_placeholder")}
          className={`${inputClass} min-h-32 resize-y`}
        />
      </div>

      <div className="sm:col-span-2">
        {hasWhatsApp ? (
          <>
            <button type="submit" className="shop-btn-primary w-full sm:w-auto">
              {t("submit")}
            </button>
            <p className="mt-3 text-xs text-[var(--shop-muted)]">{t("note")}</p>
          </>
        ) : (
          <p className="text-xs text-[var(--shop-muted)]">{t("unavailable")}</p>
        )}

        {error && (
          <p role="alert" className="mt-3 text-xs font-semibold text-red-600">
            {error}
          </p>
        )}
      </div>
    </form>
  )
}
