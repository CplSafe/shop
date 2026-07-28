import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
} from "@medusajs/framework/utils";
import {
  deleteProductsWorkflow,
  deleteProductCategoriesWorkflow,
  deleteCollectionsWorkflow,
  updateStoresWorkflow,
  updateSalesChannelsWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Removes all Medusa demo/seed catalog data and rebrands the store to "weiyi".
 *
 * Run with:  npx medusa exec ./src/scripts/reset-brand.ts
 *
 * Idempotent: deletes any remaining demo products/categories/collections and
 * (re)applies the weiyi store, sales-channel, and warehouse names.
 */

const BRAND = "weiyi";

export default async function resetBrand({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const stockLocationModule = container.resolve(Modules.STOCK_LOCATION);

  // ---------------------------------------------------------------------------
  // 1. Delete all demo products
  // ---------------------------------------------------------------------------
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "title"],
  });
  if (products.length > 0) {
    logger.info(
      `Deleting ${products.length} product(s): ${products
        .map((p: { title: string }) => p.title)
        .join(", ")}`,
    );
    await deleteProductsWorkflow(container).run({
      input: { ids: products.map((p: { id: string }) => p.id) },
    });
  } else {
    logger.info("No products to delete.");
  }

  // ---------------------------------------------------------------------------
  // 2. Delete all demo categories
  // ---------------------------------------------------------------------------
  const { data: categories } = await query.graph({
    entity: "product_category",
    fields: ["id", "name"],
  });
  if (categories.length > 0) {
    logger.info(
      `Deleting ${categories.length} categor(y/ies): ${categories
        .map((c: { name: string }) => c.name)
        .join(", ")}`,
    );
    await deleteProductCategoriesWorkflow(container).run({
      input: categories.map((c: { id: string }) => c.id),
    });
  } else {
    logger.info("No categories to delete.");
  }

  // ---------------------------------------------------------------------------
  // 3. Delete all demo collections
  // ---------------------------------------------------------------------------
  const { data: collections } = await query.graph({
    entity: "product_collection",
    fields: ["id", "title"],
  });
  if (collections.length > 0) {
    logger.info(`Deleting ${collections.length} collection(s).`);
    await deleteCollectionsWorkflow(container).run({
      input: { ids: collections.map((c: { id: string }) => c.id) },
    });
  } else {
    logger.info("No collections to delete.");
  }

  // ---------------------------------------------------------------------------
  // 4. Rebrand store
  // ---------------------------------------------------------------------------
  const { data: stores } = await query.graph({
    entity: "store",
    fields: ["id", "name"],
  });
  if (stores[0]) {
    await updateStoresWorkflow(container).run({
      input: {
        selector: { id: stores[0].id },
        update: { name: BRAND },
      },
    });
    logger.info(`Store renamed to "${BRAND}".`);
  }

  // ---------------------------------------------------------------------------
  // 5. Rebrand default sales channel
  // ---------------------------------------------------------------------------
  const { data: salesChannels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  const defaultChannel = salesChannels.find(
    (c: { name: string }) =>
      c.name === "Default Sales Channel" || c.name === `${BRAND} Store`,
  );
  if (defaultChannel) {
    await updateSalesChannelsWorkflow(container).run({
      input: {
        selector: { id: defaultChannel.id },
        update: { name: `${BRAND} Store` },
      },
    });
    logger.info(`Sales channel renamed to "${BRAND} Store".`);
  }

  // ---------------------------------------------------------------------------
  // 6. Rename warehouse (European Warehouse -> weiyi Warehouse)
  // ---------------------------------------------------------------------------
  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });
  const warehouse = locations[0];
  if (warehouse) {
    await stockLocationModule.updateStockLocations(
      { id: warehouse.id },
      { name: `${BRAND} Warehouse` },
    );
    logger.info(`Warehouse renamed to "${BRAND} Warehouse".`);
  }

  logger.info("✅ Demo data cleared and store rebranded to weiyi.");
}
