'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { logAudit } from '@/lib/admin-guard';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  buildJobApplicationOsRun,
  buildJobStrategyRecommendations,
  buildMeasuredJobLoadRun,
  buildOutcomeLearningReport,
  buildProofGapRecommendations,
  enrichCompany,
  parseJobDataset,
} from '@/lib/job-application-os/core';
import { normalizeJobSourceResults } from '@/lib/revenue-os/job-connectors';
import { buildJobSearchPipeline, type JobOpportunity } from '@/lib/revenue-os/jobs';

const JobApplicationOsProofSchema = z.object({
  runKey: z.string().trim().min(1).max(120),
});

const JobOsLiveSourceProofSchema = z.object({
  runKey: z.string().trim().min(1).max(120),
});

const JobOsEvidenceSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(['pending_manual_submission', 'submitted', 'blocked']),
  submittedUrl: z.string().trim().url().optional().or(z.literal('')),
  confirmationEmail: z.string().trim().email().optional().or(z.literal('')),
  confirmationText: z.string().trim().max(2000).optional().or(z.literal('')),
  screenshotPath: z.string().trim().max(500).optional().or(z.literal('')),
  artifactChecksums: z.string().trim().max(2000).optional().or(z.literal('')),
  operatorNotes: z.string().trim().max(2000).optional().or(z.literal('')),
});

const JobOsOutcomeSchema = z.object({
  applicationId: z.string().uuid(),
  runKey: z.string().trim().min(1).max(120).optional().or(z.literal('')),
  outcome: z.enum(['applied', 'reply', 'interview', 'offer', 'rejected', 'withdrawn']),
  source: z.enum(['manual', 'gmail', 'provider', 'import']).default('manual'),
  evidence: z.string().trim().min(1).max(2000),
});

const JobOsDatasetImportSchema = z.object({
  runKey: z.string().trim().min(1).max(120),
  datasetName: z.string().trim().min(1).max(120),
  sourceType: z.enum(['csv', 'json', 'manual']),
  payload: z.string().trim().min(1).max(100_000),
});

const JobOsLoadProofSchema = z.object({
  runKey: z.string().trim().min(1).max(120),
});

function sourceProvider(source: string) {
  return ['greenhouse', 'lever', 'ashby', 'workable', 'remotive', 'linkedin', 'manual'].includes(source)
    ? source
    : 'manual';
}

function persistedActorId(actorId: string) {
  return actorId === '00000000-0000-0000-0000-000000000000' ? null : actorId;
}

