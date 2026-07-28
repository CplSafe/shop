import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

/**
 * Notifies the storefront to purge its cache whenever catalog data changes,
 * so admin edits (images, prices, titles…) show up immediately.
 *
 * Requires STOREFRONT_URL and REVALIDATE_SECRET in the backend .env, and the
 * same REVALIDATE_SECRET in the storefront .env.local
 * (see storefront src/app/api/revalidate/route.ts).
 */
export default async function storefrontRevalidateHandler({
  container,
}: SubscriberArgs<unknown>) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);

  const storefrontUrl = process.env.STOREFRONT_URL;
  const secret = process.env.REVALIDATE_SECRET;

  if (!storefrontUrl || !secret) {
    logger.warn(
      "storefront-revalidate: STOREFRONT_URL or REVALIDATE_SECRET not set — skipping cache purge.",
    );
    return;
  }

  try {
    const res = await fetch(
      `${storefrontUrl}/api/revalidate?secret=${encodeURIComponent(secret)}`,
    );
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    logger.info("storefront-revalidate: storefront cache purged.");
  } catch (e) {
    logger.error(
      `storefront-revalidate: failed to purge storefront cache: ${
        e instanceof Error ? e.message : String(e)
      }`,
    );
  }
}

export const config: SubscriberConfig = {
  event: [
    "product.created",
    "product.updated",
    "product.deleted",
    "product-variant.created",
    "product-variant.updated",
    "product-variant.deleted",
    "product-category.created",
    "product-category.updated",
    "product-category.deleted",
    "price-list.created",
    "price-list.updated",
  ],
};
