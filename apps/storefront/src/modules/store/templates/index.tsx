import { Suspense } from "react"

import { listCategories } from "@lib/data/categories"
import { OptionValueIds } from "@lib/util/product-option-filters"
import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { CategoryFilterOption } from "@modules/store/components/refinement-list/category-filter"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import { getTranslations } from "@lib/i18n/get-translations"

import PaginatedProducts from "./paginated-products"

const StoreTemplate = async ({
  sortBy,
  page,
  countryCode,
  optionValueIds,
  categoryId,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
  optionValueIds?: OptionValueIds
  categoryId?: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"
  const [t, tCategories, categories] = await Promise.all([
    getTranslations("store"),
    getTranslations("categories"),
    listCategories(),
  ])

  const filterCategories: CategoryFilterOption[] = (categories ?? [])
    .filter((category) => !category.parent_category)
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

  return (
    <div
      className="flex flex-col small:flex-row small:items-start py-6 content-container"
      data-testid="category-container"
    >
      <RefinementList
        sortBy={sort}
        categories={filterCategories}
        categoryLabels={{
          heading: tCategories("filter_heading"),
          all: tCategories("filter_all"),
        }}
      />
      <div className="w-full">
        <div className="mb-8 text-2xl-semi">
          <h1 data-testid="store-page-title">{t("title")}</h1>
        </div>
        {/* Re-suspend when the filter changes so the skeleton shows on refetch. */}
        <Suspense
          key={`${sort}-${pageNumber}-${categoryId ?? "all"}`}
          fallback={<SkeletonProductGrid />}
        >
          <PaginatedProducts
            sortBy={sort}
            page={pageNumber}
            countryCode={countryCode}
            optionValueIds={optionValueIds}
            categoryId={categoryId}
          />
        </Suspense>
      </div>
    </div>
  )
}

export default StoreTemplate
