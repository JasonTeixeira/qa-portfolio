import Link from "next/link";
import { Activity, ArrowRight, Cloud, FileText, Github, LayoutDashboard, ShieldCheck, Sparkles } from "lucide-react";

type ProofLink = {
  label: string;
  href: string;
  external?: boolean;
};

function ProofLinks({ links }: { links: ProofLink[] }) {
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      {links.map((l) =>
        l.external ? (
          <a
            key={l.label}
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-3 py-2 bg-dark border border-dark-lighter rounded-lg hover:border-primary transition-colors text-sm"
          >
            <span className="font-semibold text-foreground">{l.label}</span>
            <ArrowRight size={14} className="text-primary opacity-80" />
          </a>
        ) : (
          <Link
            key={l.label}
            href={l.href}
            className="inline-flex items-center gap-2 px-3 py-2 bg-dark border border-dark-lighter rounded-lg hover:border-primary transition-colors text-sm"
          >
            <span className="font-semibold text-foreground">{l.label}</span>
            <ArrowRight size={14} className="text-primary opacity-80" />
          </Link>
        )
      )}
    </div>
  );
}

function FlagshipCard({
  title,
  icon,
  outcome,
  proves,
  href,
  links,
}: {
  title: string;
  icon: React.ReactNode;
  outcome: string;
  proves: string;
  href: string;
  links: ProofLink[];
}) {
  return (
    <div className="rounded-2xl border border-dark-lighter bg-dark-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="mt-3 text-sm text-gray-300 leading-relaxed">
            <span className="text-foreground font-semibold">Outcome:</span> {outcome}
          </p>
          <p className="mt-2 text-sm text-gray-300 leading-relaxed">
            <span className="text-foreground font-semibold">What it proves:</span> {proves}
          </p>
        </div>
        <div className="text-primary">{icon}</div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={href}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg hover:bg-primary-dark transition-colors text-sm font-semibold"
        >
          Open case study <ArrowRight size={16} />
        </Link>
      </div>

      <ProofLinks links={links} />
    </div>
  );
}

