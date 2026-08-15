import type { Metadata } from 'next'
import { LegalDocViewer } from './LegalDocViewer'

export const metadata: Metadata = {
  title: 'Legal — Sage Academy',
  description:
    'Sage Academy terms of service, privacy, and refund policy — with plain-language summaries above the binding text.',
  robots: { index: false, follow: false },
}

export default function AcademyLegalPage() {
  return <LegalDocViewer />
}
