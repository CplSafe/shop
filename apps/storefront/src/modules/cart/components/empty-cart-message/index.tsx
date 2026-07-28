import { Heading, Text } from "@modules/common/components/ui"

import InteractiveLink from "@modules/common/components/interactive-link"
import { getTranslations } from "@lib/i18n/get-translations"

const EmptyCartMessage = async () => {
  const t = await getTranslations("cart")
  return (
    <div
      className="py-48 px-2 flex flex-col justify-center items-start"
      data-testid="empty-cart-message"
    >
      <Heading
        level="h1"
        className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
      >
        {t("empty_heading")}
      </Heading>
      <Text className="text-base-regular mt-4 mb-6 max-w-[32rem]">
        {t("empty_body")}
      </Text>
      <div>
        <InteractiveLink href="/store">{t("explore")}</InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
