import Image from "next/image"
import { getTranslations } from "@lib/i18n/get-translations"

/**
 * Company positioning section — the "who we are" beat of the corporate site.
 */
export default async function About() {
  const t = await getTranslations("about")

  const points = [t("point_1"), t("point_2"), t("point_3"), t("point_4")]

  const cardPoints = [t("card_point_1"), t("card_point_2"), t("card_point_3")]

  return (
    <section
      id="about"
      className="border-y border-[var(--shop-border)] bg-[var(--shop-surface)]"
    >
      <div className="content-container grid grid-cols-1 items-center gap-10 py-16 lg:grid-cols-2 lg:gap-14 lg:py-24">
        <div>
          <span className="shop-eyebrow">{t("eyebrow")}</span>
          <h2 className="shop-display mt-4 text-3xl font-bold leading-tight text-[var(--shop-ink)] sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--shop-muted)]">
            {t("body")}
          </p>
          <ul className="shop-check-list mt-6">
            {points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="shop-card bg-[var(--shop-bg)]">
          <div className="relative aspect-[16/10]">
            <Image
              src="/images/yezi/category-lotion-cream-soap.webp"
              alt={t("card_title")}
              fill
              loading="lazy"
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="p-8 sm:p-10">
            <h3 className="shop-display text-2xl font-bold text-[var(--shop-ink)]">
              {t("card_title")}
            </h3>
            <p className="mt-4 text-sm leading-7 text-[var(--shop-muted)]">
              {t("card_body")}
            </p>
            <ul className="shop-check-list mt-5">
              {cardPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
