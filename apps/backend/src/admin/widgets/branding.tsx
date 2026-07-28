import { defineWidgetConfig } from "@medusajs/admin-sdk";
import logo from "../assets/shop-logo.png";
import "../assets/branding.css";

/**
 * shop admin branding.
 *
 * The CSS import swaps the Medusa marks on every auth screen (login,
 * reset-password, invite) — see ../assets/branding.css.
 *
 * The module-scope block below runs once when the admin app boots on ANY
 * route (widget modules are statically bundled), so the favicon is branded
 * everywhere without forking the dashboard.
 */
if (typeof document !== "undefined") {
  let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!icon) {
    icon = document.createElement("link");
    icon.rel = "icon";
    document.head.appendChild(icon);
  }
  icon.type = "image/png";
  icon.href = logo;
}

const BrandingWidget = () => null;

export const config = defineWidgetConfig({
  zone: "login.before",
});

export default BrandingWidget;
