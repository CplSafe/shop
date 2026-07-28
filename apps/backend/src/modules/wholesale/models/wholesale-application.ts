import { model } from "@medusajs/framework/utils";

/**
 * A customer's request to be recognized as a wholesale (B2B) buyer.
 * When staff approve it, the customer is added to the Wholesale group and
 * gains negotiated pricing across the store.
 */
const WholesaleApplication = model.define("wholesale_application", {
  id: model.id({ prefix: "whapp" }).primaryKey(),
  customer_id: model.text(),
  email: model.text(),
  company_name: model.text(),
  contact_name: model.text().nullable(),
  phone: model.text().nullable(),
  expected_volume: model.text().nullable(),
  note: model.text().nullable(),
  status: model.enum(["pending", "approved", "rejected"]).default("pending"),
  reviewed_by: model.text().nullable(),
  reviewed_at: model.dateTime().nullable(),
});

export default WholesaleApplication;
