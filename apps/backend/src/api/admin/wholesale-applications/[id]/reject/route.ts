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
 * POST /admin/wholesale-applications/:id/reject
 *
 * Rejects an application. If the applicant was previously approved and is in
 * the Wholesale group, they are removed from it (reverting to retail pricing).
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

  // If they were previously in the Wholesale group, remove them.
  const { data: groups } = await query.graph({
    entity: "customer_group",
    fields: ["id", "name"],
    filters: { name: WHOLESALE_GROUP },
  });
  const wholesaleGroup = groups[0];
  if (wholesaleGroup && application.status === "approved") {
    await linkCustomersToCustomerGroupWorkflow(req.scope).run({
      input: {
        id: wholesaleGroup.id,
        remove: [application.customer_id],
      },
    });
  }

  const [updated] = await wholesaleService.updateWholesaleApplications([
    {
      id,
      status: "rejected",
      reviewed_by: reviewerId,
      reviewed_at: new Date(),
    },
  ]);

  res.json({ application: updated });
}
