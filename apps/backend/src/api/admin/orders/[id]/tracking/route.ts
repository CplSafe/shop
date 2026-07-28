import {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import {
  isTrackingStage,
  TrackingEvent,
  TrackingMetadata,
} from "../../../../../modules/tracking/stages"

/**
 * POST /admin/orders/:id/tracking
 * Body: { stage: TrackingStageCode, note?: string }
 *
 * Sets the order's current logistics stage and appends to its tracking
 * history. Timestamps are recorded server-side. Idempotent-friendly: posting
 * the same stage again just appends another dated event (useful for notes).
 */
export async function POST(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const orderId = req.params.id
  const body = (req.body ?? {}) as { stage?: unknown; note?: unknown }

  if (!isTrackingStage(body.stage)) {
    res.status(400).json({
      message:
        "Invalid or missing 'stage'. Expected one of the tracking stage codes.",
    })
    return
  }

  const note = typeof body.note === "string" ? body.note : undefined

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)
  const orderModule = req.scope.resolve(Modules.ORDER)

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "metadata"],
    filters: { id: orderId },
  })
  const order = orders[0]
  if (!order) {
    res.status(404).json({ message: "Order not found." })
    return
  }

  const existing = (order.metadata?.tracking ?? null) as TrackingMetadata | null
  const event: TrackingEvent = {
    stage: body.stage,
    note,
    at: new Date().toISOString(),
  }
  const tracking: TrackingMetadata = {
    current: body.stage,
    history: [...(existing?.history ?? []), event],
  }

  await orderModule.updateOrders([
    {
      id: orderId,
      metadata: { ...(order.metadata ?? {}), tracking },
    },
  ])

  res.json({ id: orderId, tracking })
}

/**
 * GET /admin/orders/:id/tracking — returns the current tracking metadata.
 */
export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
): Promise<void> {
  const orderId = req.params.id
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: orders } = await query.graph({
    entity: "order",
    fields: ["id", "metadata"],
    filters: { id: orderId },
  })
  const order = orders[0]
  if (!order) {
    res.status(404).json({ message: "Order not found." })
    return
  }

  res.json({
    id: orderId,
    tracking: (order.metadata?.tracking ?? null) as TrackingMetadata | null,
  })
}
