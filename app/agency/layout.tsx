import type { Metadata } from 'next'
import { Archivo } from 'next/font/google'
import './agency.css'
import './sections.css'
import './islands.css'
import './proof.css'
import './diagrams.css'
import './visual-upgrades.css'
import './wow.css'

// Archivo variable — width axis is part of the design language (kicker→display contrast).
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-agency-sans',
  display: 'swap',
})

const SITE_URL = 'https://agency.sageideas.dev'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: 'Jason Teixeira — AI / QA / Automation Engineer' },
  description:
    'I build AI systems, QA infrastructure, and automation workflows that prove they work. Every claim on this site is attached to an artifact — no invented metrics.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: 'Jason Teixeira — AI / QA / Automation Engineer',
    description:
      'AI systems, QA infrastructure, and automation workflows that prove they work. Tested, not described.',
    url: SITE_URL,
    siteName: 'Jason Teixeira — Proof Portfolio',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
}

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${archivo.variable} agency-root`}>{children}</div>
}
