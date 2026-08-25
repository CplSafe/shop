import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

/**
 * Reports why the storefront sees zero stock.
 *
 * Run with:  npx medusa exec ./src/scripts/diagnose-inventory.ts
 *
 * The Store API computes variant.inventory_quantity from inventory levels held
 * at stock locations that are linked to the sales channel the publishable key
 * resolves to. A break in that chain shows up as "out of stock" on the
 * storefront even when the admin shows a quantity. This script prints each
 * link so the broken one is obvious. Read-only — changes nothing.
 */
export default async function diagnoseInventory({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  const line = () => logger.info("-".repeat(64));

  // 1. Sales channels
  const { data: channels } = await query.graph({
    entity: "sales_channel",
    fields: ["id", "name"],
  });
  line();
  logger.info(`SALES CHANNELS (${channels.length})`);
  channels.forEach((c) =>
    logger.info(`  ${c.name}  [${c.id}]`),
  );

  // 2. Publishable keys -> which sales channel does the storefront actually hit?
  const { data: keys } = await query.graph({
    entity: "api_key",
    fields: ["id", "title", "token", "type", "revoked_at"],
  });
  const pubKeys = keys.filter((k) => k.type === "publishable");
  line();
  logger.info(`PUBLISHABLE KEYS (${pubKeys.length})`);
  for (const k of pubKeys) {
    const revoked = k.revoked_at ? "  *** REVOKED ***" : "";
    logger.info(`  ${k.title}  ${k.token}${revoked}`);
  }

  // 3. Stock locations
  const { data: locations } = await query.graph({
    entity: "stock_location",
    fields: ["id", "name"],
  });
  line();
  logger.info(`STOCK LOCATIONS (${locations.length})`);
  locations.forEach((l) =>
    logger.info(`  ${l.name}  [${l.id}]`),
  );
  if (locations.length === 0) {
    logger.error("  !! No stock location — inventory can never be counted.");
  }

  // 4. Inventory levels
  const { data: levels } = await query.graph({
    entity: "inventory_level",
    fields: [
      "id",
      "inventory_item_id",
      "location_id",
      "stocked_quantity",
      "reserved_quantity",
    ],
  });
  const { data: items } = await query.graph({
    entity: "inventory_item",
    fields: ["id", "sku"],
  });
  line();
  logger.info(`INVENTORY ITEMS ${items.length} | LEVELS ${levels.length}`);
  const leveledItemIds = new Set(
    levels.map((l) => l.inventory_item_id),
  );
  const unstocked = items.filter((i) => !leveledItemIds.has(i.id));
  if (unstocked.length > 0) {
    logger.error(
      `  !! ${unstocked.length} inventory item(s) have NO level at any location:`,
    );
    unstocked
      .slice(0, 20)
      .forEach((i) =>
        logger.error(`     - ${i.sku ?? i.id}`),
      );
  }
  levels.slice(0, 20).forEach((l) => {
    const sku =
      items.find((i) => i.id === l.inventory_item_id)?.sku ??
      l.inventory_item_id;
    logger.info(
      `  ${sku}  stocked=${l.stocked_quantity} reserved=${l.reserved_quantity} @ ${l.location_id}`,
    );
  });

  // 5. Variants: the values the storefront actually reads
  const { data: variants } = await query.graph({
    entity: "product_variant",
    fields: [
      "id",
      "sku",
      "title",
      "manage_inventory",
      "allow_backorder",
      "product.title",
    ],
  });
  line();
  logger.info(`VARIANTS (${variants.length})`);
  variants.slice(0, 30).forEach((v) => {
    logger.info(
      `  ${v.product?.title ?? "?"} / ${v.title}  sku=${v.sku ?? "-"}  ` +
        `manage=${v.manage_inventory} backorder=${v.allow_backorder}`,
    );
  });

  line();
  logger.info("READ THIS:");
  logger.info(
    "  A variant shows out of stock when manage_inventory=true, " +
      "allow_backorder=false, and it has no stocked quantity at a location " +
      "linked to the storefront's sales channel.",
  );
  logger.info(
    "  Check above for: unstocked inventory items, a missing " +
      "stock-location <-> sales-channel link, or a revoked publishable key.",
  );
  line();
}
