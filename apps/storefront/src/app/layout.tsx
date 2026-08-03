import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import { getActiveLocale } from "@lib/i18n/get-translations"
import { I18nProvider } from "@lib/i18n/client"
import "styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const locale = await getActiveLocale()
  const htmlLang = locale === "zh" ? "zh-CN" : locale

  return (
    <html lang={htmlLang} data-mode="light">
      <body className="antialiased">
        <I18nProvider locale={locale}>
          <main className="relative">{props.children}</main>
        </I18nProvider>
      </body>
    </html>
  )
}
