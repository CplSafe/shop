"use client"

import { useEffect, useRef, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export type CategoryMenuItem = {
  id: string
  name: string
  handle: string
  children: { id: string; name: string; handle: string }[]
}

type CategoryMenuProps = {
  categories: CategoryMenuItem[]
  labels: {
    products: string
    allProducts: string
    browseCategories: string
  }
}

const CLOSE_DELAY_MS = 120

/**
 * "Products" nav item with a hover/focus category dropdown.
 *
 * Hover is a convenience, not the only route: the trigger is a real link to
 * /store, the panel opens on keyboard focus, and Escape closes it — so the
 * catalogue stays reachable without a pointer.
 */
export default function CategoryMenu({
  categories,
  labels,
}: CategoryMenuProps) {
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current)
      closeTimer.current = null
    }
  }

  // Small grace period stops the panel flickering shut while the pointer
  // travels from the trigger to the panel.
  const scheduleClose = () => {
    cancelClose()
    closeTimer.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
  }

  useEffect(() => cancelClose, [])

  useEffect(() => {
    if (!open) {
      return
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => document.removeEventListener("keydown", onKeyDown)
  }, [open])

  if (categories.length === 0) {
    return (
      <LocalizedClientLink
        href="/store"
        className="text-sm font-medium text-[var(--shop-ink)] transition-colors hover:text-[var(--shop-accent)]"
      >
        {labels.products}
      </LocalizedClientLink>
    )
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose()
        setOpen(true)
      }}
      onMouseLeave={scheduleClose}
      onFocus={() => {
        cancelClose()
        setOpen(true)
      }}
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget as Node)) {
          setOpen(false)
        }
      }}
    >
      <LocalizedClientLink
        href="/store"
        aria-expanded={open}
        aria-haspopup="true"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--shop-ink)] transition-colors hover:text-[var(--shop-accent)]"
      >
        {labels.products}
        <span
          aria-hidden
          className={`text-[10px] transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </LocalizedClientLink>

      {open && (
        <div
          role="group"
          aria-label={labels.browseCategories}
          className="absolute left-1/2 top-full z-50 w-[min(46rem,88vw)] -translate-x-1/2 pt-4"
        >
          <div className="shop-card p-6">
            <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3">
              {categories.map((category) => (
                <div key={category.id}>
                  <LocalizedClientLink
                    href={`/categories/${category.handle}`}
                    className="shop-display block text-sm font-bold text-[var(--shop-ink)] transition-colors hover:text-[var(--shop-accent)]"
                    onClick={() => setOpen(false)}
                  >
                    {category.name}
                  </LocalizedClientLink>

                  {category.children.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {category.children.map((child) => (
                        <li key={child.id}>
                          <LocalizedClientLink
                            href={`/categories/${child.handle}`}
                            className="block text-sm text-[var(--shop-muted)] transition-colors hover:text-[var(--shop-accent)]"
                            onClick={() => setOpen(false)}
                          >
                            {child.name}
                          </LocalizedClientLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-5 border-t border-[var(--shop-border)] pt-4">
              <LocalizedClientLink
                href="/store"
                className="text-xs font-bold text-[var(--shop-accent)] transition-colors hover:text-[var(--shop-accent-strong)]"
                onClick={() => setOpen(false)}
              >
                {labels.allProducts} <span aria-hidden>→</span>
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
