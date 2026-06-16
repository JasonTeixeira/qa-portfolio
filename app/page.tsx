import type { Metadata } from 'next'
import { LivingSystemsHome } from '@/components/living/LivingSystemsHome'

export const metadata: Metadata = {
  alternates: { canonical: 'https://www.sageideas.dev' },
  title: 'Sage Ideas — AI-native studio',
  description:
    'A solo, AI-native studio. I build the product, the brand, and the AI that runs it.',
  openGraph: {
    title: 'Sage Ideas — AI-native studio',
    description:
      'A solo, AI-native studio for AI systems, applications, SaaS, brand, web, growth, and SEO.',
    images: ['/og?title=Sage%20Ideas&subtitle=Product%20Brand%20AI'],
  },
}

export default function HomePage() {
  return <LivingSystemsHome />
}
