import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCertificate } from '@/lib/academy/learner'
import { Certificate } from '@/components/academy/certificate/Certificate'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>
}): Promise<Metadata> {
  const { code } = await params
  const cert = await getCertificate(code)
  return {
    title: cert ? `${cert.courseTitle} — Certificate — Sage Academy` : 'Certificate — Sage Academy',
    robots: { index: false, follow: false },
  }
}

export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const cert = await getCertificate(code)
  if (!cert) notFound()
  return <Certificate cert={cert} />
}
