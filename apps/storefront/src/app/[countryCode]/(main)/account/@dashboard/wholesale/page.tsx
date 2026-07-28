import { Metadata } from "next"

import { getWholesaleStatus } from "@lib/data/wholesale"
import { getTranslations } from "@lib/i18n/get-translations"
import WholesaleForm from "@modules/account/components/wholesale-form"

export const metadata: Metadata = {
  title: "Wholesale",
  description: "Apply for a wholesale account.",
}

export default async function WholesalePage() {
  const [{ application, is_wholesale }, t] = await Promise.all([
    getWholesaleStatus(),
    getTranslations("wholesale"),
  ])

  const status = is_wholesale ? "approved" : application?.status ?? "new"

  return (
    <div className="w-full" data-testid="wholesale-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-2">
        <h1 className="text-2xl-semi">{t("title")}</h1>
        <p className="text-base-regular text-ui-fg-subtle">{t("subtitle")}</p>
      </div>

      {status === "approved" ? (
        <div
          className="border p-6"
          style={{
            borderColor: "var(--shop-accent)",
            background: "var(--shop-bg)",
          }}
        >
          <h2 className="shop-display text-lg font-semibold text-[var(--shop-ink)]">
            {t("approved_title")}
          </h2>
          <p className="mt-2 text-sm text-[var(--shop-muted)]">
            {t("approved_body")}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-y-6">
          {status === "pending" && (
            <div className="border border-[var(--shop-border)] bg-[var(--shop-bg)] p-4">
              <h2 className="text-base-semi text-[var(--shop-ink)]">
                {t("pending_title")}
              </h2>
              <p className="mt-1 text-sm text-[var(--shop-muted)]">
                {t("pending_body")}
              </p>
            </div>
          )}
          {status === "rejected" && (
            <div className="border border-[var(--shop-border)] bg-[var(--shop-bg)] p-4">
              <h2 className="text-base-semi text-[var(--shop-ink)]">
                {t("rejected_title")}
              </h2>
              <p className="mt-1 text-sm text-[var(--shop-muted)]">
                {t("rejected_body")}
              </p>
            </div>
          )}
          <WholesaleForm application={application} />
        </div>
      )}
    </div>
  )
}
