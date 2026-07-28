import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateProductVariantsWorkflow } from "@medusajs/medusa/core-flows";

/**
 * Quantity-based wholesale pricing (tiered prices) for the sample product.
 *
 * Run with:  npx medusa exec ./src/scripts/setup-tiered-pricing.ts
 *
 * Anyone — guest or logged-in — buying >= WHOLESALE_MIN_QTY units gets the
 * wholesale unit price automatically in the cart. 1..(MIN-1) units pay retail.
 * This coexists with the "Wholesale Pricing" price list: negotiated customers
 * in the Wholesale group keep their fixed price regardless of quantity.
 *
 * Idempotent: replaces the variant's price set with the full tier matrix.
 */

const WHOLESALE_MIN_QTY = 10;

const TIERS: { currency_code: string; retail: number; wholesale: number }[] = [
  { currency_code: "ngn", retail: 45000, wholesale: 31500 },
  { currency_code: "ghs", retail: 350, wholesale: 245 },
  { currency_code: "xof", retail: 18000, wholesale: 12600 },
  { currency_code: "kes", retail: 4000, wholesale: 2800 },
  { currency_code: "tzs", retail: 75000, wholesale: 52500 },
  { currency_code: "ugx", retail: 110000, wholesale: 77000 },
  { currency_code: "usd", retail: 30, wholesale: 21 },
];

export default async function setupTieredPricing({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: ["id", "sku", "product_id"],
  });
  const variant = variants.find(
    (v: { sku?: string | null }) => v.sku === "WEIYI-OIL-20L",
  ) as { id: string; product_id: string } | undefined;

  if (!variant) {
    logger.warn("Sample variant WEIYI-OIL-20L not found — nothing to do.");
    return;
  }

  const prices = TIERS.flatMap((t) => [
    // Retail tier: quantities 1..(MIN-1)
    {
      currency_code: t.currency_code,
      amount: t.retail,
      max_quantity: WHOLESALE_MIN_QTY - 1,
    },
    // Wholesale tier: quantities >= MIN
    {
      currency_code: t.currency_code,
      amount: t.wholesale,
      min_quantity: WHOLESALE_MIN_QTY,
    },
  ]);

  await updateProductVariantsWorkflow(container).run({
    input: {
      product_variants: [
        {
          id: variant.id,
          prices,
        },
      ],
    },
  });

  logger.info(
    `✅ Tiered pricing set on WEIYI-OIL-20L: retail for 1-${WHOLESALE_MIN_QTY - 1}, wholesale for ${WHOLESALE_MIN_QTY}+ (7 currencies).`,
  );
}
