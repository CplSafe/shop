import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

type Tier = {
  variant_id: string;
  min_quantity: number | null;
  max_quantity: number | null;
  amount: number;
  currency_code: string;
};

/**
 * GET /store/products/:id/price-tiers?region_id=...
 *
 * Returns the quantity price tiers for a product's variants in the region's
 * currency, so the storefront can advertise bulk/wholesale pricing
 * ("buy 10+ for ₦31,500 each").
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const productId = req.params.id;
  const regionId = req.query.region_id as string | undefined;

  if (!regionId) {
    res.status(400).json({ message: "region_id is required." });
    return;
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const regionModule = req.scope.resolve(Modules.REGION);

  const region = await regionModule.retrieveRegion(regionId).catch(() => null);
  if (!region) {
    res.status(404).json({ message: "Region not found." });
    return;
  }
  const currency = region.currency_code.toLowerCase();

  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: [
      "id",
      "prices.amount",
      "prices.currency_code",
      "prices.min_quantity",
      "prices.max_quantity",
    ],
    filters: { product_id: productId },
  });

  type VariantWithPrices = {
    id: string;
    prices?: {
      amount: number;
      currency_code?: string;
      min_quantity?: number | null;
      max_quantity?: number | null;
    }[];
  };

  const tiers: Tier[] = [];
  for (const v of variants as unknown as VariantWithPrices[]) {
    for (const p of v.prices ?? []) {
      if (!p || p.currency_code?.toLowerCase() !== currency) continue;
      tiers.push({
        variant_id: v.id,
        min_quantity: p.min_quantity != null ? Number(p.min_quantity) : null,
        max_quantity: p.max_quantity != null ? Number(p.max_quantity) : null,
        amount: Number(p.amount),
        currency_code: currency,
      });
    }
  }

  tiers.sort((a, b) => (a.min_quantity ?? 0) - (b.min_quantity ?? 0));

  res.json({ product_id: productId, currency_code: currency, tiers });
}
