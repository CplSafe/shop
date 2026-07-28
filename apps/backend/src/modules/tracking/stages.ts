/**
 * Shared logistics tracking stages for weiyi orders.
 *
 * weiyi ships cross-border across West & East Africa, so the pipeline includes
 * a customs-clearance step that standard fulfillment status does not model.
 * The current stage + a timeline of stage transitions are stored on the
 * order's metadata under `tracking`.
 */

export const TRACKING_STAGES = [
  { code: "processing", label: "Processing" },
  { code: "dispatched", label: "Dispatched" },
  { code: "customs", label: "Customs clearance" },
  { code: "out_for_delivery", label: "Out for delivery" },
  { code: "delivered", label: "Delivered" },
] as const

export type TrackingStageCode = (typeof TRACKING_STAGES)[number]["code"]

export const TRACKING_STAGE_CODES: TrackingStageCode[] = TRACKING_STAGES.map(
  (s) => s.code
)

export type TrackingEvent = {
  stage: TrackingStageCode
  note?: string
  /** ISO timestamp set when the stage was recorded */
  at: string
}

export type TrackingMetadata = {
  current: TrackingStageCode
  history: TrackingEvent[]
}

export function isTrackingStage(value: unknown): value is TrackingStageCode {
  return (
    typeof value === "string" &&
    TRACKING_STAGE_CODES.includes(value as TrackingStageCode)
  )
}

export function stageIndex(code: TrackingStageCode): number {
  return TRACKING_STAGE_CODES.indexOf(code)
}
