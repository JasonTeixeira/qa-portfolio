import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SectionLabel } from '@/components/section-label'
import { LabGrid } from './lab-grid'
import { labProducts } from '@/data/lab/products'

export const metadata: Metadata = {
  alternates: { canonical: 'https://sageideas.dev/lab' },
  title: 'The Lab — Sage Ideas',
  description:
    'Six AI-native products built and operated by Sage Ideas: Nexural, Jobpoise, Trayd, VOZA, Owly, and AlphaStream. These are the businesses we\'d want to run.',
  openGraph: {
    title: 'The Lab — Sage Ideas',
    description:
      'Six AI-native products built and operated by Sage Ideas: Nexural, Jobpoise, Trayd, VOZA, Owly, and AlphaStream.',
    images: ['/og?title=The+Lab.&subtitle=Built+here+first.'],
  },
}

export default function LabPage() {
  return (
    <div className="min-h-screen bg-[#09090B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        {/* Hero */}
        <section className="mb-20">
          <SectionLabel>Products</SectionLabel>
          <h1 className="mt-4 text-5xl sm:text-6xl lg:text-7xl font-bold text-[#FAFAFA] tracking-tight">
            The Lab.
          </h1>
          <p className="mt-4 text-xl text-[#A1A1AA] max-w-2xl">
            Where we build the things we&apos;d want to use.
          </p>
          <p className="mt-4 text-[#71717A] max-w-2xl leading-relaxed">
            The Lab is Sage Ideas&apos; product portfolio — not client work, not concept pieces, but live software built, maintained, and operated by the studio. Every product here started as a genuine itch. Every one of them has influenced a service offering or infrastructure pattern.
          </p>
          <p className="mt-3 text-[#71717A] max-w-2xl leading-relaxed">
            When we say &ldquo;we build what we operate,&rdquo; the Lab is the proof.
          </p>
        </section>

        {/* Product grid */}
        <section>
          <LabGrid products={labProducts} />
        </section>
      </div>
    </div>
  )
}
