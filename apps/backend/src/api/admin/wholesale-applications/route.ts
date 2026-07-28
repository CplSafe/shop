import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { WHOLESALE_MODULE } from "../../../modules/wholesale";
import WholesaleModuleService from "../../../modules/wholesale/service";

/**
 * GET /admin/wholesale-applications?status=pending
 *
 * Lists wholesale applications for the admin review page, newest first.
 * Optional `status` filter (pending | approved | rejected).
 */
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const wholesaleService: WholesaleModuleService =
    req.scope.resolve(WHOLESALE_MODULE);

  const status = req.query.status as string | undefined;
  const filters =
    status && ["pending", "approved", "rejected"].includes(status)
      ? { status }
      : {};

  const applications = await wholesaleService.listWholesaleApplications(
    filters,
  );
  applications.sort(
    (a, b) =>
      new Date(b.created_at as unknown as string).getTime() -
      new Date(a.created_at as unknown as string).getTime(),
  );

  res.json({ applications, count: applications.length });
}
