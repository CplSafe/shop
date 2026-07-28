import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  PriceListStatus,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createCustomerGroupsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createPriceListsWorkflow,
  createInventoryLevelsWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Sets up B2B/B2C structure:
 *   - Customer groups "Wholesale" and "Retail"
 *   - A demonstrable weiyi sample product priced in African currencies
 *   - A wholesale price list that overrides prices for the Wholesale group
 *
 * Run with:  npx medusa exec ./src/scripts/setup-b2b.ts
 *
 * Idempotent: skips groups/categories/products/price-lists that already exist.
 * Replace the sample product with your real catalog; the wholesale price list
 * script logic can be re-applied to any product set.
 */

const WHOLESALE_GROUP = "Wholesale";
const RETAIL_GROUP = "Retail";

// Retail (list) prices per currency for the sample product.
const RETAIL_PRICES = [
  { currency_code: "ngn", amount: 45000 },
  { currency_code: "ghs", amount: 350 },
  { currency_code: "xof", amount: 18000 },
  { currency_code: "kes", amount: 4000 },
  { currency_code: "tzs", amount: 75000 },
  { currency_code: "ugx", amount: 110000 },
  { currency_code: "usd", amount: 30 },
];

// Wholesale prices (~30% off) for the same product.
const WHOLESALE_PRICES = [
  { currency_code: "ngn", amount: 31500 },
  { currency_code: "ghs", amount: 245 },
  { currency_code: "xof", amount: 12600 },
  { currency_code: "kes", amount: 2800 },
  { currency_code: "tzs", amount: 52500 },
  { currency_code: "ugx", amount: 77000 },
  { currency_code: "usd", amount: 21 },
];

