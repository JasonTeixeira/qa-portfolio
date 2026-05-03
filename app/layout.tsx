import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BackToTop } from '@/components/back-to-top'
import { SkipToContent } from '@/components/skip-to-content'
import { CommandPalette } from '@/components/command-palette'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap'
})

export const viewport: Viewport = {
  themeColor: '#09090B',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Jason Teixeira | Full-Stack Developer & QA Engineer',
  description: 'Full-stack developer with 5 years fintech experience. 20+ shipped projects, 9 certifications (ISTQB, AWS, Cisco). Building Sage Ideas Studio — strategy, build, and ship for ambitious founders.',
  metadataBase: new URL('https://sageideas.dev'),
  openGraph: {
    title: 'Jason Teixeira | Full-Stack Developer & QA Engineer',
    description: 'Full-stack developer with 5 years fintech experience. 20+ shipped projects, 9 certifications. Founder of Sage Ideas Studio.',
    url: 'https://sageideas.dev',
    siteName: 'Sage Ideas',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jason Teixeira | Full-Stack Developer & QA Engineer',
    description: 'Full-stack developer with 5 years fintech experience. 20+ shipped projects, 9 certifications. Founder of Sage Ideas Studio.',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    types: {
      'application/rss+xml': 'https://sageideas.dev/feed.xml',
    },
  },
  keywords: [
    'full-stack developer', 'QA engineer', 'test automation engineer',
    'fintech developer', 'python developer', 'typescript developer',
    'trading platform developer', 'AWS certified developer',
    'remote software engineer', 'independent developer',
    'Orlando FL developer', 'hire developer', 'developer portfolio',
    'Next.js developer', 'FastAPI developer', 'Supabase developer',
    'machine learning trading', 'algorithmic trading developer',
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${jetbrainsMono.variable} bg-[#09090B]`}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <SkipToContent />
        <CommandPalette />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Jason Teixeira",
              url: "https://sageideas.dev",
              jobTitle: "Full-Stack Developer & QA Engineer",
              description: "Full-stack developer with 5 years fintech experience. 20+ shipped projects, 9 certifications. Founder of Sage Ideas Studio.",
              sameAs: [
                "https://github.com/JasonTeixeira",
                "https://linkedin.com/in/jason-teixeira"
              ],
              knowsAbout: [
                "Full-Stack Development",
                "Test Automation",
                "Cloud Infrastructure",
                "Trading Systems",
                "AI/ML",
                "DevOps"
              ],
              worksFor: {
                "@type": "Organization",
                name: "Sage Ideas LLC",
                url: "https://sageideas.dev"
              },
              address: {
                "@type": "PostalAddress",
                addressLocality: "Orlando",
                addressRegion: "FL",
                addressCountry: "US"
              }
            })
          }}
        />
        {/* LocalBusiness Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ProfessionalService",
              name: "Sage Ideas LLC",
              url: "https://sageideas.dev",
              description: "Custom software development, test automation, cloud infrastructure, and trading systems. Orlando, FL — available remotely.",
              founder: { "@type": "Person", name: "Jason Teixeira" },
              address: {
                "@type": "PostalAddress",
                addressLocality: "Orlando",
                addressRegion: "FL",
                addressCountry: "US"
              },
              areaServed: { "@type": "Country", name: "United States" },
              serviceType: ["Custom Software Development", "Test Automation", "Cloud Infrastructure", "Trading Systems", "AI Integration"],
              priceRange: "$$",
              email: "sage@sageideas.org",
              sameAs: [
                "https://github.com/JasonTeixeira",
                "https://linkedin.com/in/jason-teixeira"
              ]
            })
          }}
        />
        <Navigation />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <BackToTop />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
