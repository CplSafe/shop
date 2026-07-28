import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { updateRegionsWorkflow } from "@medusajs/medusa/core-flows";

/**
 * Links available payment providers to every region.
 *
 * Run with:  npx medusa exec ./src/scripts/link-payment-providers.ts
 *
 * Idempotent: sets each region's payment_providers to the full available set
 * (system default for manual/COD/bank-transfer + any credential-gated
 * providers such as Paystack that are currently registered).
 */

export default async function linkPaymentProviders({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);

  // Discover which providers are actually registered & enabled.
  const { data: providers } = await query.graph({
    entity: "payment_provider",
    fields: ["id", "is_enabled"],
  });
  const enabledProviderIds = providers
    .filter((p: { is_enabled: boolean }) => p.is_enabled)
    .map((p: { id: string }) => p.id);

  if (enabledProviderIds.length === 0) {
    logger.warn("No enabled payment providers found. Nothing to link.");
    return;
  }
  logger.info(`Enabled providers: ${enabledProviderIds.join(", ")}`);

  const { data: regions } = await query.graph({
    entity: "region",
    fields: ["id", "name"],
  });

  for (const region of regions) {
    await updateRegionsWorkflow(container).run({
      input: {
        selector: { id: region.id },
        update: {
          payment_providers: enabledProviderIds,
        },
      },
    });
    logger.info(
      `Region "${region.name}" → [${enabledProviderIds.join(", ")}]`,
    );
  }

  logger.info("✅ Payment providers linked to all regions.");
}
