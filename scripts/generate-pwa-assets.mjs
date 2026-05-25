#!/usr/bin/env node
// Phase 1: Generate PWA icon set + screenshots from existing brand assets.
// Outputs:
//   public/brand/icon-192.png
//   public/brand/icon-512.png
//   public/brand/icon-maskable-192.png
//   public/brand/icon-maskable-512.png
//   public/brand/icon-monochrome.svg
//   public/brand/screenshot-wide.png    (1280x720 dark canvas + wordmark — placeholder until real captures)
//   public/brand/screenshot-narrow.png  (750x1334 mobile canvas)

import sharp from 'sharp'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const OUT = path.join(ROOT, 'public', 'brand')
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true })

const BG = { r: 9, g: 9, b: 11, alpha: 1 } // #09090B
const SOURCE_LOGO = path.join(ROOT, 'public', 'brand', 'sage-logo-hq.png')

async function makeIcon({ size, maskable, outFile }) {
  // Maskable icons need ~20% safe-zone padding on all sides.
  // Logo height should be ~60% of canvas for maskable, ~75% for standard.
  const logoTarget = Math.round(size * (maskable ? 0.6 : 0.75))
  const logo = await sharp(SOURCE_LOGO)
    .resize({ height: logoTarget, fit: 'inside' })
    .toBuffer()
  const { width: lw, height: lh } = await sharp(logo).metadata()

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite([
      {
        input: logo,
        top: Math.round((size - (lh ?? logoTarget)) / 2),
        left: Math.round((size - (lw ?? logoTarget)) / 2),
      },
    ])
    .png({ compressionLevel: 9 })
    .toFile(outFile)
  console.log(`✓ ${path.relative(ROOT, outFile)} (${size}x${size}${maskable ? ' maskable' : ''})`)
}

async function makeScreenshot({ width, height, label, outFile, narrow = false }) {
  // Dark canvas with brand wordmark + tagline. Replaces stale placeholder.
  const accent = '#0ED3CF'
  const ink = '#F4F2EF'
  const muted = '#A8A29E'
  const titleSize = narrow ? 72 : 88
  const subSize = narrow ? 28 : 36
  const eyebrowSize = narrow ? 20 : 24
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <radialGradient id="g1" cx="20%" cy="0%" r="60%">
          <stop offset="0%" stop-color="${accent}" stop-opacity="0.12"/>
          <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="g2" cx="90%" cy="100%" r="60%">
          <stop offset="0%" stop-color="#E85D3A" stop-opacity="0.08"/>
          <stop offset="100%" stop-color="#E85D3A" stop-opacity="0"/>
        </radialGradient>
        <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="${accent}" fill-opacity="0.05"/>
        </pattern>
      </defs>
      <rect width="${width}" height="${height}" fill="#09090B"/>
      <rect width="${width}" height="${height}" fill="url(#dots)"/>
      <rect width="${width}" height="${height}" fill="url(#g1)"/>
      <rect width="${width}" height="${height}" fill="url(#g2)"/>
      <g font-family="JetBrains Mono, ui-monospace, monospace" fill="${accent}" font-size="${eyebrowSize}" font-weight="500" letter-spacing="3">
        <text x="${narrow ? 60 : 100}" y="${narrow ? 200 : 200}">SAGE IDEAS · STUDIO</text>
      </g>
      <g font-family="Georgia, serif" fill="${ink}" font-size="${titleSize}" font-weight="400" letter-spacing="-2">
        <text x="${narrow ? 60 : 100}" y="${narrow ? 320 : 350}">${label}</text>
      </g>
      <g font-family="Plus Jakarta Sans, system-ui, sans-serif" fill="${muted}" font-size="${subSize}">
        <text x="${narrow ? 60 : 100}" y="${narrow ? 380 : 420}">AI-native studio for B2B operators.</text>
        <text x="${narrow ? 60 : 100}" y="${narrow ? 420 : 470}">Studio craft, agency rigor.</text>
      </g>
      <g transform="translate(${narrow ? 60 : 100}, ${narrow ? 1180 : 600})" font-family="JetBrains Mono, ui-monospace, monospace" font-size="${eyebrowSize}" fill="${muted}">
        <circle cx="0" cy="-8" r="5" fill="#A8C633"/>
        <text x="14" y="0">Available · 3 slots Q3</text>
      </g>
    </svg>
  `
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outFile)
  console.log(`✓ ${path.relative(ROOT, outFile)} (${width}x${height})`)
}

// Monochrome SVG icon — required for some PWA monochrome contexts.
function writeMonochrome() {
  const file = path.join(OUT, 'icon-monochrome.svg')
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" fill="currentColor"><path d="M16 18c0-5 4-9 9-9h14c5 0 9 4 9 9v3a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3v-2c0-1.7-1.3-3-3-3H27c-1.7 0-3 1.3-3 3v6c0 1.7 1.3 3 3 3h11c5 0 9 4 9 9v9c0 5-4 9-9 9H25c-5 0-9-4-9-9v-3a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v2c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3v-6c0-1.7-1.3-3-3-3H28c-5 0-9-4-9-9z"/></svg>`
  writeFileSync(file, svg)
  console.log(`✓ ${path.relative(ROOT, file)}`)
}

;(async () => {
  await makeIcon({ size: 192, maskable: false, outFile: path.join(OUT, 'icon-192.png') })
  await makeIcon({ size: 512, maskable: false, outFile: path.join(OUT, 'icon-512.png') })
  await makeIcon({ size: 192, maskable: true, outFile: path.join(OUT, 'icon-maskable-192.png') })
  await makeIcon({ size: 512, maskable: true, outFile: path.join(OUT, 'icon-maskable-512.png') })
  writeMonochrome()
  await makeScreenshot({
    width: 1280,
    height: 720,
    label: 'AI-native studio.',
    outFile: path.join(OUT, 'screenshot-wide.png'),
  })
  await makeScreenshot({
    width: 750,
    height: 1334,
    label: 'AI-native\nstudio.',
    outFile: path.join(OUT, 'screenshot-narrow.png'),
    narrow: true,
  })
  console.log('\nPWA asset generation complete.')
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
