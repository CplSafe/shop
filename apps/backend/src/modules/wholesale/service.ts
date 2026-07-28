import { MedusaService } from "@medusajs/framework/utils";
import WholesaleApplication from "./models/wholesale-application";

class WholesaleModuleService extends MedusaService({
  WholesaleApplication,
}) {}

export default WholesaleModuleService;
