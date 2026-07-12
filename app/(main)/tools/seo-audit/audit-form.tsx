'use client';

import { useState, useId } from 'react';
import { trackEvent } from '@/lib/analytics/events';
import { Report } from './report';
import type { SeoReport } from '@/lib/seo-audit/analyzer';

type AuditResult = {
  score: number;
  report: SeoReport;
  shareId?: string | null;
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
        data-testid="seo-audit-form"
        className="border border-[var(--sage-border-strong)] bg-[rgba(20,20,24,0.72)] p-6 sm:p-8"
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
              className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-muted)]"
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
              className="w-full border border-[var(--sage-border-strong)] bg-[var(--sage-bg)] px-4 py-3 font-mono text-sm text-[var(--sage-ink)] placeholder:text-[var(--sage-ink-faint)] transition-colors focus:border-[var(--sage-accent)] focus:outline-none focus:ring-1 focus:ring-[rgba(61,90,254,0.35)] disabled:opacity-50"
            />
          </div>

          {/* Email field */}
          <div>
            <label
              htmlFor={emailId}
              className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--sage-ink-muted)]"
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
              className="w-full border border-[var(--sage-border-strong)] bg-[var(--sage-bg)] px-4 py-3 text-sm text-[var(--sage-ink)] placeholder:text-[var(--sage-ink-faint)] transition-colors focus:border-[var(--sage-accent)] focus:outline-none focus:ring-1 focus:ring-[rgba(61,90,254,0.35)] disabled:opacity-50"
            />
          </div>

          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="border border-[#E85D3A]/30 bg-[#E85D3A]/10 px-4 py-3 text-[13px] text-[#FF8A72]"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !url || !email}
            data-testid="seo-audit-submit"
            className="flex w-full items-center justify-center gap-2 bg-[var(--sage-accent)] px-6 py-3.5 font-mono text-sm font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#5670ff] disabled:cursor-not-allowed disabled:opacity-50"
            style={
              !loading && url && email
                ? { boxShadow: '0 0 18px rgba(61,90,254,0.32)' }
                : undefined
            }
          >
            {loading ? (
              <>
                <span
                  aria-hidden
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                />
                Analyzing…
              </>
            ) : (
              '> Run audit'
            )}
          </button>

          <p className="text-center font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--sage-ink-faint)]">
            Free · No spam · No account required
          </p>
        </div>
      </form>

      {/* Report */}
      {result && <Report score={result.score} report={result.report} shareId={result.shareId} />}
    </div>
  );
}