export default async function setupB2B({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  // ---------------------------------------------------------------------------
  // 1. Customer groups
  // ---------------------------------------------------------------------------
  const { data: existingGroups } = await query.graph({
    entity: "customer_group",
    fields: ["id", "name"],
  });
  const existingGroupNames = new Set(
    existingGroups.map((g: { name: string }) => g.name),
  );
  const groupsToCreate = [WHOLESALE_GROUP, RETAIL_GROUP].filter(
    (name) => !existingGroupNames.has(name),
  );
  if (groupsToCreate.length > 0) {
    logger.info(`Creating customer groups: ${groupsToCreate.join(", ")}`);
    await createCustomerGroupsWorkflow(container).run({
      input: {
        customersData: groupsToCreate.map((name) => ({ name })),
      },
    });
  } else {
    logger.info("Customer groups already exist — skipping.");
  }

  // Re-read to get the Wholesale group id.
  const { data: groups } = await query.graph({
    entity: "customer_group",
    fields: ["id", "name"],
  });
  const wholesaleGroup = groups.find(
    (g: { name: string }) => g.name === WHOLESALE_GROUP,
  );

  // ---------------------------------------------------------------------------
  // 2. Sample category + product (demonstrable; replace with real catalog)
  // ---------------------------------------------------------------------------
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  const salesChannel = salesChannels[0];

  const { data: shippingProfiles } = await query.graph({
    entity: "shipping_profile",
    fields: ["id"],
  });
  const shippingProfile = shippingProfiles[0];

  const { data: stockLocations } = await query.graph({
    entity: "stock_location",
    fields: ["id"],
  });
  const stockLocation = stockLocations[0];

  const SAMPLE_HANDLE = "sample-cooking-oil-20l";
  const { data: existingProducts } = await query.graph({
    entity: "product",
    fields: ["id", "handle"],
  });
  let sampleProductExists = existingProducts.some(
    (p: { handle: string }) => p.handle === SAMPLE_HANDLE,
  );

  if (!sampleProductExists) {
    // Ensure a category exists.
    const { data: existingCats } = await query.graph({
      entity: "product_category",
      fields: ["id", "name"],
    });
    let category: { id: string } | undefined = existingCats.find(
      (c: { name: string }) => c.name === "Food & Staples",
    );
    if (!category) {
      const { result: cats } = await createProductCategoriesWorkflow(
        container,
      ).run({
        input: {
          product_categories: [{ name: "Food & Staples", is_active: true }],
        },
      });
      category = cats[0];
    }

    logger.info("Creating sample weiyi product...");
    await createProductsWorkflow(container).run({
      input: {
        products: [
          {
            title: "weiyi Refined Cooking Oil — 20L",
            handle: SAMPLE_HANDLE,
            description:
              "Factory-direct refined cooking oil in a 20L jerrycan. Sample product — replace with your real catalog.",
            status: ProductStatus.PUBLISHED,
            category_ids: category ? [category.id] : [],
            shipping_profile_id: shippingProfile?.id,
            weight: 18000,
            options: [{ title: "Format", values: ["20L Jerrycan"] }],
            variants: [
              {
                title: "20L Jerrycan",
                sku: "WEIYI-OIL-20L",
                options: { Format: "20L Jerrycan" },
                prices: RETAIL_PRICES,
              },
            ],
            sales_channels: salesChannel ? [{ id: salesChannel.id }] : [],
          },
        ],
      },
    });

    // Stock the new inventory item.
    const { data: inventoryItems } = await query.graph({
      entity: "inventory_item",
      fields: ["id"],
    });
    if (stockLocation && inventoryItems.length > 0) {
      const { data: levels } = await query.graph({
        entity: "inventory_level",
        fields: ["inventory_item_id"],
      });
      const stockedIds = new Set(
        levels.map((l: { inventory_item_id: string }) => l.inventory_item_id),
      );
      const toStock = inventoryItems.filter(
        (i: { id: string }) => !stockedIds.has(i.id),
      );
      if (toStock.length > 0) {
        await createInventoryLevelsWorkflow(container).run({
          input: {
            inventory_levels: toStock.map((i: { id: string }) => ({
              location_id: stockLocation.id,
              inventory_item_id: i.id,
              stocked_quantity: 100000,
            })),
          },
        });
      }
    }
    sampleProductExists = true;
  } else {
    logger.info("Sample product already exists — skipping.");
  }

  // ---------------------------------------------------------------------------
  // 3. Wholesale price list (overrides prices for the Wholesale group)
  // ---------------------------------------------------------------------------
  const { data: priceLists } = await query.graph({
    entity: "price_list",
    fields: ["id", "title"],
  });
  const wholesaleListExists = priceLists.some(
    (p: { title: string }) => p.title === "Wholesale Pricing",
  );

  if (wholesaleListExists) {
    logger.info("Wholesale price list already exists — skipping.");
  } else if (!wholesaleGroup) {
    logger.warn("Wholesale group missing — cannot create price list.");
  } else {
    // Get the sample product's variant to attach prices.
    const { data: variants } = await query.graph({
      entity: "product_variant",
      fields: ["id", "sku"],
    });
    const sampleVariant = variants.find(
      (v: { sku?: string | null }) => v.sku === "WEIYI-OIL-20L",
    ) as { id: string } | undefined;

    if (!sampleVariant) {
      logger.warn("Sample variant not found — skipping price list prices.");
    } else {
      logger.info("Creating Wholesale price list...");
      await createPriceListsWorkflow(container).run({
        input: {
          price_lists_data: [
            {
              title: "Wholesale Pricing",
              description: "Negotiated wholesale prices for B2B customers.",
              status: PriceListStatus.ACTIVE,
              rules: {
                "customer.groups.id": [wholesaleGroup.id],
              },
              prices: WHOLESALE_PRICES.map((p) => ({
                variant_id: sampleVariant.id,
                currency_code: p.currency_code,
                amount: p.amount,
              })),
            },
          ],
        },
      });
    }
  }

  logger.info(
    "✅ B2B setup complete (groups, sample product, wholesale price list).",
  );
}
