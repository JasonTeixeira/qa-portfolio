import Link from 'next/link';
import {
  Bell,
  CircleDollarSign,
  FileText,
  Lock,
  RotateCcw,
  ShieldCheck,
  Target,
  Wrench,
} from 'lucide-react';
import type { Project } from '@/lib/projectsData';

function EvidenceItem({
  title,
  description,
  icon,
  href,
  external,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href?: string;
  external?: boolean;
}) {
  const base = (
    <div className="h-full rounded-xl border border-dark-lighter bg-dark-card p-5 hover:border-primary/40 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-foreground font-semibold">{title}</div>
          <div className="mt-2 text-sm text-gray-300 leading-relaxed">{description}</div>
        </div>
        <div className="text-primary">{icon}</div>
      </div>
    </div>
  );

  if (!href) return base;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {base}
      </a>
    );
  }

  return (
    <Link href={href} className="block">
      {base}
    </Link>
  );
}

export default function ProjectOpsEvidence({ project }: { project: Project }) {
  // Intentionally: high-signal defaults. We can later make this per-project.
  const isFlagship = project.slug === 'aws-landing-zone-guardrails';
  if (!isFlagship) return null;

  return (
    <section className="my-10">
      <div className="bg-dark-card border border-dark-lighter rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Ops Evidence (this is what “runs systems” looks like)</h2>
            <p className="text-gray-300 text-sm mt-2 max-w-2xl">
              I don’t ship infrastructure and walk away. I treat it like a production system: guardrails, change control,
              observability, cost awareness, and runbooks so someone else can operate it.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/artifacts#evidence"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg hover:bg-primary-dark transition-colors font-semibold"
            >
              <FileText size={16} />
              <span>Open evidence</span>
            </Link>
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-dark border border-dark-lighter rounded-lg hover:border-primary transition-colors"
              >
                <Target size={16} className="text-primary" />
                <span className="text-gray-200">Source repo</span>
              </a>
            )}
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          <EvidenceItem
            title="Cost guardrails"
            description="Budgets + alerts. I keep cloud costs predictable and I can explain the bill."
            icon={<CircleDollarSign size={18} />}
            href="/artifacts#evidence"
          />
          <EvidenceItem
            title="Security + auditability"
            description="Org-level CloudTrail, centralized logs, and SCP guardrails to prevent unsafe actions."
            icon={<ShieldCheck size={18} />}
            href="/platform/quality-telemetry"
          />
          <EvidenceItem
            title="Change control"
            description="Plan-on-PR + gated apply. Infrastructure changes are production changes."
            icon={<Lock size={18} />}
            href={project.proof?.ciRunsUrl}
            external
          />
          <EvidenceItem
            title="Alerts + monitoring"
            description="Health checks + dashboards that catch regressions before a human does."
            icon={<Bell size={18} />}
            href="/dashboard"
          />
          <EvidenceItem
            title="Runbooks"
            description="Rollback, drift detection, incident triage, and cost spike investigation — written down."
            icon={<Wrench size={18} />}
            href="/artifacts"
          />
          <EvidenceItem
            title="Recovery mindset"
            description="I design for failure: blast radius control, safe defaults, and quick recovery paths."
            icon={<RotateCcw size={18} />}
            href="/projects/aws-landing-zone-guardrails"
          />
        </div>

        <p className="mt-6 text-xs text-gray-400">
          Note: this section is intentionally operations-focused. It’s what senior reviewers look for when they ask
          “can this person run systems, not just build demos?”
        </p>
      </div>
    </section>
  );
}

