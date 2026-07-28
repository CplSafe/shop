import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { WHOLESALE_MODULE } from "../../../modules/wholesale";
import WholesaleModuleService from "../../../modules/wholesale/service";

type SubmitBody = {
  company_name?: unknown;
  contact_name?: unknown;
  phone?: unknown;
  expected_volume?: unknown;
  note?: unknown;
};

const str = (v: unknown): string | undefined =>
  typeof v === "string" && v.trim() ? v.trim() : undefined;

/**
 * POST /store/wholesale-applications
 *
 * Submits (or re-submits) the authenticated customer's wholesale application.
 * A customer may have at most one active (pending/approved) application; a new
 * submission while pending updates the existing record.
 */
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const customerId = req.auth_context?.actor_id;
  if (!customerId) {
    res.status(401).json({ message: "Not authenticated." });
    return;
  }

  const body = (req.body ?? {}) as SubmitBody;
  const companyName = str(body.company_name);
  if (!companyName) {
    res.status(400).json({ message: "company_name is required." });
    return;
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const wholesaleService: WholesaleModuleService =
    req.scope.resolve(WHOLESALE_MODULE);

  // Resolve the customer's email for the admin list.
  const { data: customers } = await query.graph({
    entity: "customer",
    fields: ["id", "email"],
    filters: { id: customerId },
  });
  const email = (customers[0]?.email as string) ?? "";

  // Reuse an existing non-rejected application if present.
  const existing = await wholesaleService.listWholesaleApplications({
    customer_id: customerId,
  });
  const active = existing.find(
    (a) => a.status === "pending" || a.status === "approved",
  );

  const fields = {
    email,
    company_name: companyName,
    contact_name: str(body.contact_name) ?? null,
    phone: str(body.phone) ?? null,
    expected_volume: str(body.expected_volume) ?? null,
    note: str(body.note) ?? null,
  };

  let application;
  if (active) {
    [application] = await wholesaleService.updateWholesaleApplications([
      { id: active.id, ...fields },
    ]);
  } else {
    [application] = await wholesaleService.createWholesaleApplications([
      { customer_id: customerId, status: "pending", ...fields },
    ]);
  }

  res.json({ application });
}
