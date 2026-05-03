import type { Metadata } from 'next'
import { ArtifactsContent } from './artifacts-content'

export const metadata: Metadata = {
  title: 'Artifacts & Evidence — Sage Ideas',
  description: 'Downloadable QA artifacts: test strategies, incident playbooks, security evidence, and architecture templates. The same operational documents the studio uses on production systems.',
  openGraph: {
    title: 'Artifacts & Evidence — Sage Ideas',
    description: 'Downloadable playbooks, templates, checklists, and security evidence from real projects.',
  },
}

export default function ArtifactsPage() {
  return <ArtifactsContent />
}
