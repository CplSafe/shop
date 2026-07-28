"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { submitWholesaleApplication } from "@lib/data/wholesale"
import type { WholesaleApplication } from "@lib/data/wholesale"
import { useT } from "@lib/i18n/client"

/**
 * Wholesale application form. Prefills from an existing application so the
 * customer can update a pending/rejected submission.
 */
export default function WholesaleForm({
  application,
}: {
  application: WholesaleApplication | null
}) {
  const t = useT("wholesale")
  const [message, formAction] = useActionState(
    submitWholesaleApplication,
    null,
  )

  const isResubmit = !!application

  return (
    <form className="w-full flex flex-col gap-y-4" action={formAction}>
      <div className="grid grid-cols-1 small:grid-cols-2 gap-4">
        <Input
          label={t("company_name")}
          name="company_name"
          required
          defaultValue={application?.company_name ?? ""}
          data-testid="wholesale-company"
        />
        <Input
          label={t("contact_name")}
          name="contact_name"
          defaultValue={application?.contact_name ?? ""}
          data-testid="wholesale-contact"
        />
        <Input
          label={t("phone")}
          name="phone"
          defaultValue={application?.phone ?? ""}
          data-testid="wholesale-phone"
        />
        <Input
          label={t("expected_volume")}
          name="expected_volume"
          defaultValue={application?.expected_volume ?? ""}
          data-testid="wholesale-volume"
        />
      </div>
      <Input
        label={t("note")}
        name="note"
        defaultValue={application?.note ?? ""}
        data-testid="wholesale-note"
      />

      {message?.success && (
        <p
          className="text-small-regular"
          style={{ color: "var(--shop-accent)" }}
          data-testid="wholesale-success"
        >
          {t("success")}
        </p>
      )}
      <ErrorMessage
        error={message && !message.success ? message.error : null}
        data-testid="wholesale-error"
      />

      <div>
        <SubmitButton data-testid="wholesale-submit">
          {isResubmit ? t("resubmit") : t("submit")}
        </SubmitButton>
      </div>
    </form>
  )
}
