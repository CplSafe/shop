"use client"

import { Heading } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useT } from "@lib/i18n/client"
import React from "react"

const Help = () => {
  const t = useT("order")

  return (
    <div className="mt-6">
      <Heading className="text-base-semi">{t("help_title")}</Heading>
      <div className="text-base-regular my-2">
        <ul className="gap-y-2 flex flex-col">
          <li>
            <LocalizedClientLink href="/contact">
              {t("help_contact")}
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/contact">
              {t("help_returns")}
            </LocalizedClientLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
