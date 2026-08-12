import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getTranslations } from "@lib/i18n/get-translations"

const Hero = async () => {
  const t = await getTranslations("hero")

  const metrics = [
    { value: t("metric_facility_value"), label: t("metric_facility_label") },
    { value: t("metric_markets_value"), label: t("metric_markets_label") },
    { value: t("metric_model_value"), label: t("metric_model_label") },
  ]

  return (
    <section
      id="top"
      className="border-b border-[var(--shop-border)] bg-gradient-to-b from-[#fbf9f4] to-[#f6f1e8]"
    >
      <div className="content-container grid grid-cols-1 items-center gap-10 py-14 lg:grid-cols-12 lg:gap-14 lg:py-20">
        {/* Positioning + primary actions */}
        <div className="lg:col-span-6">
          <span className="shop-eyebrow">{t("eyebrow")}</span>

          <h1 className="shop-display mt-5 text-[clamp(2.25rem,5.5vw,3.5rem)] font-bold leading-[1.12] text-[var(--shop-ink)]">
            {t("headline_a")}
            <br />
            {t("headline_b")}{" "}
            <span className="text-[var(--shop-accent)]">
              {t("headline_accent")}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-7 text-[var(--shop-muted)]">
            {t("body")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <LocalizedClientLink
              href="/store"
              className="shop-btn-primary w-full sm:w-auto"
            >
              {t("cta_browse")}
              <span aria-hidden>→</span>
            </LocalizedClientLink>
            <a href="#factory" className="shop-btn-ghost w-full sm:w-auto">
              {t("cta_factory")}
            </a>
          </div>

          <dl className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-2xl border border-[var(--shop-border)] bg-white p-4"
              >
                <dd className="shop-display text-xl font-bold leading-tight text-[var(--shop-accent)]">
                  {metric.value}
                </dd>
                <dt className="mt-1 text-xs text-[var(--shop-muted)]">
                  {metric.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>

        {/* Brand visual — LCP element, so it loads eagerly at high priority. */}
        <div className="lg:col-span-6">
          <div className="shop-card relative aspect-[4/3] w-full">
            <Image
              src="/images/yezi/hero-lineup.webp"
              alt={t("visual_alt")}
              fill
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
