import { Heading, Text } from "@modules/common/components/ui"
import TransferActions from "@modules/order/components/transfer-actions"
import TransferImage from "@modules/order/components/transfer-image"
import { getTranslations } from "@lib/i18n/get-translations"

export default async function TransferPage({
  params,
}: {
  params: { id: string; token: string }
}) {
  const { id, token } = params
  const t = await getTranslations("transfer")

  return (
    <div className="flex flex-col gap-y-4 items-start w-2/5 mx-auto mt-10 mb-20">
      <TransferImage />
      <div className="flex flex-col gap-y-6">
        <Heading level="h1" className="text-xl text-zinc-900">
          {t("request_heading", { id })}
        </Heading>
        <Text className="text-zinc-600">{t("request_intro", { id })}</Text>
        <div className="w-full h-px bg-zinc-200" />
        <Text className="text-zinc-600">{t("request_accept_note")}</Text>
        <Text className="text-zinc-600">{t("request_ignore_note")}</Text>
        <div className="w-full h-px bg-zinc-200" />
        <TransferActions id={id} token={token} />
      </div>
    </div>
  )
}
