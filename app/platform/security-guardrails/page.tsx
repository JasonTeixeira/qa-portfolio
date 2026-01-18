import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  Fingerprint,
  Lock,
  ShieldCheck,
  Siren,
  SlidersHorizontal,
  Wrench,
} from 'lucide-react';

export const metadata = {
  title: 'Security & Guardrails (Receipts)',
  description:
    'Concrete security proof for this portfolio system: threat model, WAF/rate limiting, IAM least privilege, token strategy, and abuse-case mitigations with evidence links.',
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

function EvidenceLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      className="underline text-gray-200 hover:text-white"
      href={href}
      target={href.startsWith('http') ? '_blank' : '_blank'}
      rel="noreferrer"
    >
      {label}
    </a>
  );
}

export default function SecurityGuardrailsPage() {
  return (
    <div className="min-h-screen bg-dark">
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <ShieldCheck className="text-primary" size={20} />
            <span className="text-primary font-mono text-sm">Security & Guardrails</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">Receipts, not buzzwords.</h1>
          <p className="mt-4 text-gray-300 max-w-3xl">
            This page is designed for cloud/infrastructure recruiters and senior engineers. It documents the threat model and the concrete
            guardrails for this portfolio system (AWS telemetry proxy + public dashboard), with direct links to IaC and evidence exports.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark-lighter bg-dark-card text-sm text-gray-200 hover:border-primary/60 transition-colors"
            >
              View dashboard <ArrowRight size={16} className="text-primary" />
            </Link>
            <Link
              href="/platform/ops-reliability"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark-lighter bg-dark-card text-sm text-gray-200 hover:border-primary/60 transition-colors"
            >
              Ops & reliability <ArrowRight size={16} className="text-primary" />
            </Link>
            <Link
              href="/artifacts"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark-lighter bg-dark-card text-sm text-gray-200 hover:border-primary/60 transition-colors"
            >
              Evidence library <ArrowRight size={16} className="text-primary" />
            </Link>
          </div>

          <div className="mt-10 grid md:grid-cols-2 gap-6">
            <Card title="Threat model (abuse cases → mitigations)" icon={<Siren size={18} />}>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>API scraping / abuse:</strong> the AWS telemetry endpoint requires a shared token header; rate limiting is enforced
                  at the edge.
                </li>
                <li>
                  <strong>Secrets exposure:</strong> GitHub token stays server-only; AWS shared token is server-only; the UI never receives
                  secret material.
                </li>
                <li>
                  <strong>Untrusted artifact input:</strong> CI artifacts/ZIPs are treated as untrusted input; metrics are schema-validated.
                </li>
                <li>
                  <strong>Blast radius containment:</strong> public UI degrades to snapshot baseline rather than cascading failure.
                </li>
              </ul>
              <div className="mt-4 text-xs text-gray-400 font-mono">Pattern: least privilege + untrusted input handling + safe degradation</div>
            </Card>

            <Card title="WAF + rate limiting (edge controls)" icon={<SlidersHorizontal size={18} />}>
              <p>
                The API is protected with a WAF/rate-limit story that’s actually reproducible: an attack simulation script and an evidence
                capture.
              </p>
              <ul className="mt-3 list-disc pl-5 space-y-2">
                <li>
                  <strong>Edge WAF:</strong> CloudFront-scope Web ACL + rate-based rule
                </li>
                <li>
                  <strong>API throttling:</strong> API Gateway stage throttling defaults
                </li>
              </ul>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <EvidenceLink
                  href="/artifacts/evidence/waf-rate-limit.txt"
                  label="WAF rate-limit evidence (429)"
                />
                <EvidenceLink
                  href="https://github.com/JasonTeixeira/qa-portfolio/blob/main/scripts/waf-attack-sim.mjs"
                  label="Attack simulation script"
                />
                <EvidenceLink
                  href="https://github.com/JasonTeixeira/qa-portfolio/tree/main/infra/aws-api-edge"
                  label="Terraform: CloudFront + WAF"
                />
                <EvidenceLink
                  href="https://github.com/JasonTeixeira/qa-portfolio/blob/main/infra/aws-api/main.tf"
                  label="Terraform: API throttling"
                />
              </div>
            </Card>

            <Card title="IAM least privilege (policy receipts)" icon={<Fingerprint size={18} />}>
              <p>
                The telemetry proxy Lambda has narrowly-scoped permissions:
              </p>
              <ul className="mt-3 list-disc pl-5 space-y-2">
                <li>
                  <strong>S3 read:</strong> only <span className="font-mono">s3:GetObject</span> for a single key.
                </li>
                <li>
                  <strong>Newsletter DynamoDB access:</strong> limited to required item/query operations.
                </li>
                <li>
                  <strong>Logging:</strong> AWS managed Lambda basic execution role.
                </li>
              </ul>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <EvidenceLink
                  href="/artifacts/evidence/aws-telemetry-github-oidc-role.json"
                  label="GitHub OIDC trust policy (evidence)"
                />
                <EvidenceLink
                  href="https://github.com/JasonTeixeira/qa-portfolio/blob/main/infra/aws-api/main.tf"
                  label="Terraform: IAM policy doc"
                />
              </div>
            </Card>

            <Card title="Token + secrets strategy" icon={<Lock size={18} />}>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>AWS proxy token:</strong> required header <span className="font-mono">x-metrics-token</span> (server-side secret).
                </li>
                <li>
                  <strong>GitHub token:</strong> used only in server routes; never returned to the browser.
                </li>
                <li>
                  <strong>No long-lived AWS keys:</strong> CI publishes via GitHub OIDC (federation).
                </li>
              </ul>
              <div className="mt-4 grid sm:grid-cols-2 gap-3">
                <EvidenceLink
                  href="https://github.com/JasonTeixeira/qa-portfolio/blob/main/OPS_READINESS_DASHBOARD.md"
                  label="Ops readiness: token protection"
                />
                <EvidenceLink
                  href="https://github.com/JasonTeixeira/qa-portfolio/tree/main/infra/aws-quality-telemetry"
                  label="Terraform: OIDC writer role"
                />
              </div>
            </Card>
          </div>

          <div className="mt-10 bg-dark-card border border-dark-lighter rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Wrench className="text-primary" size={18} />
              <h2 className="text-lg font-semibold text-foreground">Rate limiting in-app (portfolio baseline)</h2>
            </div>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              For lightweight protection on public forms (contact/newsletter), the portfolio includes an in-memory limiter appropriate for a
              small footprint. In multi-instance production, this would be swapped to a shared store (DynamoDB/Redis).
            </p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <EvidenceLink
                href="https://github.com/JasonTeixeira/qa-portfolio/blob/main/lib/rateLimit.ts"
                label="Rate limit helper (code)"
              />
              <EvidenceLink
                href="https://github.com/JasonTeixeira/qa-portfolio/blob/main/app/api/contact/route.ts"
                label="Contact API: 429 on abuse"
              />
            </div>
            <div className="mt-4 text-xs text-gray-400 font-mono">
              Pattern: cheap baseline protections + clear upgrade path
            </div>
          </div>

          <div className="mt-10 bg-dark-card border border-dark-lighter rounded-xl p-6">
            <div className="flex items-center gap-3">
              <Activity className="text-primary" size={18} />
              <h2 className="text-lg font-semibold text-foreground">Auditability</h2>
            </div>
            <p className="mt-3 text-sm text-gray-300 leading-relaxed">
              Security posture isn’t “trust me”. It’s visible: infrastructure is defined as code, monitoring is exported as evidence, and
              the production verifier proves the runtime path (cloud proxy vs snapshot fallback).
            </p>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <EvidenceLink
                href="https://github.com/JasonTeixeira/qa-portfolio/tree/main/infra"
                label="Infra as code (Terraform)"
              />
              <EvidenceLink href="/artifacts" label="Evidence library" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

