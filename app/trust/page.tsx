import type { Metadata } from 'next'
import { TrustContent } from './trust-content'

export const metadata: Metadata = {
  alternates: { canonical: 'https://sageideas.dev/trust' },
  title: 'Trust — Sage Ideas',
  description:
    'The engineering evidence behind Sage Ideas: 9 certifications, 13 testing frameworks, Terraform-managed infrastructure, CI/CD on every project, and a public GitHub record.',
  openGraph: {
    images: ['/og?title=Why+Teams+Trust+the+Studio&subtitle=The+receipts.'],
  },
}

export default function TrustPage() {
  return <TrustContent />
}
