import { HttpTypes } from "@medusajs/types"

/**
 * Customer-facing logistics tracking timeline.
 * Reads the tracking metadata written by staff in the admin and renders the
 * pipeline with the reached stages highlighted. Stage labels + the section
 * title are passed in already-translated so this stays a sync component
 * usable inside the client order template.
 */

const STAGE_CODES = [
  "processing",
  "dispatched",
  "customs",
  "out_for_delivery",
  "delivered",
] as const

type TrackingEvent = { stage: string; note?: string; at: string }
type Tracking = { current: string; history: TrackingEvent[] }

export type TrackingLabels = {
  title: string
  stages: Record<string, string>
}

export default function TrackingTimeline({
  order,
  labels,
}: {
  order: HttpTypes.StoreOrder
  labels: TrackingLabels
}) {
  const tracking = (order.metadata?.tracking ?? null) as Tracking | null

  if (!tracking) {
    return null
  }

  const STAGES = STAGE_CODES.map((code) => ({
    code,
    label: labels.stages[code] ?? code,
  }))
  const currentIndex = STAGES.findIndex((s) => s.code === tracking.current)
  const noteByStage = new Map<string, string>()
  for (const ev of tracking.history) {
    if (ev.note) noteByStage.set(ev.stage, ev.note)
  }
  const dateByStage = new Map<string, string>()
  for (const ev of tracking.history) {
    dateByStage.set(ev.stage, ev.at)
  }

  return (
    <div className="border-t border-[var(--shop-border)] pt-6 mt-6">
      <h3 className="shop-display text-lg font-semibold text-[var(--shop-ink)] mb-6">
        {labels.title}
      </h3>
      <ol className="relative">
        {STAGES.map((s, i) => {
          const reached = i <= currentIndex
          const isCurrent = i === currentIndex
          const date = dateByStage.get(s.code)
          return (
            <li key={s.code} className="flex gap-4 pb-6 last:pb-0 relative">
              {/* connector line */}
              {i < STAGES.length - 1 && (
                <span
                  className="absolute left-[7px] top-4 bottom-0 w-px"
                  style={{
                    background: reached
                      ? "var(--shop-accent)"
                      : "var(--shop-border)",
                  }}
                  aria-hidden
                />
              )}
              {/* node */}
              <span
                className="relative z-10 mt-1 h-4 w-4 shrink-0 rounded-full border-2"
                style={{
                  background: reached ? "var(--shop-accent)" : "#fff",
                  borderColor: reached
                    ? "var(--shop-accent)"
                    : "var(--shop-border)",
                }}
                aria-hidden
              />
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={
                      isCurrent
                        ? "text-sm font-semibold text-[var(--shop-ink)]"
                        : reached
                        ? "text-sm text-[var(--shop-ink)]"
                        : "text-sm text-[var(--shop-muted)]"
                    }
                  >
                    {s.label}
                  </span>
                  {date && (
                    <span className="shop-tabular text-xs text-[var(--shop-muted)]">
                      {new Date(date).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {noteByStage.get(s.code) && (
                  <p className="mt-1 text-xs text-[var(--shop-muted)]">
                    {noteByStage.get(s.code)}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
