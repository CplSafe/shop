import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import HowItWorks from "@modules/home/components/how-it-works"
import ProductShowcase from "@modules/home/components/product-showcase"
import { getRegion } from "@lib/data/regions"
import { getStoreName } from "@lib/util/env"

export const metadata: Metadata = {
  title: `${getStoreName()} — Wholesale & Retail Supply for West & East Africa`,
  description: `${getStoreName()} supplies and ships quality goods across West and East Africa. Wholesale and retail, with local-currency pricing and trusted delivery.`,
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)

  return (
    <>
      <Hero />
      {region && <ProductShowcase region={region} />}
      <HowItWorks />
    </>
  )
}
