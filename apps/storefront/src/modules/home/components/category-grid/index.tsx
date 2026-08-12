import Image from "next/image"
import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getTranslations } from "@lib/i18n/get-translations"

const MAX_CATEGORIES = 6

/**
 * Category imagery is keyed off handle/name keywords rather than a fixed list,
 * because categories are authored in the admin and can change at any time.
 * Anything unmatched falls back to a tinted panel — never a broken image.
 */
const CATEGORY_IMAGES: { match: RegExp; src: string }[] = [
  { match: /serum|oil|face/, src: "/images/yezi/category-serum-face-oil.webp" },
  {
    match: /shower|shampoo|hair|wash|gel/,
    src: "/images/yezi/category-shower-gel-shampoo.webp",
  },
  {
    match: /lotion|cream|soap|body|skin/,
    src: "/images/yezi/category-lotion-cream-soap.webp",
  },
]

const resolveCategoryImage = (name: string, handle: string): string | null => {
  const haystack = `${handle} ${name}`.toLowerCase()
  return CATEGORY_IMAGES.find(({ match }) => match.test(haystack))?.src ?? null
}

/**
 * Product-category grid — the bridge between the corporate site and the shop.
 *
 * Renders real Medusa top-level categories (children are reachable from the
 * category page itself), each linking straight into the storefront so a visitor
 * reading company copy is one click from an orderable catalogue.
 */
export default async function CategoryGrid() {
  const [t, categories] = await Promise.all([
    getTranslations("categories"),
    listCategories(),
  ])

  const topLevel = (categories ?? [])
    .filter((category) => !category.parent_category)
    .slice(0, MAX_CATEGORIES)

  return (
    <section
      id="products"
      className="border-y border-[var(--shop-border)] bg-[var(--shop-surface)]"
    >
      <div className="content-container py-16 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="shop-eyebrow">{t("eyebrow")}</span>
          <h2 className="shop-display mt-4 text-3xl font-bold text-[var(--shop-ink)] sm:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-4 text-base leading-7 text-[var(--shop-muted)]">
            {t("subtitle")}
          </p>
        </div>

        {topLevel.length === 0 ? (
          <div className="mt-12 text-center">
            <p className="text-[var(--shop-muted)]">{t("empty")}</p>
            <LocalizedClientLink
              href="/store"
              className="shop-btn-primary mt-6"
            >
              {t("view_all")}
            </LocalizedClientLink>
          </div>
        ) : (
          <>
            <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {topLevel.map((category) => {
                const count = category.products?.length ?? 0
                const children = category.category_children ?? []
                const image = resolveCategoryImage(
                  category.name,
                  category.handle
                )

                return (
                  <li key={category.id}>
                    <LocalizedClientLink
                      href={`/categories/${category.handle}`}
                      className="shop-card group flex h-full flex-col transition-shadow duration-200 hover:shadow-[0_24px_60px_rgba(24,38,31,.13)]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-[#eef4ef] via-white to-[#e9f1eb]">
                        {image ? (
                          <Image
                            src={image}
                            alt={category.name}
                            fill
                            loading="lazy"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                          />
                        ) : (
                          <span
                            aria-hidden
                            className="shop-display absolute bottom-4 left-5 text-5xl font-bold text-[var(--shop-accent)] opacity-20 transition-opacity duration-200 group-hover:opacity-35"
                          >
                            {category.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col p-6">
                        <h3 className="shop-display text-xl font-bold text-[var(--shop-ink)] transition-colors group-hover:text-[var(--shop-accent)]">
                          {category.name}
                        </h3>

                        {children.length > 0 && (
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--shop-muted)]">
                            {children.map((child) => child.name).join(" · ")}
                          </p>
                        )}

                        <div className="mt-auto flex items-center justify-between pt-5">
                          <span className="shop-tabular text-xs font-semibold text-[var(--shop-muted)]">
                            {t(count === 1 ? "count_one" : "count_other", {
                              count,
                            })}
                          </span>
                          <span className="text-xs font-bold text-[var(--shop-accent)]">
                            {t("browse")}
                          </span>
                        </div>
                      </div>
                    </LocalizedClientLink>
                  </li>
                )
              })}
            </ul>

            <div className="mt-10 text-center">
              <LocalizedClientLink href="/store" className="shop-btn-ghost">
                {t("view_all")}
              </LocalizedClientLink>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
