"use client";

import Link from 'next/link';
import { ArrowRight, Activity, FileText, LayoutDashboard, ShieldCheck } from 'lucide-react';

function Card({
  title,
  description,
  href,
  icon,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-xl border border-dark-lighter bg-dark-card p-6 hover:border-primary/60 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-foreground font-semibold text-lg">{title}</div>
          <div className="mt-2 text-sm text-gray-300 leading-relaxed">{description}</div>
        </div>
        <div className="text-primary">{icon}</div>
      </div>
      <div className="mt-4 inline-flex items-center gap-2 text-primary font-semibold">
        Open <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}

export default function StartHere() {
  const flagshipHref = "/projects/aws-landing-zone-guardrails";

  return (
    <section id="start-here" className="py-20 px-4 sm:px-6 lg:px-8 scroll-mt-24">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-3">
          <Activity className="text-primary" size={20} />
          <span className="text-primary font-mono text-sm">Recruiter / Hiring Manager Quick Start</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Start here (60-second tour)</h2>
        <p className="mt-4 text-gray-300 max-w-3xl">
          If you only have a minute, start with the flagship and the dashboard.
          They’re built to answer one question fast: <span className="text-foreground font-semibold">can this person run systems?</span>
        </p>

        <div className="mt-8 grid md:grid-cols-2 gap-6">
          <Card
            title="Flagship: AWS Landing Zone + Guardrails"
            description="Multi-account AWS Organizations foundation with Terraform, guardrails (SCPs), centralized audit logging, and gated CI workflows. Includes real proof links."
            href={flagshipHref}
            icon={<Activity size={20} />}
          />
          <Card
            title="Telemetry Dashboard (snapshot · live · cloud)"
            description="A production-style dashboard that pulls telemetry from CI. Live mode uses GitHub artifacts; Cloud mode is designed for AWS S3 ingestion with safe fallback."
            href="/dashboard"
            icon={<LayoutDashboard size={20} />}
          />
          <Card
            title="Reference Architecture: Telemetry Pipeline"
            description="Architecture + tradeoffs: CI as an event source, artifact ingestion, caching, safe observability, and the cloud deployment path."
            href="/platform/quality-telemetry"
            icon={<FileText size={20} />}
          />
          <Card
            title="Runbooks & Evidence (how I operate)"
            description="Templates, checklists, playbooks, and proof artifacts (reports/screenshots) that show how I run automation systems in practice."
            href="/artifacts"
            icon={<ShieldCheck size={20} />}
          />
          <Card
            title="Case Studies (automation + infrastructure)"
            description="Deep dives: CI/CD, reliability, testing frameworks, and automation systems with measurable impact and tradeoffs." 
            href="/projects"
            icon={<Activity size={20} />}
          />
        </div>
      </div>
    </section>
  );
}
