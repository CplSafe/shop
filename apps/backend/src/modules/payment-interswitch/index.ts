import { ModuleProvider, Modules } from "@medusajs/framework/utils";
import InterswitchPaymentProviderService from "./service";

export default ModuleProvider(Modules.PAYMENT, {
  services: [InterswitchPaymentProviderService],
});
