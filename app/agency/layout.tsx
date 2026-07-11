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
// preload: false — the wdth-axis variable file is ~147KB and Lighthouse's simulated
// slow-4G puts every preloaded font ahead of LCP. With swap + size-adjusted fallback,
// the headline paints instantly in the fallback and upgrades when Archivo arrives.
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-agency-sans',
  display: 'swap',
  preload: false,
})

const SITE_URL = 'https://agency.sageideas.dev'

const SITE_DESCRIPTION =
  'I build AI systems, QA infrastructure, and automation workflows that prove they work. Every claim on this site is attached to an artifact — no invented metrics.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: 'Jason Teixeira — AI / QA / Automation Engineer' },
  description: SITE_DESCRIPTION,
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

// JSON-LD structured data — static, non-user values only, so the
// dangerouslySetInnerHTML + JSON.stringify pattern is safe here.
const PERSON_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Jason Teixeira',
  url: SITE_URL,
  jobTitle: 'AI / QA / Automation Engineer',
  sameAs: ['https://github.com/JasonTeixeira', 'https://linkedin.com/in/jason-teixeira'],
  email: 'mailto:sage@sageideas.dev',
}

const SERVICE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Jason Teixeira — Automation Engineering',
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  provider: PERSON_JSONLD,
  areaServed: 'Remote',
  serviceType: [
    'QA automation',
    'AI workflow engineering',
    'CI/CD release gates',
    'Ops automation',
  ],
}

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${archivo.variable} agency-root`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PERSON_JSONLD) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(SERVICE_JSONLD) }}
      />
      {children}
    </div>
  )
}
