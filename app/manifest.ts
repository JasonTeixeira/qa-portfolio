import type { MetadataRoute } from 'next'

// Phase 1: Full-fat PWA manifest. Maskable icons, screenshots, shortcuts, scope, id.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/?source=pwa',
    name: 'Sage Ideas Studio',
    short_name: 'Sage Ideas',
    description:
      'AI-native studio for B2B operators. Productized engagements, studio craft, agency rigor.',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'browser'],
    orientation: 'portrait-primary',
    background_color: '#09090B',
    theme_color: '#09090B',
    lang: 'en-US',
    dir: 'ltr',
    categories: ['business', 'productivity', 'developer'],
    prefer_related_applications: false,
    icons: [
      // Standard browser icons (computed routes return PNG via Next.js)
      { src: '/icon', sizes: '32x32', type: 'image/png', purpose: 'any' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png', purpose: 'any' },
      // Static maskable + larger sizes
      { src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/brand/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/brand/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/brand/icon-monochrome.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'monochrome' },
    ],
    screenshots: [
      {
        src: '/brand/screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide',
        label: 'Sage Ideas — homepage and case studies on desktop',
      },
      {
        src: '/brand/screenshot-narrow.png',
        sizes: '750x1334',
        type: 'image/png',
        form_factor: 'narrow',
        label: 'Sage Ideas — homepage on mobile',
      },
    ],
    shortcuts: [
      {
        name: 'Book a discovery call',
        short_name: 'Book',
        description: 'Schedule a 30-minute scoping call',
        url: '/book?source=pwa_shortcut',
        icons: [{ src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Case studies',
        short_name: 'Work',
        description: 'Browse production case studies',
        url: '/work?source=pwa_shortcut',
        icons: [{ src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'The Lab',
        short_name: 'Lab',
        description: 'Products built and operated by the studio',
        url: '/lab?source=pwa_shortcut',
        icons: [{ src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
      {
        name: 'Pricing',
        short_name: 'Pricing',
        description: 'Productized engagements + retainers',
        url: '/pricing?source=pwa_shortcut',
        icons: [{ src: '/brand/icon-192.png', sizes: '192x192', type: 'image/png' }],
      },
    ],
  }
}
