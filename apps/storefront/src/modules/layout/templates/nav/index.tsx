import { Suspense } from "react"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { listCategories } from "@lib/data/categories"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"
import LanguageSwitcher from "@modules/layout/components/language-switcher"
import CategoryMenu, {
  CategoryMenuItem,
} from "@modules/layout/components/category-menu"
import { getActiveLocale, getTranslations } from "@lib/i18n/get-translations"
import { getStoreName } from "@lib/util/env"

const MAX_MENU_CATEGORIES = 6

export default async function Nav() {
  const storeName = getStoreName()
  const [
    regions,
    locales,
    currentLocale,
    activeLocale,
    categories,
    t,
    tMenu,
    tFooter,
  ] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
    getActiveLocale(),
    listCategories(),
    getTranslations("nav"),
    getTranslations("menu"),
    getTranslations("footer"),
  ])

  const menuCategories: CategoryMenuItem[] = (categories ?? [])
    .filter((category) => !category.parent_category)
    .slice(0, MAX_MENU_CATEGORIES)
    .map((category) => ({
      id: category.id,
      name: category.name,
      handle: category.handle,
      children: (category.category_children ?? []).map((child) => ({
        id: child.id,
        name: child.name,
        handle: child.handle,
      })),
    }))

  const sideMenuLabels = {
    menu: t("menu"),
    home: tMenu("home"),
    store: tMenu("store"),
    account: tMenu("account"),
    cart: tMenu("cart"),
    rights: tFooter("rights"),
    storeName,
  }

  // Anchors resolve against the homepage so they work from any route.
  const sectionLinks = [
    { href: "/#about", label: t("about") },
    { href: "/#services", label: t("services") },
    { href: "/#factory", label: t("factory") },
    { href: "/#contact", label: t("inquiry") },
  ]

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      <header className="border-b border-[var(--shop-border)] bg-white/95 backdrop-blur-md">
        <nav className="content-container flex min-h-[4.5rem] items-center justify-between gap-4">
          {/* Mobile menu trigger */}
          <div className="flex items-center lg:hidden">
            <SideMenu
              regions={regions}
              locales={locales}
              currentLocale={currentLocale}
              labels={sideMenuLabels}
              categories={menuCategories}
              categoriesLabel={t("browse_categories")}
            />
          </div>

          <LocalizedClientLink
            href="/"
            data-testid="nav-store-link"
            className="shrink-0"
          >
            <span className="shop-display block text-2xl font-bold uppercase leading-none text-[var(--shop-accent)]">
              {storeName}
            </span>
            <span className="mt-1 hidden text-[9px] font-medium uppercase tracking-[0.16em] text-[var(--shop-muted)] sm:block">
              {t("company_tagline")}
            </span>
          </LocalizedClientLink>

          {/* Desktop primary menu */}
          <div className="hidden items-center gap-7 lg:flex">
            <CategoryMenu
              categories={menuCategories}
              labels={{
                products: t("products"),
                allProducts: t("all_products"),
                browseCategories: t("browse_categories"),
              }}
            />
            {sectionLinks.map((link) => (
              <LocalizedClientLink
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[var(--shop-ink)] transition-colors hover:text-[var(--shop-accent)]"
              >
                {link.label}
              </LocalizedClientLink>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-[var(--shop-muted)]">
            <LocalizedClientLink
              href="/account"
              data-testid="nav-account-link"
              className="hidden transition-colors hover:text-[var(--shop-accent)] small:inline"
            >
              {t("account")}
            </LocalizedClientLink>

            <LanguageSwitcher current={activeLocale} />

            <Suspense
              fallback={
                <LocalizedClientLink
                  href="/cart"
                  data-testid="nav-cart-link"
                  className="transition-colors hover:text-[var(--shop-accent)]"
                >
                  {t("cart")} (0)
                </LocalizedClientLink>
              }
            >
              <CartButton />
            </Suspense>

            <LocalizedClientLink
              href="/#contact"
              className="shop-btn-primary hidden !px-5 !py-2.5 !text-xs medium:inline-flex"
            >
              {t("get_quote")}
            </LocalizedClientLink>
          </div>
        </nav>
      </header>
    </div>
  )
}
