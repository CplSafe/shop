"use client"

export type CategoryFilterOption = {
  id: string
  name: string
  handle: string
  children: { id: string; name: string; handle: string }[]
}

type CategoryFilterProps = {
  categories: CategoryFilterOption[]
  /** Currently selected category id, when the store page is filtered. */
  selectedId?: string
  labels: { heading: string; all: string }
  onSelect: (categoryId: string | null) => void
}

const itemClass =
  "block w-full text-left text-sm transition-colors hover:text-[var(--shop-accent)]"

/**
 * Category filter for the store listing sidebar.
 *
 * Selection is written to the URL (`?categoryId=`) by the parent, matching the
 * existing sort/option filters, so filtered views stay shareable and survive a
 * reload. Category pages remain the canonical per-category route — this is the
 * in-list refinement.
 */
export default function CategoryFilter({
  categories,
  selectedId,
  labels,
  onSelect,
}: CategoryFilterProps) {
  if (categories.length === 0) {
    return null
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-[var(--shop-ink)]">
        {labels.heading}
      </h3>

      <ul className="flex flex-col gap-2">
        <li>
          <button
            type="button"
            onClick={() => onSelect(null)}
            aria-current={!selectedId ? "true" : undefined}
            className={`${itemClass} ${
              !selectedId
                ? "font-semibold text-[var(--shop-accent)]"
                : "text-[var(--shop-muted)]"
            }`}
          >
            {labels.all}
          </button>
        </li>

        {categories.map((category) => {
          const isActive = selectedId === category.id

          return (
            <li key={category.id}>
              <button
                type="button"
                onClick={() => onSelect(category.id)}
                aria-current={isActive ? "true" : undefined}
                className={`${itemClass} ${
                  isActive
                    ? "font-semibold text-[var(--shop-accent)]"
                    : "text-[var(--shop-muted)]"
                }`}
              >
                {category.name}
              </button>

              {category.children.length > 0 && (
                <ul className="ml-3 mt-1.5 flex flex-col gap-1.5">
                  {category.children.map((child) => (
                    <li key={child.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(child.id)}
                        aria-current={
                          selectedId === child.id ? "true" : undefined
                        }
                        className={`${itemClass} ${
                          selectedId === child.id
                            ? "font-semibold text-[var(--shop-accent)]"
                            : "text-[var(--shop-muted)]"
                        }`}
                      >
                        {child.name}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
