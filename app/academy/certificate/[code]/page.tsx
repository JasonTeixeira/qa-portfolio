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
  if (!cert) return { title: 'Certificate — Sage Academy', robots: { index: false, follow: false } }
  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sageideas.dev'
  const og = `${site}/og/academy?kind=proof&stat=${encodeURIComponent('✦')}&title=${encodeURIComponent(
    cert.courseTitle,
  )}&subtitle=${encodeURIComponent('Certificate of completion · Sage Academy')}`
  return {
    title: `${cert.courseTitle} — Certificate — Sage Academy`,
    robots: { index: false, follow: false },
    openGraph: { title: `${cert.courseTitle} · Sage Academy certificate`, images: [og] },
    twitter: { card: 'summary_large_image', images: [og] },
  }
}

export default async function CertificatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const cert = await getCertificate(code)
  if (!cert) notFound()
  return <Certificate cert={cert} />
}
