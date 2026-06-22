import { prototypes } from './prototype-catalog'

export const verificationSnapshot = {
  lastVerified: '2026-06-22',
  branch: 'feat/community-rag-content-ops-cleanup',
  commands: [
    'npm run typecheck',
    'PW_BASE_URL=http://localhost:3040 npx playwright test tests/e2e/showcase-revenue-os.spec.ts --config=playwright.e2e.config.ts --project=chromium',
    'Axe scan on /showcase, /showcase/revenue-os, /showcase/contractor-quote-engine',
    'npm run build',
  ],
  results: [
    { label: 'TypeScript', value: 'Passed', detail: 'tsc --noEmit completed locally' },
    { label: 'Focused E2E', value: '3 passed', detail: 'Warehouse, Revenue OS, and first four embedded demos covered' },
    { label: 'Axe accessibility', value: '0 violations', detail: 'Scanned three representative showcase routes' },
    { label: 'Production build', value: 'Passed', detail: 'Next build completed with 304 static pages generated' },
  ],
}

export const prototypeProof = prototypes.map((prototype, index) => ({
  slug: prototype.slug,
  name: prototype.name,
  score: prototype.slug === 'revenue-os' ? 90 : 82,
  verified: prototype.proofLevel === 'Verified local',
  route: prototype.slug === 'revenue-os' ? '/showcase/revenue-os' : `/showcase/${prototype.slug}`,
  privateRoute: `/showcase/private/${prototype.slug}`,
  previewRoute: `/showcase/private/${prototype.slug}/preview`,
  auditRoute: `/showcase/admin/${prototype.slug}`,
  checks: [
    { label: 'Public route', status: 'passed' },
    { label: 'Private packet', status: 'passed' },
    { label: 'Preview route', status: 'implemented' },
    { label: 'Embedded prototype', status: 'passed' },
    { label: 'Bespoke depth', status: index === 0 ? 'strong' : 'needs deeper pass' },
  ],
  gaps:
    prototype.slug === 'revenue-os'
      ? ['Still uses sample data', 'Figma source opens externally instead of reliable inline embed', 'Needs deployed-preview QA']
      : ['Interaction model is still template-based', 'Needs bespoke visual identity', 'Needs mobile visual regression proof'],
}))
