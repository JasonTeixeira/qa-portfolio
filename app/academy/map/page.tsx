import type { Metadata } from 'next'
import Link from 'next/link'
import { AcademyNav, AcademyFooter } from '@/components/academy/landing/AcademyChrome'
import { EcosystemBand } from '@/components/academy/landing/EcosystemBand'
import { SkillTree } from '@/components/academy/map/SkillTree'
import { buildCurriculumGraph } from '@/lib/academy/curriculum-graph'

const SITE = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: 'The Map — every track, one path — Sage Academy',
  description:
    'The whole Sage Academy curriculum as a connected skill-tree: foundations to AI engineering, with the prerequisites drawn in. See the path, track your progress, pick your next move.',
  alternates: { canonical: `${SITE}/academy/map` },
  openGraph: {
    title: 'The Map — the Sage Academy skill-tree',
    description: 'Every track, one path — from foundations to AI engineering, with prerequisites drawn in.',
    images: ['/og?title=The+Map&subtitle=Every+track%2C+one+path+to+shipping+AI'],
  },
  twitter: { card: 'summary_large_image', images: ['/og?title=The+Map&subtitle=Every+track%2C+one+path+to+shipping+AI'] },
}

const serif = { fontFamily: 'var(--font-serif), Georgia, serif' } as const
const mono = { fontFamily: 'var(--font-mono), monospace' } as const

export default function AcademyMapPage() {
  // Structure comes from git (always available). Per-user progress overlay is a
  // follow-up; v1 renders the honest curriculum map with live/building states.
  const graph = buildCurriculumGraph()

  return (
    <>
      <AcademyNav />
      <div style={{ minHeight: '100vh', background: '#0B0B0E', backgroundImage: 'radial-gradient(100% 55% at 50% -6%, rgba(61,90,254,0.07) 0%, transparent 55%)', color: '#F2EFE9', fontFamily: 'var(--font-sans), sans-serif' }}>
        <main style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(44px, 6vw, 76px) clamp(16px, 3vw, 40px) 96px' }}>
          <div style={{ maxWidth: 680 }}>
            <div style={{ ...mono, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#8FA0FF' }}>The map</div>
            <h1 style={{ ...serif, margin: '14px 0 0', fontWeight: 600, fontSize: 'clamp(34px, 5vw, 60px)', lineHeight: 1.02, letterSpacing: '-0.03em', textWrap: 'balance' }}>
              Every track, <em style={{ fontStyle: 'italic', color: '#8FA0FF' }}>one path.</em>
            </h1>
            <p style={{ margin: '20px 0 0', color: '#9C9CA6', fontSize: 17.5, lineHeight: 1.6, maxWidth: '58ch' }}>
              The whole curriculum, connected — from your first program to shipping AI features, with the prerequisites
              drawn in. Follow the line, or jump anywhere. Nothing here is a wall.
            </p>
          </div>

          <div style={{ marginTop: 48 }}>
            <SkillTree graph={graph} />
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', marginTop: 44 }}>
            <Link href="/academy/catalog" style={{ display: 'inline-flex', alignItems: 'center', background: '#3D5AFE', color: '#fff', textDecoration: 'none', fontSize: 15, fontWeight: 600, padding: '15px 28px', borderRadius: 26, boxShadow: '0 0 22px rgba(61,90,254,0.35)' }}>
              Browse the catalog
            </Link>
            <Link href="/academy/starter" style={{ ...mono, fontSize: 12, color: '#8FA0FF', textDecoration: 'none' }}>
              new here? start with the free path →
            </Link>
          </div>
        </main>
      </div>
      <EcosystemBand current="map" />
      <AcademyFooter />
    </>
  )
}
