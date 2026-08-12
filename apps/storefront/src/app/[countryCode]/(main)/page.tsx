import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import ProductShowcase from "@modules/home/components/product-showcase"
import About from "@modules/home/components/about"
import Services from "@modules/home/components/services"
import CategoryGrid from "@modules/home/components/category-grid"
import Factory from "@modules/home/components/factory"
import CtaBanner from "@modules/home/components/cta-banner"
import Inquiry from "@modules/home/components/inquiry"
import { getRegion } from "@lib/data/regions"
import { getStoreName } from "@lib/util/env"

export const metadata: Metadata = {
  title: `${getStoreName()} International Cosmetics Company | OEM/ODM Manufacturing`,
  description:
    "Professional OEM/ODM manufacturing for skincare and personal care brands. Product development, packaging coordination, sampling and commercial production across Nigeria, Kenya and Togo.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const region = await getRegion(countryCode)

  return (
    <>
      <Hero />
      {/* Purchase rail sits high on the page so buyers reach orderable stock fast. */}
      {region && <ProductShowcase region={region} />}
      <About />
      <Services />
      <CategoryGrid />
      <Factory />
      <CtaBanner />
      <Inquiry />
    </>
  )
}
