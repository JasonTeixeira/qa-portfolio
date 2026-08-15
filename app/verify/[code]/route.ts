import { NextResponse } from 'next/server'
import { getCertificate } from '@/lib/academy/learner'

/**
 * Public certificate verification endpoint — the thing that makes a Sage Academy
 * certificate worth something: `curl sageideas.dev/verify/<CODE>` returns real JSON,
 * no login, no screenshot to fake. Every field is a real DB value from getCertificate
 * (service-role read); an unknown code returns an honest 404 JSON. CORS-open + short
 * cache so anyone (or any script) can verify a claim independently.
 */
export const dynamic = 'force-dynamic'

const CORS = { 'access-control-allow-origin': '*' } as const

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const cert = await getCertificate(code)

  if (!cert) {
    return NextResponse.json({ status: 'NOT_FOUND', code, revoked: null }, { status: 404, headers: CORS })
  }

  const issued = new Date(cert.issuedAt)
  const issuedIso = Number.isNaN(issued.getTime()) ? null : issued.toISOString().slice(0, 10)

  return NextResponse.json(
    {
      status: cert.revoked ? 'REVOKED' : 'VALID',
      issued: issuedIso,
      lessons: cert.lessonCount,
      proofs_held: cert.artifacts.length,
      revoked: cert.revoked,
    },
    { headers: { ...CORS, 'cache-control': 'public, max-age=60' } },
  )
}
