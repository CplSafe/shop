import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getTranslations } from "@lib/i18n/get-translations"
import { getStoreName, getWhatsAppNumber } from "@lib/util/env"

const MAX_FOOTER_CATEGORIES = 5

export default async function Footer() {
  const storeName = getStoreName()
  const whatsAppNumber = getWhatsAppNumber()
  const [categories, t, tNav, tInquiry] = await Promise.all([
    listCategories(),
    getTranslations("footer"),
    getTranslations("nav"),
    getTranslations("inquiry"),
  ])

  const topCategories = (categories ?? [])
    .filter((category) => !category.parent_category)
    .slice(0, MAX_FOOTER_CATEGORIES)

  const quickLinks = [
    { href: "/store", label: tNav("all_products") },
    { href: "/#services", label: tNav("services") },
    { href: "/#factory", label: tNav("factory") },
    { href: "/#contact", label: tNav("inquiry") },
  ]

  const markets = [
    t("market_nigeria"),
    t("market_kenya"),
    t("market_togo"),
  ]

  return (
    <footer className="bg-[var(--shop-deep)] text-[#dfe8e1]">
      <div className="content-container py-14 lg:py-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {/* Brand */}
          <div>
            <LocalizedClientLink href="/">
              <span className="shop-display block text-2xl font-bold uppercase leading-none text-white">
                {storeName}
              </span>
              <span className="mt-1.5 block text-[9px] font-medium uppercase tracking-[0.16em] text-[#a4b2aa]">
                {tNav("company_tagline")}
              </span>
            </LocalizedClientLink>
            <p className="mt-4 max-w-xs text-sm leading-6 text-[#bfd0c6]">
              {t("about_blurb")}
            </p>
          </div>

          {/* Quick links + real categories */}
          <div>
            <h4 className="shop-display text-base font-bold text-white">
              {t("quick_links")}
            </h4>
            <ul className="mt-4 space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <LocalizedClientLink
                    href={link.href}
                    className="text-sm text-[#bfd0c6] transition-colors hover:text-white"
                  >
                    {link.label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="shop-display text-base font-bold text-white">
              {t("categories")}
            </h4>
            {topCategories.length > 0 ? (
              <ul className="mt-4 space-y-2" data-testid="footer-categories">
                {topCategories.map((category) => (
                  <li key={category.id}>
                    <LocalizedClientLink
                      href={`/categories/${category.handle}`}
                      className="text-sm text-[#bfd0c6] transition-colors hover:text-white"
                      data-testid="category-link"
                    >
                      {category.name}
                    </LocalizedClientLink>
                  </li>
                ))}
              </ul>
            ) : (
              <ul className="mt-4 space-y-2">
                {markets.map((market) => (
                  <li key={market} className="text-sm text-[#bfd0c6]">
                    {market}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Contact */}
          <div>
            <h4 className="shop-display text-base font-bold text-white">
              {t("contact")}
            </h4>
            <ul className="mt-4 space-y-2 text-sm text-[#bfd0c6]">
              <li>{t("factory_area")}</li>
              <li>{t("office")}</li>
              <li>
                <span className="block text-[#a4b2aa]">
                  {t("regional_markets")}
                </span>
                {markets.join(" · ")}
              </li>
              {whatsAppNumber && (
                <li>
                  <a
                    href={`https://wa.me/${whatsAppNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-white"
                  >
                    {tInquiry("info_whatsapp", { number: whatsAppNumber })}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-[#9db0a4]">
          © {new Date().getFullYear()} {storeName} International Cosmetics
          Company. {t("rights")}
        </div>
      </div>
    </footer>
  )
}
