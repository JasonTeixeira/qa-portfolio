import type { Metadata, Viewport } from 'next'
import { Archivo, JetBrains_Mono } from 'next/font/google'
import './base.css'
import './agency.css'
import './sections.css'
import './islands.css'
import './proof.css'
import './diagrams.css'
import './visual-upgrades.css'
import './wow.css'
import './statement.css'
import './contact-form.css'
import './mobile.css'
import './mobile-fixes.css'

// Archivo variable — width axis is part of the design language (kicker→display contrast).
// preload: true — this is now the agency's OWN root layout, so Archivo no longer
// competes with the main site's 4 font preloads. Preloading the LCP headline font wins.
const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-agency-sans',
  display: 'swap',
  preload: true,
})

// The agency previously inherited --font-mono from the main root layout.
// Now that /agency is its own root, it must load JetBrains Mono itself —
// every kicker/label/button on the site renders in it.
const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
  preload: true,
})

export const viewport: Viewport = {
  themeColor: '#090e1a',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

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
  sameAs: ['https://github.com/JasonTeixeira', 'https://www.linkedin.com/in/jason-teixeira/'],
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
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${archivo.variable} ${mono.variable}`}
    >
      <body suppressHydrationWarning>
        <div className="agency-root">
          <a href="#main-content" className="ag-skip-link">
            SKIP TO CONTENT
          </a>
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
      </body>
    </html>
  )
}
