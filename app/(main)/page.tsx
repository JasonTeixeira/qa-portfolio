import type { Metadata } from 'next'
import { LivingSystemsHome } from '@/components/living/LivingSystemsHome'
import { JsonLd } from '@/components/json-ld'
import { buildWebSite } from '@/lib/seo/jsonld'

const DESCRIPTION =
  'Sage Ideas builds websites, AI systems, prototypes, and operating dashboards that turn business traffic into qualified leads, quote requests, and booked calls.'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.sageideas.dev' },
  title: 'Sage Ideas | AI Systems, Websites, and Conversion Prototypes',
  description: DESCRIPTION,
  openGraph: {
    title: 'Sage Ideas | AI Systems, Websites, and Conversion Prototypes',
    description: DESCRIPTION,
    url: 'https://www.sageideas.dev',
    images: ['/og?title=Sage%20Ideas&subtitle=Open%20working%20systems%20before%20you%20book.'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sage Ideas | AI Systems, Websites, and Conversion Prototypes',
    description: DESCRIPTION,
    images: ['/og?title=Sage%20Ideas&subtitle=Open%20working%20systems%20before%20you%20book.'],
  },
}

export default function HomePage() {
  return (
    <>
      <JsonLd data={[buildWebSite()]} />
      <LivingSystemsHome />
    </>
  )
}
