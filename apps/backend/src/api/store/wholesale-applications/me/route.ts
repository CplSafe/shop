import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { WHOLESALE_MODULE } from "../../../../modules/wholesale";
import WholesaleModuleService from "../../../../modules/wholesale/service";

const WHOLESALE_GROUP = "Wholesale";

/**
 * GET /store/wholesale-applications/me
 *
 * Returns the authenticated customer's most recent wholesale application
 * (or null) plus whether they are already an approved wholesale buyer. The
 * storefront uses this to decide between showing the application form, a
 * "pending review" notice, or an "approved" badge.
 */
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const customerId = req.auth_context?.actor_id;
  if (!customerId) {
    res.status(401).json({ message: "Not authenticated." });
    return;
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const wholesaleService: WholesaleModuleService =
    req.scope.resolve(WHOLESALE_MODULE);

  // Already in the Wholesale customer group?
  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "groups.name"],
    filters: { id: customerId },
  });
  const groups = (customers[0]?.groups ?? []) as { name?: string }[];
  const isWholesale = groups.some((g) => g?.name === WHOLESALE_GROUP);

  // Latest application for this customer.
  const applications = await wholesaleService.listWholesaleApplications({
    customer_id: customerId,
  });
  applications.sort(
    (a, b) =>
      new Date(b.created_at as unknown as string).getTime() -
      new Date(a.created_at as unknown as string).getTime(),
  );
  const application = applications[0] ?? null;

  res.json({ application, is_wholesale: isWholesale });
}
