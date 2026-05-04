import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'
import './globals.css'
import { MarketingChrome } from '@/components/marketing-chrome'

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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#06b6d4',
          colorBackground: '#0f0f12',
          colorInputBackground: '#18181b',
          colorInputText: '#fafafa',
          colorText: '#fafafa',
          colorTextSecondary: '#a1a1aa',
          borderRadius: '0.75rem',
        },
        elements: {
          card: 'bg-[#0f0f12] border border-[#27272a]',
          formButtonPrimary:
            'bg-[#06b6d4] hover:bg-[#0891b2] text-[#09090b] font-medium',
        },
      }}
    >
    <html lang="en" data-scroll-behavior="smooth" className={`${inter.variable} ${jetbrainsMono.variable} bg-[#09090B]`}>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <MarketingChrome position="top" />
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
        <MarketingChrome position="children">{children}</MarketingChrome>
        <MarketingChrome position="bottom" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
    </ClerkProvider>
  )
}
