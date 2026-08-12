import Image from "next/image"
import { getTranslations } from "@lib/i18n/get-translations"

/**
 * Factory capability section. For an OEM/ODM buyer this is the trust anchor —
 * production environment, line, warehouse and lab — laid out on a deliberately
 * asymmetric grid so it does not read as a uniform card wall.
 */
export default async function Factory() {
  const t = await getTranslations("factory")

  const scenes = [
    {
      key: "exterior",
      span: "lg:col-span-2",
      ratio: "aspect-[16/9]",
      src: "/images/yezi/factory-exterior.webp",
      sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 66vw",
    },
    {
      key: "line",
      span: "",
      ratio: "aspect-[4/3]",
      src: "/images/yezi/factory-production-line.webp",
      sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    },
    {
      key: "warehouse",
      span: "",
      ratio: "aspect-[4/3]",
      src: "/images/yezi/factory-warehouse.webp",
      sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    },
    {
      key: "lab",
      span: "",
      ratio: "aspect-[4/3]",
      src: "/images/yezi/factory-laboratory.webp",
      sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
    },
  ] as const

  const summaryPoints = [
    t("summary_point_1"),
    t("summary_point_2"),
    t("summary_point_3"),
    t("summary_point_4"),
  ]

  return (
    <section id="factory" className="content-container py-16 lg:py-24">
      <div className="mx-auto max-w-3xl text-center">
        <span className="shop-eyebrow">{t("eyebrow")}</span>
        <h2 className="shop-display mt-4 text-3xl font-bold text-[var(--shop-ink)] sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-base leading-7 text-[var(--shop-muted)]">
          {t("subtitle")}
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {scenes.map((scene) => (
          <article key={scene.key} className={`shop-card ${scene.span}`}>
            <div className={`${scene.ratio} relative overflow-hidden`}>
              <Image
                src={scene.src}
                alt={t(`${scene.key}_title`)}
                fill
                loading="lazy"
                sizes={scene.sizes}
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <h3 className="shop-display text-xl font-bold text-[var(--shop-ink)]">
                {t(`${scene.key}_title`)}
              </h3>
              <p className="mt-2 text-sm leading-7 text-[var(--shop-muted)]">
                {t(`${scene.key}_body`)}
              </p>
            </div>
          </article>
        ))}

        {/* Editorial closing panel — inverted so it anchors the grid. */}
        <article className="shop-card bg-[var(--shop-deep)] p-6 text-white sm:col-span-2 lg:col-span-2">
          <h3 className="shop-display text-xl font-bold text-white">
            {t("summary_title")}
          </h3>
          <p className="mt-3 text-sm leading-7 text-white/70">
            {t("summary_body")}
          </p>
          <ul className="mt-5 grid grid-cols-1 gap-x-6 sm:grid-cols-2">
            {summaryPoints.map((point) => (
              <li
                key={point}
                className="relative py-1.5 pl-6 text-sm text-white/85"
              >
                <span
                  aria-hidden
                  className="absolute left-0 top-1.5 font-extrabold text-[#8fc7ac]"
                >
                  ✓
                </span>
                {point}
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  )
}
