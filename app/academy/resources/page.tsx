import type { Metadata } from 'next'
import { ResourcesHub } from '@/components/academy/resources/ResourcesHub'

export const metadata: Metadata = {
  title: 'Tools & Resources — Sage Academy',
  robots: { index: false, follow: false },
}

export default function ResourcesPage() {
  return <ResourcesHub />
}
