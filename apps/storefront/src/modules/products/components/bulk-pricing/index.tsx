import { HttpTypes } from "@medusajs/types"
import { getPriceTiers } from "@lib/data/products"
import { convertToLocale } from "@lib/util/money"
import { getTranslations } from "@lib/i18n/get-translations"

/**
 * Advertises quantity-based wholesale pricing on the product page
 * ("10+ units → ₦31,500 each"). Renders nothing when the product has no
 * quantity tiers. Data comes from /store/products/:id/price-tiers.
 */
export default async function BulkPricing({
  product,
  region,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) {
  const [tiers, t] = await Promise.all([
    getPriceTiers(product.id, region.id),
    getTranslations("product"),
  ])

  // Only meaningful when there's a real bulk tier (min_quantity > 1).
  const hasBulk = tiers.some((tier) => (tier.min_quantity ?? 0) > 1)
  if (!hasBulk) {
    return null
  }

  const bulkMin = Math.min(
    ...tiers
      .filter((tier) => (tier.min_quantity ?? 0) > 1)
      .map((tier) => tier.min_quantity as number)
  )

  const rowLabel = (tier: { min_quantity: number | null; max_quantity: number | null }) => {
    if ((tier.min_quantity ?? 0) > 1) {
      return t("bulk_from").replace("{min}", String(tier.min_quantity))
    }
    if (tier.max_quantity != null) {
      return t("bulk_upto").replace("{max}", String(tier.max_quantity))
    }
    return t("bulk_upto").replace("{max}", "")
  }

  return (
    <div className="border border-[var(--shop-border)] bg-[var(--shop-bg)]">
      <div className="border-b border-[var(--shop-border)] px-4 py-2">
        <span className="shop-eyebrow">
          <span className="h-px w-6 bg-[var(--shop-accent)]" />
          {t("bulk_title")}
        </span>
      </div>
      <ul className="divide-y divide-[var(--shop-border)]">
        {tiers.map((tier, i) => {
          const isBulk = (tier.min_quantity ?? 0) > 1
          return (
            <li
              key={i}
              className="flex items-baseline justify-between px-4 py-2.5"
            >
              <span
                className={
                  isBulk
                    ? "text-sm font-semibold text-[var(--shop-accent)]"
                    : "text-sm text-[var(--shop-muted)]"
                }
              >
                {rowLabel(tier)}
              </span>
              <span
                className={
                  isBulk
                    ? "shop-tabular text-sm font-semibold text-[var(--shop-ink)]"
                    : "shop-tabular text-sm text-[var(--shop-muted)]"
                }
              >
                {convertToLocale({
                  amount: tier.amount,
                  currency_code: tier.currency_code,
                })}{" "}
                <span className="text-xs font-normal text-[var(--shop-muted)]">
                  {t("bulk_each")}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
      <p className="px-4 py-2.5 text-xs leading-5 text-[var(--shop-muted)] border-t border-[var(--shop-border)]">
        {t("bulk_hint").replace("{min}", String(bulkMin))}
      </p>
    </div>
  )
}
