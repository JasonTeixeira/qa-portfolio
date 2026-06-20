import type { Metadata } from 'next'
import { AscentContent } from './ascent-content'

export const metadata: Metadata = {
  title: 'The Ascent — Sage Ideas',
  description:
    'A solo AI-native studio. Product, brand, AI systems, and growth — built as one operating machine, by the person who ships it.',
  alternates: { canonical: 'https://www.sageideas.dev/ascent' },
}

export default function AscentPage() {
  return <AscentContent />
}
