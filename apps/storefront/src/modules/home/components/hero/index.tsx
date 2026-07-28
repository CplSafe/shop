import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getTranslations } from "@lib/i18n/get-translations"

const Hero = async () => {
  const t = await getTranslations("hero")

  const buyingPaths = [
    {
      label: t("retail_label"),
      title: t("retail_title"),
      body: t("retail_body"),
      cta: t("retail_cta"),
      href: "/store",
      featured: false,
    },
    {
      label: t("wholesale_label"),
      title: t("wholesale_title"),
      body: t("wholesale_body"),
      cta: t("wholesale_cta"),
      href: "/account/wholesale",
      featured: true,
    },
  ]

  return (
    <section className="relative w-full bg-[var(--shop-bg)] border-b border-[var(--shop-border)] overflow-hidden">
      {/* faint industrial grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--shop-border) 1px, transparent 1px)",
          backgroundSize: "72px 100%",
        }}
      />

      <div className="relative border-b border-[var(--shop-border)] bg-[var(--shop-ink)] text-white">
        <div className="content-container flex flex-col gap-2 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium tracking-wide text-white/80">
            {t("announcement")}
          </p>
          <LocalizedClientLink
            href="/account/wholesale"
            className="shrink-0 font-semibold uppercase tracking-[0.14em] text-white hover:text-[var(--shop-accent)] transition-colors"
          >
            {t("announcement_cta")} <span aria-hidden>→</span>
          </LocalizedClientLink>
        </div>
      </div>

      <div className="content-container relative">
        <div className="grid grid-cols-1 gap-y-10 py-12 sm:py-16 lg:grid-cols-12 lg:gap-x-12 lg:py-20">
          {/* Left: positioning and primary actions */}
          <div className="lg:col-span-7 lg:py-6">
            <span className="shop-eyebrow">
              <span className="h-px w-8 bg-[var(--shop-accent)]" />
              {t("eyebrow")}
            </span>

            <h1 className="shop-display mt-5 text-[clamp(2.5rem,7vw,5.25rem)] leading-[0.95] font-bold text-[var(--shop-ink)]">
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
              <LocalizedClientLink
                href="/account/wholesale"
                className="shop-btn-ghost w-full sm:w-auto"
              >
                {t("cta_wholesale")}
              </LocalizedClientLink>
            </div>
          </div>

          {/* Right: audience-specific buying routes */}
          <div className="lg:col-span-5 lg:border-l lg:border-[var(--shop-border)] lg:pl-12">
            <span className="shop-eyebrow">{t("paths_eyebrow")}</span>
            <h2 className="shop-display mt-3 text-2xl font-semibold text-[var(--shop-ink)]">
              {t("paths_title")}
            </h2>

            <div className="mt-6 grid grid-cols-2 gap-px border border-[var(--shop-border)] bg-[var(--shop-border)] lg:grid-cols-1">
              {buyingPaths.map((path) => (
                <LocalizedClientLink
                  key={path.label}
                  href={path.href}
                  className={`group flex min-h-36 flex-col justify-between p-4 transition-colors sm:min-h-44 sm:p-6 ${
                    path.featured
                      ? "bg-[var(--shop-accent)] text-white hover:bg-emerald-700"
                      : "bg-[var(--shop-surface)] text-[var(--shop-ink)] hover:bg-slate-100"
                  }`}
                >
                  <div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-[0.18em] ${
                        path.featured ? "text-white/70" : "text-[var(--shop-muted)]"
                      }`}
                    >
                      {path.label}
                    </span>
                    <h3 className="shop-display mt-2 text-base font-semibold sm:mt-3 sm:text-xl">
                      {path.title}
                    </h3>
                    <p
                      className={`mt-2 hidden text-sm leading-6 sm:block ${
                        path.featured ? "text-white/80" : "text-[var(--shop-muted)]"
                      }`}
                    >
                      {path.body}
                    </p>
                  </div>
                  <span className="mt-4 text-[10px] font-bold uppercase tracking-[0.1em] sm:mt-5 sm:text-xs sm:tracking-[0.12em]">
                    {path.cta} <span aria-hidden>→</span>
                  </span>
                </LocalizedClientLink>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* operational trust strip */}
      <div className="border-t border-[var(--shop-border)] bg-[var(--shop-ink)]">
        <div className="content-container">
          <ul className="grid grid-cols-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/70 sm:text-[10px] sm:tracking-[0.16em] lg:grid-cols-4">
            <li className="border-b border-r border-white/10 py-3 pr-3 lg:border-b-0">{t("strip_currency")}</li>
            <li className="border-b border-white/10 py-3 pl-3 lg:border-b-0 lg:border-r lg:px-4">{t("strip_b2b")}</li>
            <li className="border-r border-white/10 py-3 pr-3 lg:px-4">{t("strip_payments")}</li>
            <li className="py-3 pl-3 lg:pl-4">{t("strip_delivery")}</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default Hero
