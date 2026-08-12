import Image from "next/image"
import { getTranslations } from "@lib/i18n/get-translations"
import { getWhatsAppNumber } from "@lib/util/env"
import InquiryForm from "./inquiry-form"

/**
 * OEM/ODM inquiry section: product brief form plus company facts.
 */
export default async function Inquiry() {
  const t = await getTranslations("inquiry")
  const whatsAppNumber = getWhatsAppNumber()

  const facts = [
    t("info_area"),
    t("info_markets"),
    t("info_focus"),
    t("info_office"),
    ...(whatsAppNumber ? [t("info_whatsapp", { number: whatsAppNumber })] : []),
  ]

  return (
    <section
      id="contact"
      className="border-t border-[var(--shop-border)] bg-[var(--shop-surface)]"
    >
      <div className="content-container grid grid-cols-1 items-start gap-8 py-16 lg:grid-cols-[1.35fr_1fr] lg:gap-12 lg:py-24">
        <div>
          <span className="shop-eyebrow">{t("eyebrow")}</span>
          <h2 className="shop-display mt-4 text-3xl font-bold text-[var(--shop-ink)] sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--shop-muted)]">
            {t("subtitle")}
          </p>

          <div className="shop-card mt-8 bg-[var(--shop-bg)] p-6 sm:p-8">
            <InquiryForm />
          </div>
        </div>

        <aside className="shop-card">
          <div className="relative aspect-[4/3]">
            <Image
              src="/images/yezi/factory-production-line.webp"
              alt={t("info_title")}
              fill
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
          <div className="p-6 sm:p-8">
            <h3 className="shop-display text-xl font-bold text-[var(--shop-ink)]">
              {t("info_title")}
            </h3>
            <p className="mt-3 text-sm leading-7 text-[var(--shop-muted)]">
              {t("info_body")}
            </p>
            <ul className="shop-check-list mt-4">
              {facts.map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </section>
  )
}
