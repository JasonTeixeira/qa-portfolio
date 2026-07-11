/**
 * Shared constants + font loader for the agency OG share cards.
 *
 * Satori constraints: flexbox only, no CSS vars — every value here is an
 * inline hex/rgba literal mirroring app/agency/agency.css tokens.
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const OG_SIZE = { width: 1200, height: 630 }

export const OG = {
  bg: '#090E1A',
  deep: '#070B14',
  card: '#0E1526',
  text: '#E6ECF8',
  dim: 'rgba(226,234,250,0.62)',
  border: 'rgba(160,185,235,0.16)',
  primary: '#4D9FFF',
  ai: '#B08BE8',
  browser: '#38BDF8',
  pass: '#6FC98F',
  log: '#2DD4BF',
  fail: '#E8897B',
} as const

/** Subtle 30px grid, matching the site's terminal-grid atmosphere. */
export const OG_GRID = {
  backgroundImage:
    'linear-gradient(rgba(160,185,235,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(160,185,235,0.05) 1px, transparent 1px)',
  backgroundSize: '30px 30px',
} as const

export async function loadOgFonts() {
  const dir = path.join(process.cwd(), 'assets', 'og-fonts')
  const [regular, bold] = await Promise.all([
    readFile(path.join(dir, 'JetBrainsMono-Regular.ttf')),
    readFile(path.join(dir, 'JetBrainsMono-Bold.ttf')),
  ])
  return [
    { name: 'JetBrains Mono', data: regular, weight: 400 as const, style: 'normal' as const },
    { name: 'JetBrains Mono', data: bold, weight: 700 as const, style: 'normal' as const },
  ]
}
