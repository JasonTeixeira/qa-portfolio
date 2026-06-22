import type { Metadata } from 'next'
import { HeroFirstHome } from '@/components/living/HeroFirstHome'

export const metadata: Metadata = {
  title: 'Home v2 (preview) — Sage Ideas',
  description: 'Hero-first homepage prototype.',
  robots: { index: false, follow: false },
}

export default function HomeV2Page() {
  return <HeroFirstHome />
}
