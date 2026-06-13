'use client';

import { useState, useId } from 'react';
import { trackEvent } from '@/lib/analytics/events';
import { Report } from './report';
import type { SeoReport } from '@/lib/seo-audit/analyzer';

type AuditResult = {
  score: number;
  report: SeoReport;
};

export function AuditForm() {
  const urlId = useId();
  const emailId = useId();
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [honey, setHoney] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    trackEvent('lead_magnet_start', { tool: 'seo_audit' });

    try {
      const res = await fetch('/api/tools/seo-audit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url, email, honey }),
      });

      const data = (await res.json()) as
        | AuditResult
        | { error: string }
        | { ok: boolean };

      if (!res.ok) {
        setError('error' in data ? (data as { error: string }).error : 'Something went wrong.');
        return;
      }

      if ('score' in data && 'report' in data) {
        const auditData = data as AuditResult;
        setResult(auditData);
        trackEvent('lead_magnet_complete', { tool: 'seo_audit', score: auditData.score });
      }
    } catch {
      setError('Network error — please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        noValidate
        className="rounded-2xl bg-[#12110F] border border-[#2A2826] p-6 sm:p-8"
        aria-label="SEO audit form"
      >
        {/* Honeypot — hidden from real users */}
        <div aria-hidden className="hidden">
          <label htmlFor="hp-website">Website</label>
          <input
            id="hp-website"
            name="honey"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honey}
            onChange={(e) => setHoney(e.target.value)}
          />
        </div>

        <div className="space-y-5">
          {/* URL field */}
          <div>
            <label
              htmlFor={urlId}
              className="block text-[13px] font-medium text-[#A8A29E] mb-1.5"
            >
              URL to audit
            </label>
            <input
              id={urlId}
              type="url"
              name="url"
              autoComplete="url"
              required
              disabled={loading}
              placeholder="https://yoursite.com/page"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-xl bg-[#09090B] border border-[#2A2826] text-[#F4F2EF] placeholder-[#57534E] px-4 py-3 text-sm font-mono focus:outline-none focus:border-[#0ED3CF] focus:ring-1 focus:ring-[#0ED3CF]/30 disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Email field */}
          <div>
            <label
              htmlFor={emailId}
              className="block text-[13px] font-medium text-[#A8A29E] mb-1.5"
            >
              Email — we&apos;ll send you the report
            </label>
            <input
              id={emailId}
              type="email"
              name="email"
              autoComplete="email"
              required
              disabled={loading}
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl bg-[#09090B] border border-[#2A2826] text-[#F4F2EF] placeholder-[#57534E] px-4 py-3 text-sm focus:outline-none focus:border-[#0ED3CF] focus:ring-1 focus:ring-[#0ED3CF]/30 disabled:opacity-50 transition-colors"
            />
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="rounded-lg bg-[#E85D3A]/10 border border-[#E85D3A]/30 px-4 py-3 text-[13px] text-[#E85D3A]"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !url || !email}
            className="w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 bg-[#0ED3CF] text-[#09090B] text-sm font-semibold font-mono uppercase tracking-wide hover:bg-[#0AA8A5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            style={
              !loading && url && email
                ? { boxShadow: '0 0 16px rgba(14,211,207,0.35)' }
                : undefined
            }
          >
            {loading ? (
              <>
                <span
                  aria-hidden
                  className="h-4 w-4 rounded-full border-2 border-[#09090B]/30 border-t-[#09090B] animate-spin"
                />
                Analyzing…
              </>
            ) : (
              '> Run audit'
            )}
          </button>

          <p className="text-[11px] text-[#57534E] text-center">
            Free · No spam · No account required
          </p>
        </div>
      </form>

      {/* Report */}
      {result && <Report score={result.score} report={result.report} />}
    </div>
  );
}
