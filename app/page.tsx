import type { Metadata } from 'next'
import { LivingSystemsHome } from '@/components/living/LivingSystemsHome'
import { JsonLd } from '@/components/json-ld'
import { buildWebSite } from '@/lib/seo/jsonld'

const DESCRIPTION =
  'A solo AI-native studio. The person who pitches you writes the code — product, brand, and the AI that runs it, built and run in production since 2020.'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.sageideas.dev' },
  title: 'Sage Ideas — Solo AI Engineering Studio for Operators',
  description: DESCRIPTION,
  openGraph: {
    title: 'Sage Ideas — Solo AI Engineering Studio for Operators',
    description: DESCRIPTION,
    url: 'https://www.sageideas.dev',
    images: ['/og?title=Sage%20Ideas&subtitle=Product%20Brand%20AI'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sage Ideas — Solo AI Engineering Studio for Operators',
    description: DESCRIPTION,
    images: ['/og?title=Sage%20Ideas&subtitle=Product%20Brand%20AI'],
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
