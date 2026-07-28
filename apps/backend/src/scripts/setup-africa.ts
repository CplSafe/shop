import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import {
  createRegionsWorkflow,
  createTaxRegionsWorkflow,
  deleteRegionsWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

/**
 * Idempotent setup of African regions, currencies, tax regions, and shipping
 * service zones for the shop.
 *
 * Run with:  npx medusa exec ./src/scripts/setup-africa.ts
 *
 * Safe to re-run: it skips regions/tax-regions/service-zones that already exist.
 */

// ISO-2 country codes grouped by target region.
const WEST_AFRICA_ANGLOPHONE = ["ng", "gh"]; // Nigeria (NGN), Ghana (GHS)
const WEST_AFRICA_CFA = ["ci", "sn", "bj", "tg", "bf", "ml"]; // Côte d'Ivoire, Senegal, Benin, Togo, Burkina Faso, Mali (XOF)
const EAST_AFRICA = ["ke", "tz", "ug"]; // Kenya (KES), Tanzania (TZS), Uganda (UGX)
const INTERNATIONAL = ["us", "gb"]; // fallback / diaspora buyers (USD)

const ALL_COUNTRIES = [
  ...WEST_AFRICA_ANGLOPHONE,
  ...WEST_AFRICA_CFA,
  ...EAST_AFRICA,
  ...INTERNATIONAL,
];

// Store must support every currency used by any region.
const SUPPORTED_CURRENCIES: { currency_code: string; is_default?: boolean }[] =
  [
    { currency_code: "ngn", is_default: true }, // primary market
    { currency_code: "ghs" },
    { currency_code: "xof" },
    { currency_code: "kes" },
    { currency_code: "tzs" },
    { currency_code: "ugx" },
    { currency_code: "usd" },
  ];

interface RegionSpec {
  name: string;
  currency_code: string;
  countries: string[];
}

const REGION_SPECS: RegionSpec[] = [
  {
    name: "West Africa (Anglophone)",
    currency_code: "ngn",
    countries: WEST_AFRICA_ANGLOPHONE,
  },
  {
    name: "West Africa (Francophone / CFA)",
    currency_code: "xof",
    countries: WEST_AFRICA_CFA,
  },
  {
    name: "East Africa",
    currency_code: "kes",
    countries: EAST_AFRICA,
  },
  {
    name: "International",
    currency_code: "usd",
    countries: INTERNATIONAL,
  },
];

export default async function setupAfrica({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const storeModule = container.resolve(Modules.STORE);
  const fulfillmentModule = container.resolve(Modules.FULFILLMENT);

  // ---------------------------------------------------------------------------
  // 1. Store supported currencies
  // ---------------------------------------------------------------------------
  logger.info("Updating store supported currencies...");
  const [store] = await storeModule.listStores({}, { take: 1 });
  if (!store) {
    throw new Error("No store found — run the initial seed first.");
  }
  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: SUPPORTED_CURRENCIES,
      },
    },
  });
  logger.info(
    `Store currencies set: ${SUPPORTED_CURRENCIES.map((c) => c.currency_code).join(", ")}`,
  );

  // ---------------------------------------------------------------------------
  // 2. Remove the seeded European region (frees its countries for reuse)
  // ---------------------------------------------------------------------------
  const targetRegionNames = new Set(REGION_SPECS.map((s) => s.name));
  const { data: allRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
  });
  const staleRegions = allRegions.filter(
    (r: { name: string }) => !targetRegionNames.has(r.name),
  );
  if (staleRegions.length > 0) {
    logger.info(
      `Removing non-African regions: ${staleRegions
        .map((r: { name: string }) => r.name)
        .join(", ")}`,
    );
    await deleteRegionsWorkflow(container).run({
      input: { ids: staleRegions.map((r: { id: string }) => r.id) },
    });
  }

  // ---------------------------------------------------------------------------
  // 3. Regions (skip any that already exist by name)
  // ---------------------------------------------------------------------------
  const { data: existingRegions } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
  });
  const existingRegionNames = new Set(
    existingRegions.map((r: { name: string }) => r.name),
  );

  const regionsToCreate = REGION_SPECS.filter(
    (spec) => !existingRegionNames.has(spec.name),
  );

  if (regionsToCreate.length > 0) {
    logger.info(
      `Creating regions: ${regionsToCreate.map((r) => r.name).join(", ")}`,
    );
    await createRegionsWorkflow(container).run({
      input: {
        regions: regionsToCreate.map((spec) => ({
          name: spec.name,
          currency_code: spec.currency_code,
          countries: spec.countries,
          // Payment providers wired in the payments phase (P2).
          payment_providers: ["pp_system_default"],
        })),
      },
    });
  } else {
    logger.info(
      "All African regions already exist — skipping region creation.",
    );
  }

  // ---------------------------------------------------------------------------
  // 3. Tax regions (one per country, skip existing)
  // ---------------------------------------------------------------------------
  const { data: existingTaxRegions } = await query.graph({
    entity: "tax_region",
    fields: ["id", "country_code"],
  });
  const existingTaxCountries = new Set(
    existingTaxRegions.map((t: { country_code: string }) => t.country_code),
  );
  const taxCountriesToCreate = ALL_COUNTRIES.filter(
    (c) => !existingTaxCountries.has(c),
  );

  if (taxCountriesToCreate.length > 0) {
    logger.info(`Creating tax regions for: ${taxCountriesToCreate.join(", ")}`);
    await createTaxRegionsWorkflow(container).run({
      input: taxCountriesToCreate.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    });
  } else {
    logger.info("All tax regions already exist — skipping.");
  }

  // ---------------------------------------------------------------------------
  // 4. Shipping: add an "Africa" service zone to the existing fulfillment set
  // ---------------------------------------------------------------------------
  const { data: fulfillmentSets } = await query.graph({
    entity: "fulfillment_set",
    fields: ["id", "name", "service_zones.id", "service_zones.name"],
  });
  const fulfillmentSet = fulfillmentSets[0];

  if (!fulfillmentSet) {
    logger.warn(
      "No fulfillment set found — skipping service zone. Re-run after warehouse setup.",
    );
  } else {
    const hasAfricaZone = (fulfillmentSet.service_zones ?? []).some(
      (z: { name: string }) => z.name === "Africa",
    );
    if (hasAfricaZone) {
      logger.info("Africa service zone already exists — skipping.");
    } else {
      logger.info("Creating Africa service zone...");
      await fulfillmentModule.createServiceZones({
        fulfillment_set_id: fulfillmentSet.id,
        name: "Africa",
        geo_zones: ALL_COUNTRIES.map((country_code) => ({
          country_code,
          type: "country" as const,
        })),
      });
      logger.info("Africa service zone created.");
    }
  }

  logger.info("✅ African region setup complete.");
}
