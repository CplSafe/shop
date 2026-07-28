import { Metadata } from "next"
import { Suspense } from "react"

import VerifyAccount from "@modules/account/components/verify-account"
import { getTranslations } from "@lib/i18n/get-translations"

export const metadata: Metadata = {
  title: "Verify your email",
  description: "Verify your email address to complete your registration.",
}

export default async function VerifyAccountPage() {
  const t = await getTranslations("account")
  return (
    <div className="w-full flex justify-center px-8 py-12">
      <Suspense
        fallback={
          <p className="text-base-regular text-ui-fg-base">
            {t("verifying_email")}
          </p>
        }
      >
        <VerifyAccount />
      </Suspense>
    </div>
  )
}
