import Link from 'next/link';
import { ArrowRight, Boxes, Database, Lock, Radar, Workflow } from 'lucide-react';

export const metadata = {
  title: 'Flagship Blueprint: Reliability + Automation Platform',
  description:
    'Recruiter-readable blueprint for a multi-tenant cloud reliability/automation platform: architecture, infra, security, SLOs, and milestones.',
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-dark-lighter bg-dark-card px-3 py-1 text-xs text-gray-200">
      {children}
    </span>
  );
}

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

export default function FlagshipBlueprintPage() {
  return (
    <div className="min-h-screen bg-dark">
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Boxes className="text-primary" size={20} />
            <span className="text-primary font-mono text-sm">Flagship Blueprint</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            Multi-tenant Reliability + Automation Platform
          </h1>
          <p className="mt-4 text-gray-300 max-w-3xl">
            This is the next “big system” that most clearly signals $300k+ cloud/platform capability: multi-tenant SaaS architecture,
            async processing, SLOs, guardrails, and automation. It’s intentionally designed so every claim produces receipts (dashboards,
            alarms, IaC diffs, postmortems, load tests).
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Pill>Multi-tenant RBAC</Pill>
            <Pill>Event ingestion API</Pill>
            <Pill>Queues + workers</Pill>
            <Pill>SLOs + alerts</Pill>
            <Pill>FinOps budgets</Pill>
            <Pill>Security receipts</Pill>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/platform/security-guardrails"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold"
            >
              Security posture in this repo <ArrowRight size={16} />
            </Link>
            <Link
              href="/platform/ops-reliability"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-semibold"
            >
              Ops & reliability in this repo <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <Card title="What it does (product surface)" icon={<Workflow size={18} />}>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  Ingests events (CI runs, test results, deploys, incidents) via API + signed webhooks.
                </li>
                <li>
                  Normalizes/validates events into a contract-first schema.
                </li>
                <li>
                  Computes org-level KPIs, SLOs, error budgets, and trendlines.
                </li>
                <li>
                  Triggers alerts and creates an incident timeline (MTTA/MTTR).
                </li>
              </ul>
            </Card>

            <Card title="Core architecture" icon={<Database size={18} />}>
              <pre className="overflow-x-auto rounded-lg bg-dark-lighter p-4 text-xs text-gray-200 font-mono leading-relaxed">{`Clients / CI / Webhooks
  └─► API Gateway
       └─► Ingestion Service
             ├─ validate + sign + persist
             └─ publish event → Queue

Workers
  └─► consume events
       ├─ enrich (repo metadata)
       ├─ compute KPIs/SLOs
       └─ write projections → Postgres

UI (Next.js)
  └─► dashboards + audit logs + incidents
Alerts
  └─► Slack/Email + on-call simulation`}</pre>
            </Card>

            <Card title="Security (minimum bar for staff-level credibility)" icon={<Lock size={18} />}>
              <ul className="list-disc pl-5 space-y-2">
                <li>Org/user RBAC + audit log + immutable event store</li>
                <li>WAF + rate limiting + request signing + replay protection</li>
                <li>Least-privilege IAM roles for workers and deploys</li>
                <li>Secrets management + OIDC for CI (no long-lived keys)</li>
              </ul>
            </Card>

            <Card title="Reliability + cost signals" icon={<Radar size={18} />}>
              <ul className="list-disc pl-5 space-y-2">
                <li>SLOs for API availability/latency + event processing freshness</li>
                <li>Backpressure via queue depth alarms</li>
                <li>Load tests (k6) proving scaling behavior</li>
                <li>Budgets + cost anomaly playbook + guardrails</li>
              </ul>
            </Card>
          </div>

          <div className="mt-10 bg-dark-card border border-dark-lighter rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground">Milestones (what I’d build in 30/60/90)</h2>
            <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div className="bg-dark-lighter border border-dark-lighter rounded-lg p-4">
                <div className="font-semibold text-foreground">0–30 days</div>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Auth + RBAC + org model</li>
                  <li>Event ingestion API + schema validation</li>
                  <li>Queue + worker skeleton + dashboards v1</li>
                </ul>
              </div>
              <div className="bg-dark-lighter border border-dark-lighter rounded-lg p-4">
                <div className="font-semibold text-foreground">31–60 days</div>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>SLOs + alerts + synthetic monitors</li>
                  <li>Audit log + incident timeline</li>
                  <li>Terraform environments + promotion gates</li>
                </ul>
              </div>
              <div className="bg-dark-lighter border border-dark-lighter rounded-lg p-4">
                <div className="font-semibold text-foreground">61–90 days</div>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Load tests + scaling evidence</li>
                  <li>Cost dashboard + budget guardrails</li>
                  <li>Chaos/incident drills + postmortems</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

