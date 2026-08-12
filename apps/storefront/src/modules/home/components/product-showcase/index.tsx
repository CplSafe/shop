import { listProducts } from "@lib/data/products"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { getProductPrice } from "@lib/util/get-product-price"
import { getTranslations } from "@lib/i18n/get-translations"
import { buildWhatsAppLink } from "@lib/util/env"

/**
 * "Ready to ship" rail on the homepage.
 *
 * Pulls real published products for the active region. Each card offers two
 * routes: the in-store product page (primary, leads to Medusa checkout) and an
 * optional WhatsApp enquiry for bulk buyers. Card bodies use flex so the CTAs
 * stay bottom-aligned regardless of title/description length.
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
    queryParams: { limit: 5 },
  })

  return (
    <section id="ready-products" className="content-container py-16 lg:py-24">
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <span className="shop-eyebrow">{t("eyebrow")}</span>
        <h2 className="shop-display mt-4 text-3xl font-bold text-[var(--shop-ink)] sm:text-4xl">
          {t("title")}
        </h2>
        <p className="mt-4 text-base leading-7 text-[var(--shop-muted)]">
          {t("subtitle")}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="shop-card px-6 py-20 text-center">
          <p className="text-[var(--shop-muted)]">{t("empty")}</p>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {products.map((product) => {
              const { cheapestPrice } = getProductPrice({ product })
              const waLink = buildWhatsAppLink(
                t("whatsapp_message", { product: product.title })
              )

              return (
                <li key={product.id} className="shop-card flex flex-col">
                  <LocalizedClientLink
                    href={`/products/${product.handle}`}
                    className="group block bg-white p-5 pb-2"
                    tabIndex={-1}
                    aria-hidden
                  >
                    <div className="relative aspect-square overflow-hidden">
                      <Thumbnail
                        thumbnail={product.thumbnail}
                        images={product.images}
                        size="square"
                        className="!rounded-none !bg-white !p-0 !shadow-none transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    </div>
                  </LocalizedClientLink>

                  <div className="flex flex-1 flex-col p-5 pt-3">
                    <h3 className="shop-display text-lg font-bold leading-snug text-[var(--shop-ink)]">
                      <LocalizedClientLink
                        href={`/products/${product.handle}`}
                        className="transition-colors hover:text-[var(--shop-accent)]"
                      >
                        {product.title}
                      </LocalizedClientLink>
                    </h3>

                    {product.subtitle && (
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--shop-muted)]">
                        {product.subtitle}
                      </p>
                    )}

                    {cheapestPrice && (
                      <p className="shop-display shop-tabular mt-3 text-2xl font-bold text-[var(--shop-accent)]">
                        {cheapestPrice.calculated_price}
                      </p>
                    )}

                    {/* mt-auto pins the CTA block to the card foot */}
                    <div className="mt-auto space-y-2 pt-5">
                      <LocalizedClientLink
                        href={`/products/${product.handle}`}
                        className="shop-btn-primary w-full"
                      >
                        {t("buy")}
                      </LocalizedClientLink>
                      {waLink && (
                        <a
                          href={waLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shop-btn-whatsapp w-full"
                        >
                          {t("whatsapp")}
                        </a>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="mt-10 text-center">
            <LocalizedClientLink
              href="/store"
              className="text-sm font-bold text-[var(--shop-accent)] transition-colors hover:text-[var(--shop-accent-strong)]"
            >
              {t("view_all")}
            </LocalizedClientLink>
          </div>
        </>
      )}
    </section>
  )
}
