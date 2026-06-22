import type { Metadata, Viewport } from 'next'
import { Bricolage_Grotesque, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { headers } from 'next/headers'
import { MarketingChrome } from '@/components/marketing-chrome'
import { CookieBanner } from '@/components/studio/cookie-banner'
import { ExitIntentModal } from '@/components/exit-intent-modal'
import { PostHogProvider } from '@/components/analytics/posthog-provider'
import { AttributionCapture } from '@/components/analytics/attribution-capture'
import { GoogleAnalytics } from '@/components/analytics/google-analytics'
import { WebVitalsReporter } from '@/components/web-vitals-reporter'
import { ClientErrorReporter } from '@/components/client-error-reporter'
import { ServiceWorkerRegistration } from '@/components/pwa/service-worker-registration'
import { InstallPrompt } from '@/components/pwa/install-prompt'
import { UpdateToast } from '@/components/pwa/update-toast'
import { Breadcrumbs } from '@/components/seo/Breadcrumbs'

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-display',
  display: 'swap',
})

const sans = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
  display: 'swap',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const viewport: Viewport = {
  themeColor: '#0B0B0E',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

const SITE_URL = 'https://www.sageideas.dev'

export const metadata: Metadata = {
  title: {
    default: 'Sage Ideas — AI-Native Studio for B2B Operators',
    template: '%s — Sage Ideas',
  },
  description:
    'Sage Ideas is a solo, AI-native studio. I build the product, the brand, and the AI that runs it.',
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: 'Sage Ideas — AI-Native Studio for B2B Operators',
    description:
      'A solo, AI-native studio for AI systems, applications, SaaS, brand, web, growth, and SEO.',
    url: SITE_URL,
    siteName: 'Sage Ideas',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: `${SITE_URL}/og?title=Sage%20Ideas&subtitle=AI-Native%20Studio%20for%20B2B%20Operators`,
        width: 1200,
        height: 630,
        alt: 'Sage Ideas — AI-Native Studio for B2B Operators',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sage Ideas — AI-Native Studio for B2B Operators',
    description:
      'I build the product, the brand, and the AI that runs it.',
    images: [`${SITE_URL}/og?title=Sage%20Ideas&subtitle=AI-Native%20Studio%20for%20B2B%20Operators`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  verification: {
    google: 'FSkeMXEvQz0bdu-hz9pQVnZ9zN5rsMv7yk2xk9B26TU',
  },
  alternates: {
    canonical: SITE_URL,
    types: {
      'application/rss+xml': `${SITE_URL}/feed.xml`,
      'application/atom+xml': `${SITE_URL}/atom.xml`,
    },
  },
  keywords: [
    'AI automation agency',
    'AI development studio',
    'fractional CTO',
    'B2B software studio',
    'AI-native agency',
    'productized development',
    'Next.js development agency',
    'fintech software agency',
    'AI workflow automation',
    'programmatic SEO agency',
    'Stripe SaaS development',
    'AWS Terraform consultancy',
    'Sage Ideas',
    'Jason Teixeira',
    'remote software studio',
    'one-person agency',
  ],
  authors: [{ name: 'Jason Teixeira', url: SITE_URL }],
  creator: 'Sage Ideas',
  publisher: 'Sage Ideas LLC',
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Sage Ideas',
  legalName: 'Sage Ideas LLC',
  url: SITE_URL,
  logo: `${SITE_URL}/brand/sage-mark.svg`,
  description:
    'Solo AI-native studio for AI systems, applications, SaaS, brand, web, growth, and SEO.',
  founder: {
    '@type': 'Person',
    name: 'Jason Teixeira',
    url: `${SITE_URL}/founder`,
  },
  foundingDate: '2020',
  email: 'sage@sageideas.dev',
  sameAs: [
    'https://github.com/JasonTeixeira',
    'https://linkedin.com/in/jason-teixeira',
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Orlando',
    addressRegion: 'FL',
    addressCountry: 'US',
  },
  knowsAbout: [
    'AI Automation',
    'Full-Stack Development',
    'Cloud Infrastructure',
    'Programmatic SEO',
    'Stripe Integration',
    'Fractional CTO Engagements',
    'Next.js Engineering',
  ],
}

const professionalServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: 'Sage Ideas LLC',
  url: SITE_URL,
  description:
    'Solo AI-native studio. Product, brand, AI systems, applications, SaaS, growth, and SEO.',
  founder: { '@type': 'Person', name: 'Jason Teixeira' },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Orlando',
    addressRegion: 'FL',
    addressCountry: 'US',
  },
  areaServed: { '@type': 'Country', name: 'United States' },
  serviceType: [
    'AI Automation',
    'Custom Software Development',
    'Programmatic SEO',
    'Fractional CTO',
    'Stripe Integration',
    'Cloud Infrastructure',
  ],
  priceRange: '$$$',
  email: 'sage@sageideas.dev',
  sameAs: [
    'https://github.com/JasonTeixeira',
    'https://linkedin.com/in/jason-teixeira',
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const h = await headers()
  const isPortal = h.get('x-portal') === '1'
  const pathname = (h.get('x-pathname') ?? '').split('?')[0]
  const isLivingHomepage = pathname === '/'
  const isCinematicPath = pathname === '/path' || pathname === '/ascent' || pathname.startsWith('/learn') || pathname.startsWith('/proto')
  const isPremiumLanding = isLivingHomepage || pathname === '/academy' || isCinematicPath
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${sans.variable} ${mono.variable} bg-[#0B0B0E]`}
    >
      <head>
        {/* Preconnect to Google Fonts CDN to shave ~100–200 ms off font fetch */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/brand/favicon-mark.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/brand/sage-favicon-180.png" />
        {/* DNS-prefetch for GitHub API (GitHubActivity widget) */}
        <link rel="dns-prefetch" href="https://api.github.com" />
      </head>
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(professionalServiceSchema) }}
        />
        <PostHogProvider>
          {!isPortal && <AttributionCapture />}
          {!isCinematicPath && <MarketingChrome position="top" />}
          {!isPortal && !isCinematicPath && <Breadcrumbs pathname={pathname} />}
          {isCinematicPath ? children : <MarketingChrome position="children">{children}</MarketingChrome>}
          {!isCinematicPath && <MarketingChrome position="bottom" />}
          {!isPortal && !isCinematicPath && <CookieBanner />}
          {!isPortal && !isPremiumLanding && <ExitIntentModal />}
          <WebVitalsReporter />
          <ClientErrorReporter />
          <ServiceWorkerRegistration />
          {!isPortal && !isPremiumLanding && <InstallPrompt />}
          <UpdateToast />
        </PostHogProvider>
        <GoogleAnalytics />
        {process.env.NODE_ENV === 'production' && process.env.VERCEL === '1' && <Analytics />}
      </body>
    </html>
  )
}
