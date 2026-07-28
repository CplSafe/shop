import { getTranslations } from "@lib/i18n/get-translations"

export default async function HowItWorks() {
  const t = await getTranslations("how")

  const steps = [
    { n: "01", title: t("step1_title"), body: t("step1_body") },
    { n: "02", title: t("step2_title"), body: t("step2_body") },
    { n: "03", title: t("step3_title"), body: t("step3_body") },
  ]

  return (
    <section className="border-y border-[var(--shop-border)] bg-[var(--shop-surface)]">
      <div className="content-container py-16 lg:py-24">
        <span className="shop-eyebrow">
          <span className="h-px w-8 bg-[var(--shop-accent)]" />
          {t("eyebrow")}
        </span>
        <h2 className="shop-display mt-3 max-w-2xl text-3xl sm:text-4xl font-semibold text-[var(--shop-ink)]">
          {t("title")}
        </h2>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-px bg-[var(--shop-border)] border border-[var(--shop-border)]">
          {steps.map((s) => (
            <div key={s.n} className="bg-[var(--shop-surface)] p-8">
              <span className="shop-display shop-tabular text-2xl font-bold text-[var(--shop-accent)]">
                {s.n}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-[var(--shop-ink)]">
                {s.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-[var(--shop-muted)]">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
