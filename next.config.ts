import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Build-time TS errors should not block deploys for now (we lint separately).
  typescript: { ignoreBuildErrors: true },
  // Required because we run inside a monorepo-like workspace and Turbopack
  // otherwise warns about lockfile inference.
  turbopack: { root: __dirname },
  images: { unoptimized: true },
  async redirects() {
    return [
      // Studio relaunch IA migration
      { source: '/hire', destination: '/founder', permanent: true },
      { source: '/about', destination: '/studio', permanent: true },
      { source: '/services/all', destination: '/services', permanent: false },
      // Old case-study URLs → new /work URLs
      { source: '/case-studies', destination: '/work', permanent: true },
      { source: '/case-studies/:slug*', destination: '/work/:slug*', permanent: true },
      { source: '/projects', destination: '/lab', permanent: true },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
        ],
      },
    ]
  },
}

export default nextConfig
