import { NextRequest, NextResponse } from 'next/server'
import { getPublicAuditReport } from '@/lib/seo-audit/reports'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function escapeXml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const report = await getPublicAuditReport(id)
  if (!report) {
    return new NextResponse('Not found', { status: 404 })
  }

  const scoreColor = report.score >= 80 ? '#3D5AFE' : report.score >= 55 ? '#A8C633' : '#E85D3A'
  const host = escapeXml(report.host.length > 34 ? `${report.host.slice(0, 31)}...` : report.host)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="140" viewBox="0 0 520 140" role="img" aria-label="SEO audit by Sage Ideas">
  <rect width="520" height="140" rx="0" fill="#0B0B0E"/>
  <rect x="1" y="1" width="518" height="138" fill="none" stroke="#1E1E24"/>
  <text x="28" y="36" fill="#8A8A94" font-family="JetBrains Mono, monospace" font-size="12" letter-spacing="2">SEO AUDIT BY SAGE IDEAS</text>
  <text x="28" y="76" fill="#F2EFE9" font-family="Arial, sans-serif" font-size="26" font-weight="700">${host}</text>
  <text x="28" y="108" fill="#8A8A94" font-family="Arial, sans-serif" font-size="14">Public technical SEO report</text>
  <circle cx="438" cy="70" r="38" fill="rgba(61,90,254,0.08)" stroke="${scoreColor}" stroke-width="3"/>
  <text x="438" y="76" fill="${scoreColor}" font-family="JetBrains Mono, monospace" font-size="22" font-weight="700" text-anchor="middle">${report.score}</text>
  <text x="438" y="96" fill="#8A8A94" font-family="JetBrains Mono, monospace" font-size="9" text-anchor="middle">/100</text>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'public, max-age=300, stale-while-revalidate=86400',
    },
  })
}
