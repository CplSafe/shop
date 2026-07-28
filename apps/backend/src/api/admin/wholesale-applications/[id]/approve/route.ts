import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { linkCustomersToCustomerGroupWorkflow } from "@medusajs/medusa/core-flows";
import { WHOLESALE_MODULE } from "../../../../../modules/wholesale";
import WholesaleModuleService from "../../../../../modules/wholesale/service";

const WHOLESALE_GROUP = "Wholesale";

/**
 * POST /admin/wholesale-applications/:id/approve
 *
 * Approves an application and adds the applicant to the Wholesale customer
 * group, which unlocks negotiated pricing for them across the store.
 */
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const id = req.params.id;
  const reviewerId = req.auth_context?.actor_id ?? null;

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const wholesaleService: WholesaleModuleService =
    req.scope.resolve(WHOLESALE_MODULE);

  const application = await wholesaleService
    .retrieveWholesaleApplication(id)
    .catch(() => null);
  if (!application) {
    res.status(404).json({ message: "Application not found." });
    return;
  }

  // Find the Wholesale customer group.
  const { data: groups } = await query.graph({
    entity: "customer_group",
    fields: ["id", "name"],
    filters: { name: WHOLESALE_GROUP },
  });
  const wholesaleGroup = groups[0];
  if (!wholesaleGroup) {
    res.status(500).json({
      message: `Customer group "${WHOLESALE_GROUP}" not found. Run the B2B setup script.`,
    });
    return;
  }

  // Add the customer to the Wholesale group (idempotent).
  await linkCustomersToCustomerGroupWorkflow(req.scope).run({
    input: {
      id: wholesaleGroup.id,
      add: [application.customer_id],
    },
  });

  const [updated] = await wholesaleService.updateWholesaleApplications([
    {
      id,
      status: "approved",
      reviewed_by: reviewerId,
      reviewed_at: new Date(),
    },
  ]);

  res.json({ application: updated });
}
