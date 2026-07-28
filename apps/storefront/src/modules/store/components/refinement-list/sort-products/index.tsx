"use client"

import FilterRadioGroup from "@modules/common/components/filter-radio-group"
import { useT } from "@lib/i18n/client"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type SortProductsProps = {
  sortBy: SortOptions
  setQueryParams: (name: string, value: string) => void
  "data-testid"?: string
}

const SortProducts = ({
  "data-testid": dataTestId,
  sortBy,
  setQueryParams,
}: SortProductsProps) => {
  const t = useT("store")
  const handleChange = (value: string) => {
    setQueryParams("sortBy", value as SortOptions)
  }

  const sortOptions = [
    { value: "created_at", label: t("sort_latest") },
    { value: "price_asc", label: t("sort_price_asc") },
    { value: "price_desc", label: t("sort_price_desc") },
  ]

  return (
    <FilterRadioGroup
      title={t("sort_by")}
      items={sortOptions}
      value={sortBy}
      handleChange={handleChange}
      data-testid={dataTestId}
    />
  )
}

export default SortProducts
