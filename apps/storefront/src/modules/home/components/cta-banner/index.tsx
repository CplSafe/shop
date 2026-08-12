import { getTranslations } from "@lib/i18n/get-translations"

/**
 * Full-bleed forest-green banner routing visitors to the inquiry form.
 */
export default async function CtaBanner() {
  const t = await getTranslations("cta")

  return (
    <section className="bg-gradient-to-br from-[#214b39] to-[#315f49] text-white">
      <div className="content-container flex flex-col items-start justify-between gap-6 py-14 lg:flex-row lg:items-center lg:py-16">
        <div className="max-w-2xl">
          <h2 className="shop-display text-2xl font-bold leading-tight text-white sm:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/80">{t("body")}</p>
        </div>
        <a
          href="#contact"
          className="inline-flex shrink-0 items-center justify-center rounded-[10px] border border-white bg-white px-6 py-3 text-sm font-bold text-[var(--shop-accent)] transition-colors duration-200 hover:bg-transparent hover:text-white"
        >
          {t("button")}
        </a>
      </div>
    </section>
  )
}
