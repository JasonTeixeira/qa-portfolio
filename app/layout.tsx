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
  title: 'Jason Teixeira | Systems Architect & Full-Stack Engineer',
  description: 'Systems architect building production platforms, trading systems, and automation frameworks. 20+ projects, 9 certifications, enterprise and fintech experience. Available for hire and consulting.',
  metadataBase: new URL('https://sageideas.dev'),
  openGraph: {
    title: 'Jason Teixeira | Systems Architect & Full-Stack Engineer',
    description: 'Systems architect building production platforms, trading systems, and automation frameworks. 20+ projects, 9 certifications.',
    url: 'https://sageideas.dev',
    siteName: 'Sage Ideas',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jason Teixeira | Systems Architect & Full-Stack Engineer',
    description: 'Systems architect building production platforms, trading systems, and automation frameworks.',
  },
  robots: {
    index: true,
    follow: true,
  },
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
              jobTitle: "Systems Architect & Full-Stack Engineer",
              description: "Systems architect building production platforms, trading systems, and automation frameworks.",
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
