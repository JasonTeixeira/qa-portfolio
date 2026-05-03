import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { labProducts } from '@/data/lab/products'
import { TearsheetContent } from './tearsheet-content'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return labProducts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = labProducts.find((p) => p.slug === slug)
  if (!product) return {}

  const ogTitle = encodeURIComponent(`${product.name} — The Lab`)
  const ogSubtitle = encodeURIComponent(product.tagline)

  return {
    title: `${product.name} — The Lab | Sage Ideas`,
    description: product.description,
    openGraph: {
      title: `${product.name} — The Lab | Sage Ideas`,
      description: product.description,
      images: [`/og?title=${ogTitle}&subtitle=${ogSubtitle}`],
    },
  }
}

export default async function TearsheetPage({ params }: Props) {
  const { slug } = await params
  const product = labProducts.find((p) => p.slug === slug)
  if (!product) notFound()

  return <TearsheetContent product={product} />
}
