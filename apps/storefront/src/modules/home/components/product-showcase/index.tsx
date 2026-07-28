import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { getProductPrice } from "@lib/util/get-product-price"
import { getTranslations } from "@lib/i18n/get-translations"

/**
 * Editorial product showcase for the homepage.
 * Pulls real published products for the current region and lays them out on a
 * strict grid with tabular local-currency pricing — no template card soup.
 */
export default async function ProductShowcase({
  region,
}: {
  region: HttpTypes.StoreRegion
}) {
  const t = await getTranslations("showcase")
  const {
    response: { products },
  } = await listProducts({
    regionId: region.id,
    queryParams: { limit: 8 },
  })

  return (
    <section className="content-container py-16 lg:py-24">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-[var(--shop-line-strong)] pb-6">
        <div>
          <span className="shop-eyebrow">
            <span className="h-px w-8 bg-[var(--shop-accent)]" />
            {t("eyebrow")}
          </span>
          <h2 className="shop-display mt-3 text-3xl sm:text-4xl font-semibold text-[var(--shop-ink)]">
            {t("title")}
          </h2>
        </div>
        <LocalizedClientLink
          href="/store"
          className="text-sm font-semibold uppercase tracking-wide text-[var(--shop-ink)] hover:text-[var(--shop-accent)] transition-colors"
        >
          {t("view_all")}
        </LocalizedClientLink>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-[var(--shop-muted)]">{t("empty")}</p>
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {products.map((product) => {
            const { cheapestPrice } = getProductPrice({ product })
            return (
              <li key={product.id}>
                <LocalizedClientLink
                  href={`/products/${product.handle}`}
                  className="group block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[var(--shop-surface)] border border-[var(--shop-border)]">
                    <Thumbnail
                      thumbnail={product.thumbnail}
                      images={product.images}
                      size="full"
                      className="!rounded-none transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-3">
                    <h3 className="text-sm font-medium leading-snug text-[var(--shop-ink)]">
                      {product.title}
                    </h3>
                    {cheapestPrice && (
                      <span className="shop-tabular shrink-0 text-sm font-semibold text-[var(--shop-ink)]">
                        {cheapestPrice.calculated_price}
                      </span>
                    )}
                  </div>
                </LocalizedClientLink>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
