import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import OPayPaymentProviderService from "./service";

export default ModuleProvider(Modules.PAYMENT, {
  services: [OPayPaymentProviderService],
});