export default function StartRecruiterModePage() {
  return (
    <main className="min-h-screen bg-dark">
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="text-primary" size={20} />
            <span className="text-primary font-mono text-sm">Recruiter Mode</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight">
            Start here (90-second tour)
          </h1>
          <p className="mt-5 text-gray-300 max-w-3xl leading-relaxed">
            I’m an <span className="text-foreground font-semibold">Automation Engineer</span> who also builds
            production-minded apps — then wires in the automation, CI gates, and telemetry to keep them healthy.
            This page is designed for remote recruiting: async-friendly docs, proof links, and receipts.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <a
              href="/resume.pdf"
              download
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-dark font-semibold rounded-lg hover:bg-primary-dark transition-colors"
            >
              Download resume <FileText size={18} />
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-dark transition-colors"
            >
              Contact <ArrowRight size={18} />
            </Link>
          </div>

          {/* Proof bundle (one-click) */}
          <div className="mt-10 rounded-2xl border border-dark-lighter bg-dark-card p-6">
            <div className="flex items-center gap-3 mb-3">
              <Activity className="text-primary" size={18} />
              <h2 className="text-xl font-bold text-foreground">Proof bundle (one-click)</h2>
            </div>
            <p className="text-gray-300 leading-relaxed max-w-3xl">
              Fastest path to evaluation: open the dashboard, flip modes, and follow the receipts. Everything is
              built to be safe on a public portfolio (no secrets) with graceful fallbacks.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg hover:bg-primary-dark transition-colors font-semibold"
              >
                Dashboard <LayoutDashboard size={18} />
              </Link>
              <Link
                href="/platform/quality-telemetry"
                className="inline-flex items-center gap-2 px-4 py-2 bg-dark border border-dark-lighter rounded-lg hover:border-primary transition-colors font-semibold"
              >
                System design <ArrowRight size={18} />
              </Link>
              <Link
                href="/artifacts#evidence"
                className="inline-flex items-center gap-2 px-4 py-2 bg-dark border border-dark-lighter rounded-lg hover:border-primary transition-colors font-semibold"
              >
                Evidence <ArrowRight size={18} />
              </Link>
              <a
                href="https://github.com/JasonTeixeira/qa-portfolio/actions"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-dark border border-dark-lighter rounded-lg hover:border-primary transition-colors font-semibold"
              >
                CI runs <ArrowRight size={18} />
              </a>
              <a
                href="/QA_E2E_TEST_MATRIX.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-dark border border-dark-lighter rounded-lg hover:border-primary transition-colors font-semibold"
              >
                Test matrix <ArrowRight size={18} />
              </a>
            </div>

            <div className="mt-5 text-sm text-gray-400">
              Remote-friendly: every link is designed to answer “is this real?” without needing a live call.
            </div>
          </div>

          {/* Remote-ready workflow */}
          <div className="mt-10 grid lg:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-dark-lighter bg-dark-card p-6">
              <h3 className="text-lg font-bold text-foreground">How I ship (async)</h3>
              <ul className="mt-3 text-sm text-gray-300 leading-relaxed space-y-2 list-disc pl-5">
                <li>Small, reviewable PRs with clear intent</li>
                <li>CI gates + artifacts as receipts</li>
                <li>Docs + diagrams so knowledge isn’t tribal</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-dark-lighter bg-dark-card p-6">
              <h3 className="text-lg font-bold text-foreground">How I build apps</h3>
              <ul className="mt-3 text-sm text-gray-300 leading-relaxed space-y-2 list-disc pl-5">
                <li>Next.js + API routes + typed data contracts</li>
                <li>Quality built-in: tests, lint, validation</li>
                <li>Designed for safe public runtime (no secrets)</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-dark-lighter bg-dark-card p-6">
              <h3 className="text-lg font-bold text-foreground">Interview pack</h3>
              <p className="mt-3 text-sm text-gray-300 leading-relaxed">
                Coming next: 3 flagship 1-pagers + an evidence index + a 30/60/90 plan.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  href="/artifacts"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-dark border border-dark-lighter rounded-lg hover:border-primary transition-colors font-semibold"
                >
                  Browse artifacts <ArrowRight size={18} />
                </Link>
                <a
                  href="/artifacts/recruiter-pack.zip"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-dark transition-colors font-semibold"
                >
                  Recruiter pack (ZIP) <FileText size={18} />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 grid lg:grid-cols-3 gap-6">
            <FlagshipCard
              title="AWS Landing Zone + Guardrails"
              icon={<ShieldCheck size={22} />}
              outcome="Multi-account governance baseline + centralized audit logging + gated Terraform plan/apply workflow (low-cost, reproducible)."
              proves="Terraform discipline, AWS org governance, change control, security guardrails, ops documentation."
              href="/projects/aws-landing-zone-guardrails"
              links={[
                { label: "Repo", href: "https://github.com/JasonTeixeira/Landing-Zone-Guardrails", external: true },
                { label: "CI runs", href: "https://github.com/JasonTeixeira/Landing-Zone-Guardrails/actions", external: true },
                { label: "Evidence", href: "/artifacts#evidence" },
                { label: "Security guardrails write-up", href: "/platform/security-guardrails" },
              ]}
            />

            <FlagshipCard
              title="Quality Telemetry Dashboard (this portfolio)"
              icon={<LayoutDashboard size={22} />}
              outcome="A quality health dashboard that stays reliable in public: snapshot/live/cloud modes + caching + fallbacks + evidence exports."
              proves="App building (Next.js), API routes, CI artifact ingestion, observability mindset, graceful degradation."
              href="/projects/quality-telemetry-dashboard"
              links={[
                { label: "Portfolio repo", href: "https://github.com/JasonTeixeira/qa-portfolio", external: true },
                { label: "CI runs", href: "https://github.com/JasonTeixeira/qa-portfolio/actions", external: true },
                { label: "Live dashboard", href: "/dashboard" },
                { label: "System design", href: "/platform/quality-telemetry" },
              ]}
            />

            <FlagshipCard
              title="API Test Automation Framework"
              icon={<Cloud size={22} />}
              outcome="A reliability-focused API test system: selective retries for 429/5xx + schema validation + session pooling to reduce flaky signal."
              proves="Test architecture, resilience engineering, CI trust, clean API client design, readable tests."
              href="/projects/api-testing-framework"
              links={[
                { label: "Repo", href: "https://github.com/JasonTeixeira/API-Test-Automation-Wireframe", external: true },
                { label: "CI runs", href: "https://github.com/JasonTeixeira/API-Test-Automation-Wireframe/actions", external: true },
                { label: "Quality telemetry concept", href: "/platform/quality-telemetry" },
                { label: "Artifacts library", href: "/artifacts" },
              ]}
            />
          </div>

          <div className="mt-12 rounded-2xl border border-dark-lighter bg-dark-card p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="text-primary" size={20} />
              <h2 className="text-xl font-bold text-foreground">If you only click one thing</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Open the dashboard, flip modes, and follow the proof links. That is the fastest way to see how I build
              applications and instrument them with automation and evidence.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-dark rounded-lg hover:bg-primary-dark transition-colors font-semibold"
              >
                Open dashboard <LayoutDashboard size={18} />
              </Link>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-dark transition-colors font-semibold"
              >
                Browse case studies <ArrowRight size={18} />
              </Link>
              <a
                href="https://github.com/JasonTeixeira"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-dark border border-dark-lighter rounded-lg hover:border-primary transition-colors font-semibold"
              >
                GitHub <Github size={18} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
