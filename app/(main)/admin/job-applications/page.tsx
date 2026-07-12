import {
  BriefcaseBusiness,
  ClipboardCheck,
  FileText,
  Gauge,
  Layers3,
  MailCheck,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { AdminTopbar } from '@/components/admin/topbar';
import { requireAdmin } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/server';
import { buildJobApplicationOsRun } from '@/lib/job-application-os/core';
import {
  importJobOsDataset,
  recordJobOsOutcome,
  recordJobOsSubmissionEvidence,
  runJobApplicationOsProof,
  runJobOsLivePublicSourceProof,
  runJobOsMeasuredLoadProof,
} from './actions';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Job Application OS' };

type RecentApplicationRow = {
  id: string;
  run_key: string | null;
  stage: string;
  priority_rank: number | null;
  next_action: string | null;
  created_at: string;
  metadata: {
    target?: {
      job?: {
        title?: string;
        company?: string;
      };
      fit?: {
        overall?: number;
        recommendation?: string;
      };
      resumeVersionId?: string;
    };
  } | null;
};

type ArtifactRow = {
  id: string;
  filename: string;
  artifact_type: string;
  checksum: string;
  created_at: string;
};

type LiveProofRow = {
  id: string;
  provider: string;
  status: string;
  imported: number;
  evidence: string | null;
  created_at: string;
};

type ReadinessAuditRow = {
  id: string;
  score: number;
  grade: string;
  passed: string[] | null;
  gaps: string[] | null;
  created_at: string;
};

type DatasetImportRow = {
  id: string;
  dataset_name: string;
  source_type: string;
  rows_imported: number;
  rows_rejected: number;
  created_at: string;
};

type StrategyRow = {
  id: string;
  priority: number;
  action: string;
  rationale: string;
  expected_impact: string;
  status: string;
  created_at: string;
};

type ProofGapRow = {
  id: string;
  gap: string;
  keyword: string;
  frequency: number;
  recommended_artifact: string;
  priority: string;
};

type MeasuredLoadRow = {
  id: string;
  jobs: number;
  applications: number;
  packets: number;
  p95_dashboard_ms: number;
  p95_export_ms: number;
  status: string;
  created_at: string;
};

type CaptureSessionRow = {
  id: string;
  source: string;
  status: string;
  capture_url: string;
  checklist: string[] | null;
  evidence_required: string[] | null;
  created_at: string;
};

const PROGRAMS = [
  ['1', 'Candidate profile database'],
  ['2', 'Resume/version history system'],
  ['3', 'Application CRM lifecycle'],
  ['4', 'Skill inventory and proof mapping'],
  ['5', 'Project/story bank for STAR answers'],
  ['6', 'Role preference model'],
  ['7', 'Greenhouse/Lever/Ashby/Workable ingestion'],
  ['8', 'LinkedIn/manual job capture'],
  ['9', 'Deduplication across sources'],
  ['10', 'Company/job enrichment'],
  ['11', 'Structured JD parser'],
  ['12', 'Knockout-rule detection'],
  ['13', 'Skill-gap and match scoring'],
  ['14', 'Priority ranking and daily queue'],
  ['15', 'Resume variant generator'],
  ['16', 'Cover letter generator'],
  ['17', 'Recruiter message generator'],
  ['18', 'ATS keyword coverage correction'],
  ['19', 'Kanban application workflow'],
  ['20', 'Manual submission assistant'],
  ['21', 'Submission proof capture'],
  ['22', 'Recruiter/contact discovery'],
  ['23', 'Personalized outreach sequences'],
  ['24', 'Gmail/recruiter reply classification'],
  ['25', 'Company research brief'],
  ['26', 'Role-specific interview prep'],
  ['27', 'Thank-you/follow-up tracker'],
  ['28', 'Response-rate analytics'],
  ['29', 'Resume/message A/B tests'],
  ['30', 'Conversion funnel'],
  ['31', 'Manual approval gates'],
  ['32', 'Sensitive answer vault'],
  ['33', 'Evidence/privacy controls'],
  ['34', 'Observability and alerts'],
  ['35', 'Provider health/quota monitoring'],
  ['36', 'Load and staging proof'],
] as const;

async function countTable(table: string) {
  const sb = supabaseAdmin();
  const { count, error } = await sb.from(table).select('id', { count: 'exact', head: true });
  return error ? 0 : count ?? 0;
}

async function recentApplications() {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('job_os_applications')
    .select('id, run_key, stage, priority_rank, next_action, created_at, metadata')
    .order('created_at', { ascending: false })
    .limit(6);
  return (data ?? []) as RecentApplicationRow[];
}

async function recentArtifacts() {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('job_os_resume_artifacts')
    .select('id, filename, artifact_type, checksum, created_at')
    .order('created_at', { ascending: false })
    .limit(6);
  return (data ?? []) as ArtifactRow[];
}

async function recentLiveProofs() {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('job_os_live_source_proofs')
    .select('id, provider, status, imported, evidence, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  return (data ?? []) as LiveProofRow[];
}

async function latestReadinessAudit() {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('job_os_readiness_audits')
    .select('id, score, grade, passed, gaps, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as ReadinessAuditRow | null;
}

async function recentDatasetImports() {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('job_os_dataset_imports')
    .select('id, dataset_name, source_type, rows_imported, rows_rejected, created_at')
    .order('created_at', { ascending: false })
    .limit(4);
  return (data ?? []) as DatasetImportRow[];
}

async function recentStrategies() {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('job_os_strategy_recommendations')
    .select('id, priority, action, rationale, expected_impact, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  return (data ?? []) as StrategyRow[];
}

async function recentProofGaps() {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('job_os_proof_gap_recommendations')
    .select('id, gap, keyword, frequency, recommended_artifact, priority')
    .order('created_at', { ascending: false })
    .limit(5);
  return (data ?? []) as ProofGapRow[];
}

async function latestMeasuredLoad() {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('job_os_measured_load_runs')
    .select('id, jobs, applications, packets, p95_dashboard_ms, p95_export_ms, status, created_at')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  return data as MeasuredLoadRow | null;
}

async function recentCaptureSessions() {
  const sb = supabaseAdmin();
  const { data } = await sb
    .from('job_os_browser_capture_sessions')
    .select('id, source, status, capture_url, checklist, evidence_required, created_at')
    .order('created_at', { ascending: false })
    .limit(5);
  return (data ?? []) as CaptureSessionRow[];
}

function scoreColor(score: number) {
  if (score >= 85) return 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10';
  if (score >= 70) return 'text-cyan-300 border-cyan-500/30 bg-cyan-500/10';
  return 'text-amber-300 border-amber-500/30 bg-amber-500/10';
}

export default async function JobApplicationsPage() {
  const actor = await requireAdmin();
  const run = buildJobApplicationOsRun();
  const runKey = `job-os-${Date.now()}`;
  const [
    candidateCount,
    resumeCount,
    jobCount,
    applicationCount,
    packetCount,
    evidenceCount,
    recruiterCount,
    interviewKitCount,
    artifactCount,
    outcomeCount,
    datasetImportCount,
    strategyCount,
    proofGapCount,
    measuredLoadCount,
    recent,
    artifacts,
    liveProofs,
    readinessAudit,
    datasetImports,
    strategies,
    proofGaps,
    measuredLoad,
    captureSessions,
  ] = await Promise.all([
    countTable('job_os_candidate_profiles'),
    countTable('job_os_resume_versions'),
    countTable('job_os_jobs'),
    countTable('job_os_applications'),
    countTable('job_os_application_packets'),
    countTable('job_os_submission_evidence'),
    countTable('job_os_recruiter_contacts'),
    countTable('job_os_interview_kits'),
    countTable('job_os_resume_artifacts'),
    countTable('job_os_outcomes'),
    countTable('job_os_dataset_imports'),
    countTable('job_os_strategy_recommendations'),
    countTable('job_os_proof_gap_recommendations'),
    countTable('job_os_measured_load_runs'),
    recentApplications(),
    recentArtifacts(),
    recentLiveProofs(),
    latestReadinessAudit(),
    recentDatasetImports(),
    recentStrategies(),
    recentProofGaps(),
    latestMeasuredLoad(),
    recentCaptureSessions(),
  ]);
  const displayedProofGaps = proofGaps.length
    ? proofGaps.map((gap) => ({
      keyword: gap.keyword,
      frequency: gap.frequency,
      priority: gap.priority,
      recommendedArtifact: gap.recommended_artifact,
    }))
    : run.proofGapRecommendations.map((gap) => ({
      keyword: gap.keyword,
      frequency: gap.frequency,
      priority: gap.priority,
      recommendedArtifact: gap.recommendedArtifact,
    }));
  const displayedCaptureSessions = captureSessions.length
    ? captureSessions.map((session) => ({
      source: session.source,
      status: session.status,
      captureUrl: session.capture_url,
      evidenceRequired: session.evidence_required ?? [],
    }))
    : run.browserCaptureSessions.map((session) => ({
      source: session.source,
      status: session.status,
      captureUrl: session.captureUrl,
      evidenceRequired: session.evidenceRequired,
    }));

  return (
    <div className="min-h-screen bg-[#09090B] text-[#fafafa]">
      <AdminTopbar
        email={actor.profile.email}
        fullName={actor.profile.full_name}
        crumbs={[{ label: 'Job Application OS' }]}
      />

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6 lg:px-8" data-testid="job-application-os-dashboard">
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">
                  <BriefcaseBusiness className="h-4 w-4" />
                  Job Application OS
                </div>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-[#fafafa]">
                  Premium application pipeline
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-[#a1a1aa]">
                  First-class system for finding, scoring, tailoring, tracking, and proving job applications with manual-final-submit safety.
                </p>
              </div>
              <form action={runJobApplicationOsProof} className="flex flex-wrap items-center gap-2" data-testid="job-os-proof-form">
                <input
                  name="runKey"
                  defaultValue={runKey}
                  aria-label="Job Application OS proof run key"
                  className="w-56 rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa] placeholder:text-[#52525b] focus:border-[#06b6d4]/60 focus:outline-none"
                />
                <button
                  type="submit"
                  data-testid="job-os-run-proof"
                  className="rounded-lg border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-3 py-2 text-xs font-semibold text-[#67e8f9] transition-colors hover:bg-[#06b6d4]/15"
                >
                  Run proof
                </button>
              </form>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-5">
              {[
                ['Captured', run.summary.captured],
                ['Deduped', run.summary.deduped],
                ['Apply now', run.summary.applyNow],
                ['Packets', run.summary.readyPackets],
                ['Avg fit', run.summary.averageFit],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">{label}</div>
                  <div className="mt-1 text-2xl font-semibold tabular-nums text-[#fafafa]">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#fafafa]">Persistence health</h2>
                <p className="mt-1 text-xs text-[#71717a]">Counts update after proof runs and migrations are applied.</p>
              </div>
              <ShieldCheck className="h-4 w-4 text-[#06b6d4]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Profiles', candidateCount],
                ['Resumes', resumeCount],
                ['Jobs', jobCount],
                ['Applications', applicationCount],
                ['Packets', packetCount],
                ['Evidence', evidenceCount],
                ['Recruiters', recruiterCount],
                ['Interviews', interviewKitCount],
                ['Artifacts', artifactCount],
                ['Outcomes', outcomeCount],
                ['Datasets', datasetImportCount],
                ['Strategy', strategyCount],
                ['Proof gaps', proofGapCount],
                ['Load runs', measuredLoadCount],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">{label}</div>
                  <div className="mt-1 text-xl font-semibold tabular-nums text-[#fafafa]">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3" data-testid="job-os-phase-scorecard">
          {run.phaseScorecard.map((phase) => (
            <div key={phase.phase} className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-semibold text-[#fafafa]">{phase.phase}</h2>
                <span className={`rounded-md border px-2 py-1 text-[10px] font-mono uppercase tracking-widest ${scoreColor(phase.score)}`}>
                  {phase.score}
                </span>
              </div>
              <div className="mt-2 text-xs text-[#71717a]">{phase.status.replaceAll('_', ' ')}</div>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5" data-testid="job-os-programs">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-[#fafafa]">Programs 1-36</h2>
              <p className="mt-1 text-xs text-[#71717a]">Phases 1-12 are implemented as schema, domain logic, proof action, and dashboard surface.</p>
            </div>
            <Layers3 className="h-4 w-4 text-[#06b6d4]" />
          </div>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {PROGRAMS.map(([number, label]) => (
              <div key={number} className="flex items-center gap-3 rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#06b6d4]/30 bg-[#06b6d4]/10 text-[10px] font-mono text-[#67e8f9]">
                  {number}
                </div>
                <div className="min-w-0 truncate text-xs font-medium text-[#d4d4d8]">{label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]" data-testid="job-os-recruiter-loop">
          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#fafafa]">Recruiter loop</h2>
                <p className="mt-1 text-xs text-[#71717a]">Contacts, manual-review outreach, and reply classification.</p>
              </div>
              <Users className="h-4 w-4 text-[#06b6d4]" />
            </div>
            <div className="space-y-2">
              {run.recruiterContacts.slice(0, 4).map((contact) => (
                <div key={`${contact.company}-${contact.email}`} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-[#fafafa]">{contact.company}</div>
                      <div className="mt-1 truncate text-xs text-[#71717a]">{contact.email} · {contact.title}</div>
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">{contact.confidence}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                ['Contacts', run.recruiterContacts.length],
                ['Steps', run.outreachSteps.length],
                ['Replies', run.inboxEvents.length],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">{label}</div>
                  <div className="mt-1 text-xl font-semibold text-[#fafafa]">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5" data-testid="job-os-interview-os">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#fafafa]">Interview OS</h2>
                <p className="mt-1 text-xs text-[#71717a]">Research briefs, STAR stories, likely questions, and follow-up templates.</p>
              </div>
              <MailCheck className="h-4 w-4 text-[#06b6d4]" />
            </div>
            <div className="space-y-2">
              {run.interviewKits.map((kit) => (
                <div key={`${kit.company}-${kit.role}`} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-xs font-semibold text-[#fafafa]">{kit.company}</div>
                  <div className="mt-1 text-xs text-[#71717a]">{kit.role}</div>
                  <div className="mt-2 text-xs text-[#a1a1aa]">{kit.researchBrief[0]}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3" data-testid="job-os-analytics-ops">
          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#fafafa]">Analytics</h2>
                <p className="mt-1 text-xs text-[#71717a]">Response and interview conversion snapshot.</p>
              </div>
              <TrendingUp className="h-4 w-4 text-[#06b6d4]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Reply rate', `${run.analytics.replyRate}%`],
                ['Interview rate', `${run.analytics.interviewRate}%`],
                ['Top resume', run.analytics.topResumeVariant.replaceAll('_', ' ')],
                ['Bottlenecks', run.analytics.bottlenecks.length],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">{label}</div>
                  <div className="mt-1 truncate text-sm font-semibold text-[#fafafa]">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
            <h2 className="text-sm font-semibold text-[#fafafa]">Experiments</h2>
            <div className="mt-4 space-y-2">
              {run.experiments.map((experiment) => (
                <div key={experiment.name} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-xs font-semibold text-[#fafafa]">{experiment.name}</div>
                  <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">{experiment.metric} · {experiment.status}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-[#fafafa]">Live source proof</h2>
                <p className="mt-1 text-xs text-[#71717a]">Public Remotive probe plus private-provider readiness.</p>
              </div>
              <form action={runJobOsLivePublicSourceProof} className="flex shrink-0 gap-2">
                <input type="hidden" name="runKey" value={`live-source-${Date.now()}`} />
                <button className="rounded-lg border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-3 py-2 text-xs font-semibold text-[#67e8f9] hover:bg-[#06b6d4]/15">
                  Run live probe
                </button>
              </form>
            </div>
            <div className="mt-4 space-y-2">
              {liveProofs.length > 0 ? liveProofs.map((proof) => (
                <div key={proof.provider} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-xs font-semibold text-[#fafafa]">{proof.provider}</div>
                  <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">{proof.status}</div>
                  <div className="mt-2 text-xs text-[#71717a]">{proof.evidence ?? `${proof.imported} imported`}</div>
                </div>
              )) : run.liveSourceProofs.map((proof) => (
                <div key={proof.provider} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-xs font-semibold text-[#fafafa]">{proof.provider}</div>
                  <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">{proof.status}</div>
                  <div className="mt-2 text-xs text-[#71717a]">{proof.evidence}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]" data-testid="job-os-live-hardening">
          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#fafafa]">Readiness audit</h2>
                <p className="mt-1 text-xs text-[#71717a]">95+ requires private Gmail/LinkedIn proof; everything else is now operator-ready.</p>
              </div>
              <ShieldCheck className="h-4 w-4 text-[#06b6d4]" />
            </div>
            <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-4">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">Current audit</div>
              <div className="mt-2 text-3xl font-semibold text-[#fafafa]">{readinessAudit?.score ?? run.readinessAudit.score}/100</div>
              <div className="mt-1 text-xs font-mono uppercase tracking-widest text-[#67e8f9]">
                {readinessAudit?.grade ?? run.readinessAudit.grade}
              </div>
            </div>
            <div className="mt-3 space-y-2">
              {(readinessAudit?.gaps ?? run.readinessAudit.gaps).slice(0, 4).map((gap) => (
                <div key={gap} className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-2 text-xs text-amber-200">
                  {gap.replaceAll('_', ' ')}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#fafafa]">Resume artifacts</h2>
                <p className="mt-1 text-xs text-[#71717a]">Markdown, PDF-ready HTML, and DOCX manifest exports with checksums.</p>
              </div>
              <FileText className="h-4 w-4 text-[#06b6d4]" />
            </div>
            <div className="space-y-2">
              {artifacts.length === 0 ? run.resumeArtifacts.slice(0, 6).map((artifact) => (
                <div key={`${artifact.filename}-${artifact.artifactType}`} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="truncate text-xs font-semibold text-[#fafafa]">{artifact.filename}</div>
                  <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-[#71717a]">{artifact.artifactType} · {artifact.checksum}</div>
                </div>
              )) : artifacts.map((artifact) => (
                <div key={artifact.id} className="grid gap-3 rounded-lg border border-[#27272a] bg-[#09090B] p-3 md:grid-cols-[1fr_240px]">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-semibold text-[#fafafa]">{artifact.filename}</div>
                    <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-[#71717a]">{artifact.artifact_type} · {artifact.checksum}</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      ['Source', ''],
                      ['PDF', '?format=pdf'],
                      ['DOCX', '?format=docx'],
                    ].map(([label, suffix]) => (
                      <a
                        key={label}
                        href={`/api/admin/job-application-os/artifacts/${artifact.id}/download${suffix}`}
                        className="rounded-lg border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-2 py-2 text-center text-xs font-semibold text-[#67e8f9] hover:bg-[#06b6d4]/15"
                      >
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1fr_1fr]" data-testid="job-os-live-capture">
          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#fafafa]">LinkedIn/browser capture</h2>
                <p className="mt-1 text-xs text-[#71717a]">Operator-safe capture sessions with required evidence before status changes.</p>
              </div>
              <Radar className="h-4 w-4 text-[#06b6d4]" />
            </div>
            <div className="space-y-2">
              {displayedCaptureSessions.slice(0, 5).map((session) => (
                <div key={`${session.source}-${session.captureUrl}`} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#fafafa]">{session.source}</div>
                      <div className="mt-1 truncate text-xs text-[#71717a]">{session.captureUrl}</div>
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">{session.status}</div>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {session.evidenceRequired.map((item) => (
                      <span key={item} className="rounded-md border border-[#27272a] px-2 py-1 text-[10px] text-[#a1a1aa]">{item}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
            <h2 className="text-sm font-semibold text-[#fafafa]">Gmail stream status</h2>
            <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
              <div className="text-xs font-semibold text-amber-100">Reauthentication required</div>
              <p className="mt-2 text-xs leading-5 text-amber-200">
                Gmail OAuth returned invalid_grant during the live connector check. The classifier and persistence path are ready, but the mailbox stream cannot be proven until Gmail is reconnected.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]" data-testid="job-os-optimization-engine">
          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#fafafa]">Dataset import center</h2>
                <p className="mt-1 text-xs text-[#71717a]">CSV, JSON, or manual job/application history intake.</p>
              </div>
              <FileText className="h-4 w-4 text-[#06b6d4]" />
            </div>
            <form action={importJobOsDataset} className="grid gap-2">
              <input type="hidden" name="runKey" value={`dataset-${Date.now()}`} />
              <input
                name="datasetName"
                defaultValue="application-history"
                className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa]"
              />
              <select name="sourceType" defaultValue="csv" className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa]">
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="manual">Manual</option>
              </select>
              <textarea
                name="payload"
                required
                defaultValue={[
                  'title,company,location,description,url,outcome,evidence',
                  'AI Application Engineer,Example AI,Remote,Next.js TypeScript OpenAI testing,https://example.com/jobs/ai,interview,Recruiter asked for availability',
                  'QA Automation Engineer,Quality SaaS,Remote,Playwright API CI regression,https://example.com/jobs/qa,reply,Recruiter replied positively',
                ].join('\n')}
                className="min-h-36 rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 font-mono text-xs text-[#fafafa]"
              />
              <button className="rounded-lg border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-3 py-2 text-xs font-semibold text-[#67e8f9] hover:bg-[#06b6d4]/15">
                Import dataset
              </button>
            </form>
            <div className="mt-4 space-y-2">
              {datasetImports.length === 0 ? (
                <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3 text-xs text-[#71717a]">No imported datasets yet.</div>
              ) : datasetImports.map((item) => (
                <div key={item.id} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-xs font-semibold text-[#fafafa]">{item.dataset_name}</div>
                  <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">
                    {item.source_type} · {item.rows_imported} imported · {item.rows_rejected} rejected
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[#fafafa]">Strategy engine</h2>
                  <p className="mt-1 text-xs text-[#71717a]">Daily operating recommendations from jobs, outcomes, and source proof.</p>
                </div>
                <Target className="h-4 w-4 text-[#06b6d4]" />
              </div>
              <div className="space-y-2">
                {(strategies.length ? strategies : run.strategyRecommendations).slice(0, 5).map((strategy) => (
                  <div key={`${strategy.priority}-${strategy.action}`} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                    <div className="text-xs font-semibold text-[#fafafa]">{strategy.priority}. {strategy.action}</div>
                    <div className="mt-1 text-xs text-[#71717a]">{strategy.rationale}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
                <h2 className="text-sm font-semibold text-[#fafafa]">Proof gaps</h2>
                <div className="mt-4 space-y-2">
                  {displayedProofGaps.slice(0, 4).map((gap) => (
                    <div key={`${gap.keyword}-${gap.frequency}`} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                      <div className="text-xs font-semibold text-[#fafafa]">{gap.keyword}</div>
                      <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-amber-200">{gap.priority} · {gap.frequency}</div>
                      <div className="mt-2 text-xs text-[#71717a]">{gap.recommendedArtifact}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#fafafa]">Measured load run</h2>
                  <form action={runJobOsMeasuredLoadProof}>
                    <input type="hidden" name="runKey" value={`load-${Date.now()}`} />
                    <button className="rounded-lg border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-3 py-2 text-xs font-semibold text-[#67e8f9] hover:bg-[#06b6d4]/15">
                      Run load proof
                    </button>
                  </form>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    ['Jobs', measuredLoad?.jobs ?? run.measuredLoadRun.jobs],
                    ['Apps', measuredLoad?.applications ?? run.measuredLoadRun.applications],
                    ['Dash p95', `${measuredLoad?.p95_dashboard_ms ?? run.measuredLoadRun.p95DashboardMs}ms`],
                    ['Status', measuredLoad?.status ?? run.measuredLoadRun.status],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">{label}</div>
                      <div className="mt-1 truncate text-sm font-semibold text-[#fafafa]">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2" data-testid="job-os-observability-load">
          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
            <h2 className="text-sm font-semibold text-[#fafafa]">Observability</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ['Status', run.observability.status],
                ['Queue depth', run.observability.queueDepth],
                ['Dashboard p95', `${run.observability.p95DashboardMs}ms`],
                ['Daily cost', `$${run.observability.estimatedDailyCostUsd}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">{label}</div>
                  <div className="mt-1 text-sm font-semibold text-[#fafafa]">{value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5">
            <h2 className="text-sm font-semibold text-[#fafafa]">Load proof</h2>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                ['Tenants', run.loadProof.tenants],
                ['Jobs', run.loadProof.jobs],
                ['Packets', run.loadProof.packets],
                ['Apps', run.loadProof.applications],
                ['Export p95', `${run.loadProof.p95ExportMs}ms`],
                ['Status', run.loadProof.status],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">{label}</div>
                  <div className="mt-1 truncate text-sm font-semibold text-[#fafafa]">{value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5" data-testid="job-os-daily-queue">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#fafafa]">Daily target queue</h2>
                <p className="mt-1 text-xs text-[#71717a]">Prioritized by fit, risk, evidence, and resume match.</p>
              </div>
              <Target className="h-4 w-4 text-[#06b6d4]" />
            </div>
            <div className="space-y-2">
              {run.dailyTargets.map((target) => (
                <div key={`${target.rank}-${target.job.company}`} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-[#fafafa]">
                        {target.rank}. {target.job.title}
                      </div>
                      <div className="mt-1 truncate text-xs text-[#71717a]">
                        {target.job.company} · {target.parsed.remoteStatus} · {target.resumeVersionId.replaceAll('_', ' ')}
                      </div>
                    </div>
                    <span className={`rounded-md border px-2 py-1 text-[10px] font-mono uppercase tracking-widest ${scoreColor(target.fit.overall)}`}>
                      {target.fit.overall}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-[#a1a1aa]">{target.nextAction}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {target.fit.matchedSkills.slice(0, 5).map((skill) => (
                      <span key={skill} className="rounded-md border border-[#27272a] px-2 py-1 text-[10px] text-[#a1a1aa]">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5" data-testid="job-os-candidate-intelligence">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[#fafafa]">Candidate intelligence</h2>
                  <p className="mt-1 text-xs text-[#71717a]">{run.candidate.headline}</p>
                </div>
                <Sparkles className="h-4 w-4 text-[#06b6d4]" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {run.skills.map((skill) => (
                  <div key={skill.skill} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                    <div className="text-xs font-semibold text-[#fafafa]">{skill.skill}</div>
                    <div className="mt-1 text-[10px] font-mono uppercase tracking-widest text-[#71717a]">
                      {skill.category} · {skill.strength}/5
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5" data-testid="job-os-packets">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-[#fafafa]">Application packets</h2>
                  <p className="mt-1 text-xs text-[#71717a]">Resume, cover letter, recruiter message, ATS coverage.</p>
                </div>
                <FileText className="h-4 w-4 text-[#06b6d4]" />
              </div>
              <div className="space-y-2">
                {run.packets.map((packet) => (
                  <div key={`${packet.company}-${packet.jobTitle}`} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-[#fafafa]">{packet.company}</div>
                        <div className="mt-1 truncate text-xs text-[#71717a]">{packet.jobTitle}</div>
                      </div>
                      <span className={`rounded-md border px-2 py-1 text-[10px] font-mono uppercase tracking-widest ${scoreColor(packet.atsKeywordCoverage)}`}>
                        ATS {packet.atsKeywordCoverage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5" data-testid="job-os-workflow">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#fafafa]">Workflow board</h2>
                <p className="mt-1 text-xs text-[#71717a]">Saved, ready, applied, recruiter, interview, offer, rejected, archived.</p>
              </div>
              <ClipboardCheck className="h-4 w-4 text-[#06b6d4]" />
            </div>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
              {['saved', 'ready', 'applied', 'interviewing', 'offer', 'rejected', 'archived', 'proof'].map((stage) => (
                <div key={stage} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-[#71717a]">{stage}</div>
                  <div className="mt-1 text-xl font-semibold text-[#fafafa]">
                    {stage === 'proof'
                      ? run.evidence.length
                      : run.dailyTargets.filter((target) => target.stage === stage).length}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5" data-testid="job-os-recent-applications">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#fafafa]">Recent persisted applications</h2>
                <p className="mt-1 text-xs text-[#71717a]">Empty until the proof action runs against migrated tables.</p>
              </div>
              <Gauge className="h-4 w-4 text-[#06b6d4]" />
            </div>
            <div className="space-y-2">
              {recent.length === 0 ? (
                <div className="rounded-lg border border-[#27272a] bg-[#09090B] p-3 text-xs text-[#71717a]">
                  No Job Application OS records yet.
                </div>
              ) : recent.map((application) => (
                <div key={application.id} className="rounded-lg border border-[#27272a] bg-[#09090B] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-[#fafafa]">
                        {application.metadata?.target?.job?.company ?? 'Unknown company'} · {application.metadata?.target?.job?.title ?? 'Unknown role'}
                      </div>
                      <div className="mt-1 truncate text-xs text-[#71717a]">{application.next_action ?? 'No next action'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">{application.stage}</div>
                      <div className="mt-1 text-xs text-[#a1a1aa]">{application.metadata?.target?.fit?.overall ?? '-'} fit</div>
                    </div>
                  </div>
                  <details className="mt-3 rounded-lg border border-[#27272a] bg-[#0f0f12] p-3">
                    <summary className="cursor-pointer text-[10px] font-mono uppercase tracking-widest text-[#67e8f9]">Record proof / outcome</summary>
                    <div className="mt-3 grid gap-3">
                      <form action={recordJobOsSubmissionEvidence} className="grid gap-2">
                        <input type="hidden" name="applicationId" value={application.id} />
                        <select name="status" defaultValue="submitted" className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa]">
                          <option value="submitted">Submitted</option>
                          <option value="pending_manual_submission">Pending</option>
                          <option value="blocked">Blocked</option>
                        </select>
                        <input name="submittedUrl" placeholder="Submitted URL" className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa]" />
                        <input name="confirmationEmail" placeholder="Confirmation email" className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa]" />
                        <input name="screenshotPath" placeholder="Screenshot path" className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa]" />
                        <input name="artifactChecksums" placeholder="Submitted artifact checksums, comma separated" className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa]" />
                        <textarea name="confirmationText" placeholder="Confirmation text / evidence" className="min-h-20 rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa]" />
                        <button className="rounded-lg border border-[#06b6d4]/40 bg-[#06b6d4]/10 px-3 py-2 text-xs font-semibold text-[#67e8f9] hover:bg-[#06b6d4]/15">Save evidence</button>
                      </form>
                      <form action={recordJobOsOutcome} className="grid gap-2 border-t border-[#27272a] pt-3">
                        <input type="hidden" name="applicationId" value={application.id} />
                        <input type="hidden" name="runKey" value={application.run_key ?? ''} />
                        <select name="outcome" defaultValue="reply" className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa]">
                          <option value="applied">Applied</option>
                          <option value="reply">Reply</option>
                          <option value="interview">Interview</option>
                          <option value="offer">Offer</option>
                          <option value="rejected">Rejected</option>
                          <option value="withdrawn">Withdrawn</option>
                        </select>
                        <select name="source" defaultValue="manual" className="rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa]">
                          <option value="manual">Manual</option>
                          <option value="gmail">Gmail</option>
                          <option value="provider">Provider</option>
                          <option value="import">Import</option>
                        </select>
                        <textarea name="evidence" required placeholder="Outcome evidence" className="min-h-20 rounded-lg border border-[#27272a] bg-[#09090B] px-3 py-2 text-xs text-[#fafafa]" />
                        <button className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-200 hover:bg-emerald-500/15">Record outcome</button>
                      </form>
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-[#27272a] bg-[#0f0f12] p-5" data-testid="job-os-safety">
          <div className="flex items-start gap-3">
            <Radar className="mt-0.5 h-4 w-4 shrink-0 text-[#06b6d4]" />
            <div>
              <h2 className="text-sm font-semibold text-[#fafafa]">Safety posture</h2>
              <p className="mt-1 text-xs leading-6 text-[#a1a1aa]">
                The system prepares, scores, tailors, queues, and tracks applications. Final submission, sensitive answers, and application confirmations remain manual-only until explicit evidence is captured.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
