import { getTranslations } from "@lib/i18n/get-translations"

/**
 * The six-step OEM/ODM engagement flow, numbered 01–06.
 */
export default async function Services() {
  const t = await getTranslations("services")

  const steps = [1, 2, 3, 4, 5, 6].map((n) => ({
    num: String(n).padStart(2, "0"),
    title: t(`step${n}_title`),
    body: t(`step${n}_body`),
  }))

  return (
    <section id="services" className="content-container py-16 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <span className="shop-eyebrow">{t("eyebrow")}</span>
        <h2 className="shop-display mt-4 text-3xl font-bold text-[var(--shop-ink)] sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-base leading-7 text-[var(--shop-muted)]">
          {t("subtitle")}
        </p>
      </div>

      <ol className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => (
          <li
            key={step.num}
            className="rounded-2xl border border-[var(--shop-border)] bg-[var(--shop-surface)] p-6 transition-shadow duration-200 hover:shadow-[var(--shop-shadow)]"
          >
            <span
              aria-hidden
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--shop-accent-soft)] text-sm font-extrabold text-[var(--shop-accent)]"
            >
              {step.num}
            </span>
            <h3 className="shop-display mt-4 text-xl font-bold text-[var(--shop-ink)]">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-7 text-[var(--shop-muted)]">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>
  )
}