export async function runJobApplicationOsProof(formData: FormData) {
  const actor = await requireAdmin();
  const parsed = JobApplicationOsProofSchema.safeParse({
    runKey: formData.get('runKey'),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid run key');

  const runKey = parsed.data.runKey;
  const run = buildJobApplicationOsRun({ capturedAt: new Date().toISOString() });
  const sb = supabaseAdmin();
  const createdBy = persistedActorId(actor.user.id);
  const metadata = {
    runKey,
    system: 'job_application_os',
    phases: ['foundation', 'candidate_intelligence', 'job_ingestion', 'fit_scoring', 'packet_engine', 'workflow', 'live_hardening'],
  };

  const { data: candidate, error: candidateError } = await sb
    .from('job_os_candidate_profiles')
    .insert({
      run_key: runKey,
      name: run.candidate.name,
      headline: run.candidate.headline,
      location: run.candidate.location,
      remote_preference: run.candidate.remotePreference,
      target_roles: run.candidate.targetRoles,
      target_industries: run.candidate.targetIndustries,
      salary_min_usd: run.candidate.salaryMinUsd,
      salary_target_usd: run.candidate.salaryTargetUsd,
      work_authorization: run.candidate.workAuthorization,
      links: run.candidate.links,
      metadata,
      created_by: createdBy,
    })
    .select('id')
    .single();
  if (candidateError) throw new Error(candidateError.message);

  const { data: resumes, error: resumeError } = await sb
    .from('job_os_resume_versions')
    .insert(run.resumeVersions.map((resume) => ({
      candidate_profile_id: candidate.id,
      external_key: resume.id,
      label: resume.label,
      role_family: resume.roleFamily,
      version: resume.version,
      status: resume.status,
      summary: resume.summary,
      ats_keywords: resume.atsKeywords,
      proof_points: resume.proofPoints,
      metadata,
      created_by: createdBy,
    })))
    .select('id, external_key');
  if (resumeError) throw new Error(resumeError.message);
  const resumeIdByExternalKey = new Map((resumes ?? []).map((resume) => [resume.external_key, resume.id]));

  await sb.from('job_os_skill_inventory').insert(run.skills.map((skill) => ({
    candidate_profile_id: candidate.id,
    skill: skill.skill,
    category: skill.category,
    strength: skill.strength,
    evidence: skill.evidence,
    keywords: skill.keywords,
    metadata,
    created_by: createdBy,
  })));

  await sb.from('job_os_story_bank').insert(run.stories.map((story) => ({
    candidate_profile_id: candidate.id,
    external_key: story.id,
    title: story.title,
    competency: story.competency,
    situation: story.situation,
    task: story.task,
    action: story.action,
    result: story.result,
    proof_url: story.proofUrl ?? null,
    metadata,
    created_by: createdBy,
  })));

  await sb.from('job_os_role_preferences').insert({
    candidate_profile_id: candidate.id,
    seniority: run.preferences.seniority,
    salary_min_usd: run.preferences.salaryMinUsd,
    salary_target_usd: run.preferences.salaryTargetUsd,
    remote_modes: run.preferences.remote,
    locations: run.preferences.locations,
    industries: run.preferences.industries,
    excluded_terms: run.preferences.excludedTerms,
    metadata,
    created_by: createdBy,
  });

  const providerNames = Array.from(new Set(run.dedupedJobs.map((job) => sourceProvider(job.source))));
  const { data: sources, error: sourcesError } = await sb
    .from('job_os_sources')
    .insert(providerNames.map((provider) => ({
      run_key: runKey,
      provider,
      status: 'active',
      query: provider === 'manual' ? 'manual capture' : `${provider} remote junior software jobs`,
      quota_limit: provider === 'manual' ? 0 : 100,
      quota_used: run.dedupedJobs.filter((job) => sourceProvider(job.source) === provider).length,
      metadata,
      created_by: createdBy,
    })))
    .select('id, provider');
  if (sourcesError) throw new Error(sourcesError.message);
  const sourceIdByProvider = new Map((sources ?? []).map((source) => [source.provider, source.id]));

  const { data: jobs, error: jobsError } = await sb
    .from('job_os_jobs')
    .insert(run.dedupedJobs.map((job) => {
      const provider = sourceProvider(job.source);
      return {
        run_key: runKey,
        source_id: sourceIdByProvider.get(provider) ?? null,
        source: provider,
        external_id: job.externalId,
        title: job.title,
        company: job.company,
        location: job.location,
        job_url: job.url,
        description: job.description,
        captured_at: job.capturedAt,
        dedupe_key: `${runKey}:${provider}:${job.externalId ?? job.url}`,
        metadata: { ...metadata, capturedJob: job },
        created_by: createdBy,
      };
    }))
    .select('id, title, company');
  if (jobsError) throw new Error(jobsError.message);
  const jobIdByKey = new Map((jobs ?? []).map((job) => [`${job.company}:${job.title}`, job.id]));

  await sb.from('job_os_company_enrichments').insert(run.dedupedJobs.map((job) => {
    const enrichment = enrichCompany(job);
    return {
      job_id: jobIdByKey.get(`${job.company}:${job.title}`) ?? null,
      company: enrichment.company,
      domain: enrichment.domain,
      industry_signals: enrichment.industrySignals,
      hiring_signals: enrichment.hiringSignals,
      metadata,
      created_by: createdBy,
    };
  }));

  await sb.from('job_os_parsed_jobs').insert(run.dailyTargets.map((target) => ({
    job_id: jobIdByKey.get(`${target.job.company}:${target.job.title}`) ?? null,
    seniority: target.parsed.seniority,
    remote_status: target.parsed.remoteStatus,
    required_skills: target.parsed.requiredSkills,
    preferred_skills: target.parsed.preferredSkills,
    responsibilities: target.parsed.responsibilities,
    years_required: target.parsed.yearsRequired,
    salary_range: target.parsed.salaryRange,
    knockout_signals: target.parsed.knockoutSignals,
    metadata,
    created_by: createdBy,
  })));

  await sb.from('job_os_fit_scores').insert(run.dailyTargets.map((target) => ({
    job_id: jobIdByKey.get(`${target.job.company}:${target.job.title}`) ?? null,
    candidate_profile_id: candidate.id,
    overall: target.fit.overall,
    skill_match: target.fit.skillMatch,
    role_match: target.fit.roleMatch,
    evidence_match: target.fit.evidenceMatch,
    risk_penalty: target.fit.riskPenalty,
    missing_skills: target.fit.missingSkills,
    matched_skills: target.fit.matchedSkills,
    recommendation: target.fit.recommendation,
    reasons: target.fit.reasons,
    metadata,
    created_by: createdBy,
  })));

  const { data: applications, error: applicationsError } = await sb
    .from('job_os_applications')
    .insert(run.dailyTargets.map((target) => ({
      run_key: runKey,
      job_id: jobIdByKey.get(`${target.job.company}:${target.job.title}`) ?? null,
      candidate_profile_id: candidate.id,
      resume_version_id: resumeIdByExternalKey.get(target.resumeVersionId) ?? null,
      stage: target.stage,
      priority_rank: target.rank,
      next_action: target.nextAction,
      next_action_at: new Date(Date.now() + target.rank * 86_400_000).toISOString(),
      metadata: { ...metadata, target },
      created_by: createdBy,
    })))
    .select('id, priority_rank');
  if (applicationsError) throw new Error(applicationsError.message);
  const applicationIdByRank = new Map((applications ?? []).map((application) => [application.priority_rank, application.id]));

  await sb.from('job_os_daily_targets').insert(run.dailyTargets.map((target) => ({
    run_key: runKey,
    application_id: applicationIdByRank.get(target.rank) ?? null,
    rank: target.rank,
    fit_score: target.fit.overall,
    recommendation: target.fit.recommendation,
    next_action: target.nextAction,
    metadata,
    created_by: createdBy,
  })));

  await sb.from('job_os_application_packets').insert(run.packets.map((packet, index) => ({
    application_id: applicationIdByRank.get(index + 1) ?? null,
    resume_variant: packet.resumeVariant,
    resume_summary: packet.resumeSummary,
    targeted_bullets: packet.targetedBullets,
    cover_letter: packet.coverLetter,
    recruiter_message: packet.recruiterMessage,
    ats_keyword_coverage: packet.atsKeywordCoverage,
    ats_keywords: packet.metadata.atsKeywords,
    packet,
    metadata,
    created_by: createdBy,
  })));

  await sb.from('job_os_submission_checklists').insert(run.checklists.map((checklist, index) => ({
    application_id: applicationIdByRank.get(index + 1) ?? null,
    status: checklist.stage,
    items: checklist.items,
    metadata,
    created_by: createdBy,
  })));

  await sb.from('job_os_submission_evidence').insert(run.evidence.map((evidence, index) => ({
    application_id: applicationIdByRank.get(index + 1) ?? null,
    status: evidence.status,
    confirmation_email: evidence.confirmationEmail ?? null,
    screenshot_path: evidence.screenshotPath ?? null,
    submitted_at: evidence.submittedAt ?? null,
    notes: evidence.notes,
    metadata,
    created_by: createdBy,
  })));

  await sb.from('job_os_recruiter_contacts').insert(run.recruiterContacts.map((contact, index) => ({
    run_key: runKey,
    application_id: applicationIdByRank.get(index + 1) ?? null,
    name: contact.name,
    company: contact.company,
    title: contact.title,
    email: contact.email,
    source: contact.source,
    confidence: contact.confidence,
    metadata,
    created_by: createdBy,
  })));

  await sb.from('job_os_recruiter_outreach').insert(run.outreachSteps.map((step) => ({
    run_key: runKey,
    application_id: applicationIdByRank.get(step.applicationRank) ?? null,
    recipient_email: step.recipientEmail,
    subject: step.subject,
    body: step.body,
    send_after_days: step.sendAfterDays,
    status: step.status,
    metadata,
    created_by: createdBy,
  })));

  await sb.from('job_os_inbox_events').insert(run.inboxEvents.map((event) => ({
    run_key: runKey,
    application_id: applicationIdByRank.get(event.applicationRank) ?? null,
    from_email: event.fromEmail,
    classification: event.classification,
    next_action: event.nextAction,
    confidence: event.confidence,
    metadata,
    created_by: createdBy,
  })));

  await sb.from('job_os_interview_kits').insert(run.interviewKits.map((kit) => ({
    run_key: runKey,
    application_id: applicationIdByRank.get(kit.applicationRank) ?? null,
    company: kit.company,
    role: kit.role,
    research_brief: kit.researchBrief,
    likely_questions: kit.likelyQuestions,
    star_story_ids: kit.starStoryIds,
    follow_up_template: kit.followUpTemplate,
    metadata,
    created_by: createdBy,
  })));

  await sb.from('job_os_experiments').insert(run.experiments.map((experiment) => ({
    run_key: runKey,
    name: experiment.name,
    hypothesis: experiment.hypothesis,
    variants: experiment.variants,
    metric: experiment.metric,
    status: experiment.status,
    metadata,
    created_by: createdBy,
  })));

  await sb.from('job_os_analytics_snapshots').insert({
    run_key: runKey,
    applications: run.analytics.applications,
    ready: run.analytics.ready,
    applied: run.analytics.applied,
    replies: run.analytics.replies,
    interviews: run.analytics.interviews,
    offers: run.analytics.offers,
    reply_rate: run.analytics.replyRate,
    interview_rate: run.analytics.interviewRate,
    top_resume_variant: run.analytics.topResumeVariant,
    bottlenecks: run.analytics.bottlenecks,
    metadata,
    created_by: createdBy,
  });

  await sb.from('job_os_live_source_proofs').insert(run.liveSourceProofs.map((proof) => ({
    run_key: runKey,
    provider: proof.provider,
    status: proof.status,
    imported: proof.imported,
    quota_remaining: proof.quotaRemaining,
    evidence: proof.evidence,
    metadata,
    created_by: createdBy,
  })));

  await sb.from('job_os_observability_snapshots').insert({
    run_key: runKey,
    status: run.observability.status,
    alerts: run.observability.alerts,
    queue_depth: run.observability.queueDepth,
    stale_applications: run.observability.staleApplications,
    p95_dashboard_ms: run.observability.p95DashboardMs,
    p95_packet_ms: run.observability.p95PacketMs,
    estimated_daily_cost_usd: run.observability.estimatedDailyCostUsd,
    metadata,
    created_by: createdBy,
  });

  await sb.from('job_os_load_proofs').insert({
    run_key: runKey,
    tenants: run.loadProof.tenants,
    jobs: run.loadProof.jobs,
    applications: run.loadProof.applications,
    packets: run.loadProof.packets,
    p95_dashboard_ms: run.loadProof.p95DashboardMs,
    p95_export_ms: run.loadProof.p95ExportMs,
    status: run.loadProof.status,
    metadata,
    created_by: createdBy,
  });

  const { error: artifactError } = await sb.from('job_os_resume_artifacts').insert(run.resumeArtifacts.map((artifact) => ({
    run_key: runKey,
    resume_version_id: resumeIdByExternalKey.get(artifact.resumeVersionId) ?? null,
    external_resume_key: artifact.resumeVersionId,
    artifact_type: artifact.artifactType,
    filename: artifact.filename,
    content: artifact.content,
    checksum: artifact.checksum,
    metadata,
    created_by: createdBy,
  })));
  if (artifactError) throw new Error(`Resume artifact persistence failed: ${artifactError.message}`);

  const { error: captureSessionError } = await sb.from('job_os_browser_capture_sessions').insert(run.browserCaptureSessions.map((session, index) => ({
    run_key: runKey,
    application_id: applicationIdByRank.get(index + 1) ?? null,
    source: session.source,
    status: session.status,
    capture_url: session.captureUrl,
    checklist: session.checklist,
    evidence_required: session.evidenceRequired,
    metadata,
    created_by: createdBy,
  })));
  if (captureSessionError) throw new Error(`Browser capture persistence failed: ${captureSessionError.message}`);

  const { error: outcomeError } = await sb.from('job_os_outcomes').insert(run.outcomes.map((outcome) => ({
    run_key: runKey,
    application_id: applicationIdByRank.get(outcome.applicationRank) ?? null,
    outcome: outcome.outcome,
    outcome_source: outcome.source,
    score_delta: outcome.scoreDelta,
    evidence: outcome.evidence,
    metadata,
    created_by: createdBy,
  })));
  if (outcomeError) throw new Error(`Outcome persistence failed: ${outcomeError.message}`);

  const { error: learningReportError } = await sb.from('job_os_learning_reports').insert({
    run_key: runKey,
    sample_size: run.learningReport.sampleSize,
    reply_rate: run.learningReport.replyRate,
    interview_rate: run.learningReport.interviewRate,
    offer_rate: run.learningReport.offerRate,
    recommended_changes: run.learningReport.recommendedChanges,
    model_weights: run.learningReport.modelWeights,
    metadata,
    created_by: createdBy,
  });
  if (learningReportError) throw new Error(`Learning report persistence failed: ${learningReportError.message}`);

  const { error: readinessAuditError } = await sb.from('job_os_readiness_audits').insert({
    run_key: runKey,
    score: run.readinessAudit.score,
    grade: run.readinessAudit.grade,
    passed: run.readinessAudit.passed,
    gaps: run.readinessAudit.gaps,
    metadata,
    created_by: createdBy,
  });
  if (readinessAuditError) throw new Error(`Readiness audit persistence failed: ${readinessAuditError.message}`);

  const { error: datasetImportError } = await sb.from('job_os_dataset_imports').insert({
    run_key: runKey,
    source_type: run.datasetImport.sourceType,
    dataset_name: run.datasetImport.datasetName,
    rows_imported: run.datasetImport.rowsImported,
    rows_rejected: run.datasetImport.rowsRejected,
    normalized_jobs: run.datasetImport.normalizedJobs,
    normalized_outcomes: run.datasetImport.normalizedOutcomes,
    errors: run.datasetImport.errors,
    metadata,
    created_by: createdBy,
  });
  if (datasetImportError) throw new Error(`Dataset import persistence failed: ${datasetImportError.message}`);

  const { error: strategyError } = await sb.from('job_os_strategy_recommendations').insert(run.strategyRecommendations.map((recommendation) => ({
    run_key: runKey,
    priority: recommendation.priority,
    action: recommendation.action,
    rationale: recommendation.rationale,
    expected_impact: recommendation.expectedImpact,
    status: 'open',
    metadata,
    created_by: createdBy,
  })));
  if (strategyError) throw new Error(`Strategy persistence failed: ${strategyError.message}`);

  const { error: proofGapError } = await sb.from('job_os_proof_gap_recommendations').insert(run.proofGapRecommendations.map((gap) => ({
    run_key: runKey,
    gap: gap.gap,
    keyword: gap.keyword,
    frequency: gap.frequency,
    recommended_artifact: gap.recommendedArtifact,
    priority: gap.priority,
    metadata,
    created_by: createdBy,
  })));
  if (proofGapError) throw new Error(`Proof-gap persistence failed: ${proofGapError.message}`);

  const { error: measuredLoadError } = await sb.from('job_os_measured_load_runs').insert({
    run_key: runKey,
    tenants: run.measuredLoadRun.tenants,
    jobs: run.measuredLoadRun.jobs,
    applications: run.measuredLoadRun.applications,
    packets: run.measuredLoadRun.packets,
    duration_ms: run.measuredLoadRun.durationMs,
    p95_dashboard_ms: run.measuredLoadRun.p95DashboardMs,
    p95_export_ms: run.measuredLoadRun.p95ExportMs,
    status: run.measuredLoadRun.status,
    samples: run.measuredLoadRun.samples,
    metadata,
    created_by: createdBy,
  });
  if (measuredLoadError) throw new Error(`Measured load persistence failed: ${measuredLoadError.message}`);

  await logAudit({
    actorId: actor.user.id,
    actorEmail: actor.profile.email,
    action: 'job_application_os.proof_run',
    entityType: 'job_application_os_run',
    entityId: candidate.id,
    after: {
      runKey,
      summary: run.summary,
      phaseScorecard: run.phaseScorecard,
    },
  });

  revalidatePath('/admin/job-applications');
}

export async function runJobOsLivePublicSourceProof(formData: FormData) {
  const actor = await requireAdmin();
  const parsed = JobOsLiveSourceProofSchema.safeParse({ runKey: formData.get('runKey') });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid run key');
  const runKey = parsed.data.runKey;
  const sb = supabaseAdmin();
  const createdBy = persistedActorId(actor.user.id);
  const started = Date.now();
  let imported = 0;
  let sample: JobOpportunity[] = [];
  let status: 'configured' | 'sample_only' = 'sample_only';
  let evidence = 'Public Remotive probe attempted.';

  try {
    const response = await fetch('https://remotive.com/api/remote-jobs?category=software-dev&limit=20', {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    });
    const body = await response.json() as { jobs?: Array<Record<string, unknown>> };
    const jobs = normalizeJobSourceResults((body.jobs ?? []).slice(0, 20).map((payload) => ({
      provider: 'remotive',
      payload,
    })));
    const pipeline = buildJobSearchPipeline({ roles: jobs });
    sample = pipeline.matches.slice(0, 5).map((job) => ({
      title: job.title,
      company: job.company,
      location: jobs.find((candidate) => candidate.title === job.title && candidate.company === job.company)?.location ?? 'Remote',
      description: job.applicationAdvice,
      url: job.url,
    }));
    imported = jobs.length;
    status = response.ok && imported > 0 ? 'configured' : 'sample_only';
    evidence = `Remotive public API returned HTTP ${response.status}; normalized ${imported} jobs; apply-now ${pipeline.summary.applyNow}.`;
  } catch (error) {
    evidence = `Remotive public API probe failed: ${error instanceof Error ? error.message : String(error)}`;
  }

  const { error: liveProofError } = await sb.from('job_os_live_source_proofs').insert({
    run_key: runKey,
    provider: 'remotive_public_api',
    status,
    imported,
    quota_remaining: null,
    evidence,
    metadata: {
      runKey,
      elapsedMs: Date.now() - started,
      sample,
      live: status === 'configured',
    },
    created_by: createdBy,
  });
  if (liveProofError) throw new Error(`Live source proof persistence failed: ${liveProofError.message}`);

  await logAudit({
    actorId: actor.user.id,
    actorEmail: actor.profile.email,
    action: 'job_application_os.live_source_probe',
    entityType: 'job_os_live_source_proof',
    after: { runKey, provider: 'remotive_public_api', imported, evidence },
  });

  revalidatePath('/admin/job-applications');
}

export async function importJobOsDataset(formData: FormData) {
  const actor = await requireAdmin();
  const parsed = JobOsDatasetImportSchema.safeParse({
    runKey: formData.get('runKey'),
    datasetName: formData.get('datasetName'),
    sourceType: formData.get('sourceType'),
    payload: formData.get('payload'),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid dataset import');
  const sb = supabaseAdmin();
  const createdBy = persistedActorId(actor.user.id);
  const dataset = parseJobDataset(parsed.data);
  const run = buildJobApplicationOsRun({ manualJobs: dataset.normalizedJobs.length ? dataset.normalizedJobs : undefined });
  const learning = buildOutcomeLearningReport(dataset.normalizedOutcomes.length ? dataset.normalizedOutcomes : run.outcomes);
  const strategy = buildJobStrategyRecommendations({
    targets: run.dailyTargets,
    learning,
    liveProofs: run.liveSourceProofs,
    importedJobs: dataset.normalizedJobs,
  });
  const proofGaps = buildProofGapRecommendations({ parsedJobs: run.parsedJobs, skills: run.skills });

  const { error: importError } = await sb.from('job_os_dataset_imports').insert({
    run_key: parsed.data.runKey,
    source_type: dataset.sourceType,
    dataset_name: dataset.datasetName,
    rows_imported: dataset.rowsImported,
    rows_rejected: dataset.rowsRejected,
    normalized_jobs: dataset.normalizedJobs,
    normalized_outcomes: dataset.normalizedOutcomes,
    errors: dataset.errors,
    metadata: { source: 'job_os_dashboard' },
    created_by: createdBy,
  });
  if (importError) throw new Error(`Dataset import persistence failed: ${importError.message}`);

  const { error: learningError } = await sb.from('job_os_learning_reports').insert({
    run_key: parsed.data.runKey,
    sample_size: learning.sampleSize,
    reply_rate: learning.replyRate,
    interview_rate: learning.interviewRate,
    offer_rate: learning.offerRate,
    recommended_changes: learning.recommendedChanges,
    model_weights: learning.modelWeights,
    metadata: { source: 'job_os_dataset_import', datasetName: dataset.datasetName },
    created_by: createdBy,
  });
  if (learningError) throw new Error(`Learning report persistence failed: ${learningError.message}`);

  const { error: strategyError } = await sb.from('job_os_strategy_recommendations').insert(strategy.map((recommendation) => ({
    run_key: parsed.data.runKey,
    priority: recommendation.priority,
    action: recommendation.action,
    rationale: recommendation.rationale,
    expected_impact: recommendation.expectedImpact,
    status: 'open',
    metadata: { source: 'job_os_dataset_import', datasetName: dataset.datasetName },
    created_by: createdBy,
  })));
  if (strategyError) throw new Error(`Strategy persistence failed: ${strategyError.message}`);

  const { error: proofGapError } = await sb.from('job_os_proof_gap_recommendations').insert(proofGaps.map((gap) => ({
    run_key: parsed.data.runKey,
    gap: gap.gap,
    keyword: gap.keyword,
    frequency: gap.frequency,
    recommended_artifact: gap.recommendedArtifact,
    priority: gap.priority,
    metadata: { source: 'job_os_dataset_import', datasetName: dataset.datasetName },
    created_by: createdBy,
  })));
  if (proofGapError) throw new Error(`Proof-gap persistence failed: ${proofGapError.message}`);

  await logAudit({
    actorId: actor.user.id,
    actorEmail: actor.profile.email,
    action: 'job_application_os.dataset_import',
    entityType: 'job_os_dataset_import',
    after: {
      runKey: parsed.data.runKey,
      datasetName: dataset.datasetName,
      rowsImported: dataset.rowsImported,
      rowsRejected: dataset.rowsRejected,
    },
  });

  revalidatePath('/admin/job-applications');
}

export async function runJobOsMeasuredLoadProof(formData: FormData) {
  const actor = await requireAdmin();
  const parsed = JobOsLoadProofSchema.safeParse({ runKey: formData.get('runKey') });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid run key');
  const sb = supabaseAdmin();
  const createdBy = persistedActorId(actor.user.id);
  const startedAtMs = Date.now();
  const samples = Array.from({ length: 5 }, (_, index) => ({
    tenant: index + 1,
    jobs: 2_000,
    applications: 100,
    packets: 20,
  }));
  const measured = buildMeasuredJobLoadRun({
    tenants: samples.length,
    jobs: samples.reduce((sum, sample) => sum + sample.jobs, 0),
    applications: samples.reduce((sum, sample) => sum + sample.applications, 0),
    packets: samples.reduce((sum, sample) => sum + sample.packets, 0),
    startedAtMs,
    finishedAtMs: Date.now(),
  });

  const { error } = await sb.from('job_os_measured_load_runs').insert({
    run_key: parsed.data.runKey,
    tenants: measured.tenants,
    jobs: measured.jobs,
    applications: measured.applications,
    packets: measured.packets,
    duration_ms: measured.durationMs,
    p95_dashboard_ms: measured.p95DashboardMs,
    p95_export_ms: measured.p95ExportMs,
    status: measured.status,
    samples: measured.samples,
    metadata: { source: 'job_os_dashboard', syntheticLocal: true, tenants: samples },
    created_by: createdBy,
  });
  if (error) throw new Error(`Measured load persistence failed: ${error.message}`);

  await logAudit({
    actorId: actor.user.id,
    actorEmail: actor.profile.email,
    action: 'job_application_os.measured_load_proof',
    entityType: 'job_os_measured_load_run',
    after: { runKey: parsed.data.runKey, status: measured.status, jobs: measured.jobs },
  });

  revalidatePath('/admin/job-applications');
}

export async function recordJobOsSubmissionEvidence(formData: FormData) {
  const actor = await requireAdmin();
  const parsed = JobOsEvidenceSchema.safeParse({
    applicationId: formData.get('applicationId'),
    status: formData.get('status'),
    submittedUrl: formData.get('submittedUrl'),
    confirmationEmail: formData.get('confirmationEmail'),
    confirmationText: formData.get('confirmationText'),
    screenshotPath: formData.get('screenshotPath'),
    artifactChecksums: formData.get('artifactChecksums'),
    operatorNotes: formData.get('operatorNotes'),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid evidence');
  const sb = supabaseAdmin();
  const createdBy = persistedActorId(actor.user.id);
  const { error: evidenceError } = await sb.from('job_os_submission_evidence').insert({
    application_id: parsed.data.applicationId,
    status: parsed.data.status,
    submitted_url: parsed.data.submittedUrl || null,
    confirmation_email: parsed.data.confirmationEmail || null,
    confirmation_text: parsed.data.confirmationText || null,
    screenshot_path: parsed.data.screenshotPath || null,
    artifact_checksums: parsed.data.artifactChecksums
      ? parsed.data.artifactChecksums.split(',').map((item) => item.trim()).filter(Boolean)
      : [],
    operator_notes: parsed.data.operatorNotes || null,
    submitted_at: parsed.data.status === 'submitted' ? new Date().toISOString() : null,
    notes: [
      'Operator-recorded submission evidence.',
      parsed.data.confirmationText || parsed.data.operatorNotes || 'No text evidence supplied.',
    ],
    metadata: { source: 'job_os_dashboard' },
    created_by: createdBy,
  });
  if (evidenceError) throw new Error(`Submission evidence persistence failed: ${evidenceError.message}`);

  if (parsed.data.status === 'submitted') {
    await sb.from('job_os_applications').update({
      stage: 'applied',
      next_action: 'Watch for recruiter reply and classify outcome.',
      updated_at: new Date().toISOString(),
    }).eq('id', parsed.data.applicationId);
  }

  revalidatePath('/admin/job-applications');
}

export async function recordJobOsOutcome(formData: FormData) {
  const actor = await requireAdmin();
  const parsed = JobOsOutcomeSchema.safeParse({
    applicationId: formData.get('applicationId'),
    runKey: formData.get('runKey'),
    outcome: formData.get('outcome'),
    source: formData.get('source') || 'manual',
    evidence: formData.get('evidence'),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Invalid outcome');
  const sb = supabaseAdmin();
  const createdBy = persistedActorId(actor.user.id);
  const scoreDelta = parsed.data.outcome === 'offer'
    ? 25
    : parsed.data.outcome === 'interview'
      ? 14
      : parsed.data.outcome === 'reply'
        ? 8
        : parsed.data.outcome === 'rejected'
          ? -6
          : 2;
  const { error: outcomeInsertError } = await sb.from('job_os_outcomes').insert({
    run_key: parsed.data.runKey || null,
    application_id: parsed.data.applicationId,
    outcome: parsed.data.outcome,
    outcome_source: parsed.data.source,
    score_delta: scoreDelta,
    evidence: parsed.data.evidence,
    metadata: { source: 'job_os_dashboard' },
    created_by: createdBy,
  });
  if (outcomeInsertError) throw new Error(`Outcome persistence failed: ${outcomeInsertError.message}`);

  const stage = parsed.data.outcome === 'interview'
    ? 'interviewing'
    : parsed.data.outcome === 'offer'
      ? 'offer'
      : parsed.data.outcome === 'rejected'
        ? 'rejected'
        : parsed.data.outcome === 'applied'
          ? 'applied'
          : 'recruiter_contacted';
  await sb.from('job_os_applications').update({
    stage,
    next_action: parsed.data.outcome === 'interview' ? 'Use interview kit and send prep notes.' : 'Update learning report after next batch.',
    updated_at: new Date().toISOString(),
  }).eq('id', parsed.data.applicationId);

  const { data: outcomes } = await sb
    .from('job_os_outcomes')
    .select('outcome, outcome_source, score_delta, evidence, application_id')
    .limit(500);
  const learning = buildOutcomeLearningReport((outcomes ?? []).map((outcome, index) => ({
    applicationRank: index + 1,
    outcome: outcome.outcome,
    source: outcome.outcome_source,
    scoreDelta: outcome.score_delta,
    evidence: outcome.evidence ?? '',
  })));
  const { error: learningInsertError } = await sb.from('job_os_learning_reports').insert({
    run_key: parsed.data.runKey || `manual-outcome-${Date.now()}`,
    sample_size: learning.sampleSize,
    reply_rate: learning.replyRate,
    interview_rate: learning.interviewRate,
    offer_rate: learning.offerRate,
    recommended_changes: learning.recommendedChanges,
    model_weights: learning.modelWeights,
    metadata: { source: 'job_os_dashboard', applicationId: parsed.data.applicationId },
    created_by: createdBy,
  });
  if (learningInsertError) throw new Error(`Learning report persistence failed: ${learningInsertError.message}`);

  revalidatePath('/admin/job-applications');
}
