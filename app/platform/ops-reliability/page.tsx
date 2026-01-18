import Link from 'next/link';
import { Activity, AlarmClock, ArrowRight, ClipboardList, ShieldCheck, Timer, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Ops & Reliability (SLOs + Incident Drills)',
  description:
    'Recruiter-friendly proof that this portfolio is operated like a production system: SLOs/SLIs, error budgets, incident drills, and postmortem-style evidence.',
};

function Card({
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

export default function OpsReliabilityPage() {
  return (
    <div className="min-h-screen bg-dark">
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Activity className="text-primary" size={20} />
            <span className="text-primary font-mono text-sm">Ops & Reliability</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">SLOs + Incident Drills</h1>
          <p className="mt-4 text-gray-300 max-w-3xl">
            This portfolio is intentionally operated like a production system. Recruiters can skim this page and see the exact
            signals senior cloud/platform teams look for: SLOs/SLIs, error budgets, alerting intent, and a repeatable incident drill loop.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark-lighter bg-dark-card text-sm text-gray-200 hover:border-primary/60 transition-colors"
            >
              View dashboard <ArrowRight size={16} className="text-primary" />
            </Link>
            <Link
              href="/platform/quality-telemetry"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark-lighter bg-dark-card text-sm text-gray-200 hover:border-primary/60 transition-colors"
            >
              Telemetry system design <ArrowRight size={16} className="text-primary" />
            </Link>
            <Link
              href="/artifacts"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark-lighter bg-dark-card text-sm text-gray-200 hover:border-primary/60 transition-colors"
            >
              Evidence + runbooks <ArrowRight size={16} className="text-primary" />
            </Link>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <Card title="SLOs (targets)" icon={<TrendingUp size={18} />}>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Dashboard availability:</strong> 99.9% monthly (public pages + API health)
                </li>
                <li>
                  <strong>Telemetry freshness:</strong> metrics updated within 24h (CI snapshot) and “live” is best-effort
                </li>
                <li>
                  <strong>AWS proxy reliability:</strong> 99.9% for <span className="font-mono">/metrics/latest</span>
                </li>
              </ul>
              <div className="mt-3 text-xs text-gray-400 font-mono">
                Why this matters: high-comp cloud roles are hired to hit SLOs under cost and security constraints.
              </div>
            </Card>

            <Card title="SLIs (how we measure)" icon={<Timer size={18} />}>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Availability:</strong> synthetic HTTP checks (dashboard + /api/quality)</li>
                <li><strong>Latency:</strong> p95 response times (CloudWatch + logs)</li>
                <li><strong>Error rate:</strong> Lambda errors + API Gateway 4xx/5xx</li>
              </ul>
              <div className="mt-3 text-xs text-gray-400 font-mono">
                Pattern: measure → alert → drill → postmortem → fix.
              </div>
            </Card>

            <Card title="Incident drills (repeatable loop)" icon={<ClipboardList size={18} />}>
              <p>
                I run small, contained drills that simulate common failure modes (rate limits, missing artifacts, AWS proxy token mismatch,
                missing S3 object). The goal isn’t perfection — it’s proving the feedback loop and the operator mindset.
              </p>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <a
                  className="underline text-gray-200 hover:text-white"
                  href="/artifacts/playbooks/incident-triage-playbook.md"
                  target="_blank"
                  rel="noreferrer"
                >
                  Incident triage playbook
                </a>
                <a
                  className="underline text-gray-200 hover:text-white"
                  href="/artifacts/evidence/incident-drill-report.md"
                  target="_blank"
                  rel="noreferrer"
                >
                  Incident drill report (evidence)
                </a>
              </div>
            </Card>

            <Card title="Security + blast radius" icon={<ShieldCheck size={18} />}>
              <ul className="list-disc pl-5 space-y-2">
                <li>No AWS credentials in Vercel runtime (proxy pattern)</li>
                <li>Least-privilege IAM + GitHub OIDC for CI publishing</li>
                <li>Fail-safe degradation (snapshot baseline) prevents cascading outages</li>
              </ul>
              <div className="mt-4 inline-flex items-center gap-2 text-sm">
                <AlarmClock size={16} className="text-primary" />
                <span>
                  Next: add explicit “Security & Guardrails” receipts page (WAF + IAM + threat model)
                </span>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}

