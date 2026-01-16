import Link from 'next/link';
import { Activity, GitBranch, Database, ShieldCheck, Gauge, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Quality Telemetry System Design',
  description:
    'How this portfolio ingests CI artifacts, produces contract-first QA telemetry, and renders a live-style dashboard with an AWS cloud deployment path and graceful fallback.',
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-dark-lighter bg-dark-card px-3 py-1 text-xs text-gray-200">
      {children}
    </span>
  );
}

function Block({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-dark-card border border-dark-lighter rounded-xl p-6">
      <div className="flex items-center gap-3">
        <div className="text-primary">{icon}</div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      </div>
      <div className="mt-4 text-sm text-gray-300 leading-relaxed">{children}</div>
    </div>
  );
}

export default function QualityTelemetryDesignPage() {
  return (
    <div className="min-h-screen bg-dark">
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="text-primary" size={20} />
            <span className="text-primary font-mono text-sm">System Design</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            Quality Telemetry Pipeline
          </h1>
          <p className="mt-4 text-gray-300 max-w-3xl">
            This portfolio isn’t just a UI—it&apos;s a small quality platform. It collects evidence from CI, turns it into structured telemetry,
            and displays it as a live-style dashboard.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Pill>GitHub Actions</Pill>
            <Pill>Artifact ingestion (ZIP)</Pill>
            <Pill>Schema-driven metrics</Pill>
            <Pill>AWS S3 cloud mode</Pill>
            <Pill>Graceful fallback</Pill>
            <Pill>Vercel-friendly</Pill>
          </div>

          <div className="mt-10 bg-dark-card border border-dark-lighter rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground">Architecture (high level)</h2>
            <p className="mt-2 text-sm text-gray-300">
              The key idea: treat CI as an event source and artifacts as a transport for evidence.
            </p>

            <pre className="mt-4 overflow-x-auto rounded-lg bg-dark-lighter p-4 text-xs text-gray-200 font-mono leading-relaxed">
{`QA repos (pytest/playwright/allure)
  └─ GitHub Actions workflow
       ├─ runs tests
       ├─ writes qa-metrics.json (schema)
       ├─ uploads artifact: qa-metrics (zip)
       └─ uploads evidence artifacts (optional)

Optional Cloud Mode (AWS)
  └─ GitHub OIDC → assume IAM role (no long-lived keys)
       └─ write latest.json to S3 (cost-controlled retention)

qa-portfolio (Next.js on Vercel)
  ├─ /api/quality (server)
  │    ├─ fetches recent workflow runs
  │    ├─ finds newest run containing qa-metrics artifact
  │    ├─ downloads artifact zip
  │    ├─ extracts qa-metrics.json
  │    └─ returns merged snapshot + telemetry (snapshot/live/cloud)
  └─ /dashboard (client)
       └─ renders KPIs + links + debug/observability`}
            </pre>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold"
              >
                View dashboard <ArrowRight size={16} />
              </Link>
              <Link
                href="/artifacts"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold"
              >
                View artifacts library <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <Block title="Reliability / Fall Back" icon={<GitBranch size={18} />}>
              Live data is best-effort. If GitHub rate-limits or a repo has no artifact on the latest run, the API scans recent runs and
              still returns a coherent response. If live fetch fails entirely, the dashboard degrades to the committed snapshot.
              <div className="mt-3 text-xs text-gray-400 font-mono">
                Pattern: progressive enrichment + deterministic baseline
              </div>
            </Block>

            <Block title="Data Contract" icon={<Database size={18} />}>
              Metrics are schema-driven (see <code className="text-gray-100">QUALITY_METRICS_SCHEMA.md</code>). Workflows generate
              <code className="text-gray-100"> qa-metrics.json</code> so the portfolio stays decoupled from individual frameworks.
              <div className="mt-3 text-xs text-gray-400 font-mono">
                Pattern: contract-first telemetry
              </div>
            </Block>

            <Block title="Security / Evidence" icon={<ShieldCheck size={18} />}>
              The API exposes only safe metadata (run IDs/URLs, scan depth). Secrets never leave the server. Evidence artifacts (reports,
              junit xml) are linked, not embedded.
              <div className="mt-3 text-xs text-gray-400 font-mono">
                Pattern: least privilege + safe observability
              </div>
            </Block>

            <Block title="Performance" icon={<Gauge size={18} />}>
              The API caches responses briefly to reduce GitHub API calls. Live mode is designed to be Vercel-friendly (serverless execution,
              short compute, explicit no-store).
              <div className="mt-3 text-xs text-gray-400 font-mono">
                Pattern: cache + rate-limit aware design
              </div>
            </Block>
          </div>

          <div className="mt-10 bg-dark-card border border-dark-lighter rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground">Threat model (abuse cases + mitigations)</h2>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              This is intentionally a <strong>read-only telemetry surface</strong>. The system is designed so that even if someone abuses the
              public endpoints, the blast radius stays small.
            </p>
            <ul className="mt-4 text-sm text-gray-300 list-disc pl-5 space-y-2">
              <li>
                <strong>GitHub API rate-limit abuse:</strong> requests are cached briefly, and the API falls back to the committed snapshot.
              </li>
              <li>
                <strong>Token exposure:</strong> GitHub token stays server-only; the client never receives it. Responses include only safe
                metadata (run URLs/IDs) and sanitized debug fields.
              </li>
              <li>
                <strong>Artifact / ZIP attacks:</strong> artifacts are treated as untrusted input. Extraction is scoped to expected filenames
                and the metrics payload must validate against the schema.
              </li>
              <li>
                <strong>Data leakage:</strong> no secrets, logs, or raw environment are embedded in the dashboard. Evidence is linked, not
                embedded.
              </li>
              <li>
                <strong>Denial-of-service:</strong> live mode is best-effort; failures degrade gracefully to static mode rather than
                cascading.
              </li>
            </ul>
            <div className="mt-4 text-xs text-gray-400 font-mono">
              Patterns: least privilege + untrusted input handling + graceful degradation
            </div>
          </div>

          <div className="mt-10 bg-dark-card border border-dark-lighter rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground">What this demonstrates</h2>
            <ul className="mt-3 text-sm text-gray-300 list-disc pl-5 space-y-2">
              <li>Cloud/platform automation: CI as an event source, artifacts as evidence, optional AWS S3 cloud ingestion.</li>
              <li>Backend skills: API composition, schema contracts, caching, resilience to partial failure.</li>
              <li>Security posture: least privilege patterns (server-only tokens, OIDC-ready cloud auth).</li>
              <li>Product thinking: a dashboard that explains itself and links directly to proof (runs/reports).</li>
            </ul>
          </div>

          <div className="mt-10 bg-dark-card border border-dark-lighter rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground">Cloud deployment path (low cost)</h2>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              Cloud mode is designed to be budget-friendly: S3-only storage (optional DynamoDB) with lifecycle retention.
              GitHub Actions can authenticate using OIDC (no long-lived AWS keys).
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="/platform/aws-telemetry-deploy"
                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold"
              >
                Deployment guide <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
