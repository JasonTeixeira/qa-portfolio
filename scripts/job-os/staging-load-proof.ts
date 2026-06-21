import { createClient } from '@supabase/supabase-js';
import { buildJobApplicationOsRun, buildMeasuredJobLoadRun } from '../../lib/job-application-os/core';

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  const tenants = Number(process.env.JOB_OS_LOAD_TENANTS ?? 5);
  const jobsPerTenant = Number(process.env.JOB_OS_LOAD_JOBS_PER_TENANT ?? 2000);
  const applicationsPerTenant = Number(process.env.JOB_OS_LOAD_APPLICATIONS_PER_TENANT ?? 100);
  const packetsPerTenant = Number(process.env.JOB_OS_LOAD_PACKETS_PER_TENANT ?? 20);
  const runKey = process.env.JOB_OS_LOAD_RUN_KEY ?? `job-os-load-${Date.now()}`;

  const startedAtMs = Date.now();
  for (let tenant = 0; tenant < tenants; tenant += 1) {
    for (let batch = 0; batch < Math.ceil(jobsPerTenant / 100); batch += 1) {
      buildJobApplicationOsRun({
        capturedAt: new Date(startedAtMs + tenant + batch).toISOString(),
        manualJobs: Array.from({ length: Math.min(100, jobsPerTenant - batch * 100) }, (_, index) => ({
          title: index % 3 === 0 ? 'AI Application Engineer' : index % 3 === 1 ? 'QA Automation Engineer' : 'Frontend Application Developer',
          company: `Tenant ${tenant + 1} Company ${batch}-${index}`,
          location: 'Remote US',
          description: 'Next.js TypeScript OpenAI Playwright API testing dashboard automation',
          url: `https://load.local/t${tenant + 1}/${batch}/${index}`,
        })),
      });
    }
  }
  const measured = buildMeasuredJobLoadRun({
    tenants,
    jobs: tenants * jobsPerTenant,
    applications: tenants * applicationsPerTenant,
    packets: tenants * packetsPerTenant,
    startedAtMs,
    finishedAtMs: Date.now(),
  });

  const sb = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { error } = await sb.from('job_os_measured_load_runs').insert({
    run_key: runKey,
    tenants: measured.tenants,
    jobs: measured.jobs,
    applications: measured.applications,
    packets: measured.packets,
    duration_ms: measured.durationMs,
    p95_dashboard_ms: measured.p95DashboardMs,
    p95_export_ms: measured.p95ExportMs,
    status: measured.status,
    samples: measured.samples,
    metadata: {
      source: 'job_os_staging_load_script',
      syntheticLocal: process.env.JOB_OS_LOAD_ENV !== 'staging',
      environment: process.env.JOB_OS_LOAD_ENV ?? 'local',
    },
  });
  if (error) throw new Error(error.message);

  console.log(JSON.stringify({
    runKey,
    status: measured.status,
    tenants: measured.tenants,
    jobs: measured.jobs,
    applications: measured.applications,
    packets: measured.packets,
    durationMs: measured.durationMs,
    p95DashboardMs: measured.p95DashboardMs,
    p95ExportMs: measured.p95ExportMs,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
