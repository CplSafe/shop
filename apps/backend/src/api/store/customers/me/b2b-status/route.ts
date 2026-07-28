import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";

const WHOLESALE_GROUP = "Wholesale";

/**
 * GET /store/customers/me/b2b-status
 *
 * Returns whether the currently authenticated customer belongs to the
 * Wholesale customer group. The storefront uses this to switch between the
 * retail and wholesale (B2B) experience.
 *
 * Requires an authenticated customer (auth middleware populates auth_context).
 */
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const customerId = req.auth_context?.actor_id;

  if (!customerId) {
    res.status(401).json({ is_b2b: false, message: "Not authenticated." });
    return;
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data } = await query.graph({
    entity: "customer",
    fields: ["id", "groups.id", "groups.name"],
    filters: { id: customerId },
  });

  const customer = data[0];
  const groups = (customer?.groups ?? []) as { name?: string }[];
  const groupNames = groups
    .map((g) => g?.name)
    .filter((n): n is string => typeof n === "string");
  const isB2B = groupNames.includes(WHOLESALE_GROUP);

  res.json({
    is_b2b: isB2B,
    groups: groupNames,
  });
}
