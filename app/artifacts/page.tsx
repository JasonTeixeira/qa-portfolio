import type { Metadata } from 'next'
import { ArtifactsContent } from './artifacts-content'

export const metadata: Metadata = {
  title: 'Artifacts & Evidence | Jason Teixeira — Playbooks, Templates, Recruiter Pack',
  description: '27 downloadable QA artifacts: test strategies, incident playbooks, security evidence, architecture templates, and a recruiter pack ZIP. Real operational documents from production systems.',
  openGraph: {
    title: 'Artifacts & Evidence — Jason Teixeira',
    description: 'Downloadable playbooks, templates, checklists, and security evidence from real projects.',
  },
}

export default function ArtifactsPage() {
  return <ArtifactsContent />
}
