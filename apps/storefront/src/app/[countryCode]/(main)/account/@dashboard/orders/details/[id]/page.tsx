import { retrieveOrder } from "@lib/data/orders"
import OrderDetailsTemplate from "@modules/order/templates/order-details-template"
import { getTranslations } from "@lib/i18n/get-translations"
import { Metadata } from "next"
import { notFound } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order) {
    notFound()
  }

  return {
    title: `Order #${order.display_id}`,
    description: `View your order`,
  }
}

export default async function OrderDetailPage(props: Props) {
  const params = await props.params
  const order = await retrieveOrder(params.id).catch(() => null)

  if (!order) {
    notFound()
  }

  const t = await getTranslations("tracking")
  const trackingLabels = {
    title: t("title"),
    stages: {
      processing: t("processing"),
      dispatched: t("dispatched"),
      customs: t("customs"),
      out_for_delivery: t("out_for_delivery"),
      delivered: t("delivered"),
    },
  }

  return <OrderDetailsTemplate order={order} trackingLabels={trackingLabels} />
}
