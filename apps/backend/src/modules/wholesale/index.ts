import { Module } from "@medusajs/framework/utils";
import WholesaleModuleService from "./service";

export const WHOLESALE_MODULE = "wholesale";

export default Module(WHOLESALE_MODULE, {
  service: WholesaleModuleService,
});
