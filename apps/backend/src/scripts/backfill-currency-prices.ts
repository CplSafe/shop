import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateProductVariantsWorkflow } from "@medusajs/medusa/core-flows";

/**
 * Backfills missing regional currency prices on product variants.
 *
 * Run with:  npx medusa exec ./src/scripts/backfill-currency-prices.ts
 *
 * Medusa resolves a price in the cart's region currency when adding an item;
 * a variant with no price in that currency makes add-to-cart fail with an
 * opaque "unknown_error". Products imported with only EUR/USD prices (the
 * Medusa demo catalogue) therefore cannot be bought in any African region.
 *
 * This converts each variant's existing base price into every supported
 * currency and writes back the full set. Existing prices in a currency are
 * preserved — only missing ones are added, so re-running is safe.
 */

// Units of each currency per 1 USD. Rounded to sane retail figures rather than
// live FX: these are catalogue prices, not a currency converter.
const RATES_PER_USD: Record<string, number> = {
  usd: 1,
  ngn: 1500,
  ghs: 12,
  xof: 600,
  kes: 130,
  tzs: 2500,
  ugx: 3700,
};

// Prices already stored in these currencies are used as the conversion base,
// in this order of preference.
const BASE_CURRENCIES = ["usd", "eur"];

// EUR is not a store currency but the demo data uses it; treat it as ~1.08 USD.
const EUR_TO_USD = 1.08;

/**
 * Prices come from the pricing module rather than the variant table, so they
 * are not part of the inferred ProductVariant shape.
 */
type VariantWithPrices = {
  id: string;
  sku?: string | null;
  title?: string | null;
  product?: { title?: string | null } | null;
  prices?: {
    amount: number;
    currency_code: string;
    min_quantity?: number | null;
    max_quantity?: number | null;
  }[];
};

/** Rounds to a tidy retail figure appropriate to the currency's magnitude. */
function roundForCurrency(amount: number, currency: string): number {
  if (currency === "usd" || currency === "ghs") {
    // Small-denomination currencies: keep 2 decimals.
    return Math.round(amount * 100) / 100;
  }
  if (amount >= 10000) {
    return Math.round(amount / 500) * 500;
  }
  if (amount >= 1000) {
    return Math.round(amount / 100) * 100;
  }
  return Math.round(amount / 10) * 10;
}

export default async function backfillCurrencyPrices({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: [
      "id",
      "sku",
      "title",
      "product.title",
      "prices.id",
      "prices.amount",
      "prices.currency_code",
      "prices.min_quantity",
      "prices.max_quantity",
    ],
  });

  logger.info(`Inspecting ${variants.length} variant(s)...`);

  const targets = Object.keys(RATES_PER_USD);
  const updates: { id: string; prices: Record<string, unknown>[] }[] = [];
  let skipped = 0;

  for (const variant of variants as VariantWithPrices[]) {
    const existing = variant.prices ?? [];

    // Tiered prices (quantity brackets) are deliberately left alone — rebuilding
    // them here would flatten a pricing structure this script cannot infer.
    const hasTiers = existing.some(
      (p) => p.min_quantity != null || p.max_quantity != null,
    );
    if (hasTiers) {
      logger.info(`  skip ${variant.sku ?? variant.id}: has tiered prices`);
      skipped++;
      continue;
    }

    const have = new Set(existing.map((p) => p.currency_code));
    const missing = targets.filter((c) => !have.has(c));
    if (missing.length === 0) {
      skipped++;
      continue;
    }

    // Establish a USD base from whichever reference currency is present.
    let baseUsd: number | undefined;
    for (const base of BASE_CURRENCIES) {
      const price = existing.find((p) => p.currency_code === base);
      if (price) {
        baseUsd = base === "eur" ? price.amount * EUR_TO_USD : price.amount;
        break;
      }
    }

    if (baseUsd === undefined) {
      logger.warn(
        `  skip ${variant.sku ?? variant.id}: no USD/EUR price to convert from`,
      );
      skipped++;
      continue;
    }

    // Keep every existing price, add only the missing currencies.
    const prices: Record<string, unknown>[] = existing.map((p) => ({
      amount: p.amount,
      currency_code: p.currency_code,
    }));

    for (const currency of missing) {
      prices.push({
        amount: roundForCurrency(baseUsd * RATES_PER_USD[currency], currency),
        currency_code: currency,
      });
    }

    updates.push({ id: variant.id, prices });
    logger.info(
      `  ${variant.product?.title ?? "?"} / ${variant.title} ` +
        `(${variant.sku ?? "no sku"}): +${missing.join(", ")}`,
    );
  }

  if (updates.length === 0) {
    logger.info(`Nothing to do — ${skipped} variant(s) already priced.`);
    return;
  }

  await updateProductVariantsWorkflow(container).run({
    input: { product_variants: updates },
  });

  logger.info(
    `✅ Backfilled prices on ${updates.length} variant(s); ${skipped} skipped.`,
  );
}
