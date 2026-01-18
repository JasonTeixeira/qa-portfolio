"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, Shield, Activity, BarChart3, ListChecks, GitBranch, ArrowUpRight, ArrowDownRight, ArrowUpDown, FileText, Info, Pause, Play, RotateCw } from 'lucide-react';
import type { HealthStatus, QualityHistory, QualityMetricsSnapshot, QualityProjectMetric } from '@/lib/qualityMetrics';
import { getQualityHistoryLive, getQualityHistorySnapshot, getQualityMetricsAws, getQualityMetricsLive, getQualityMetricsSnapshot } from '@/lib/qualityMetrics';
import { KpiCard } from '@/components/ui/dashboard/KpiCard';
import { SparklineWithTooltip } from '@/components/ui/dashboard/Sparkline';

function formatInt(v?: number) {
  if (v === undefined || Number.isNaN(v)) return '—';
  return new Intl.NumberFormat().format(v);
}

function lastNDates(history: QualityHistory | null, n: number) {
  return (history ?? []).slice(-n).map((e) => String(e.generatedAt).slice(0, 10));
}

function statusMeta(status: HealthStatus) {
  switch (status) {
    case 'healthy':
      return {
        label: 'Healthy',
        className: 'bg-green-500/10 text-green-400 border-green-500/20',
        icon: CheckCircle2,
      };
    case 'degraded':
      return {
        label: 'Degraded',
        className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        icon: AlertTriangle,
      };
    case 'down':
      return {
        label: 'Down',
        className: 'bg-red-500/10 text-red-400 border-red-500/20',
        icon: AlertTriangle,
      };
  }
}

function formatPercent(v?: number) {
  if (v === undefined || Number.isNaN(v)) return '—';
  return `${Math.round(v * 100)}%`;
}

function formatIso(ts?: string) {
  if (!ts) return '—';
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function formatTimeAgo(ts?: string) {
  if (!ts) return '—';
  const t = new Date(ts).getTime();
  if (Number.isNaN(t)) return '—';
  const diffSec = Math.floor((Date.now() - t) / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 48) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

function scoreColor(score?: number) {
  if (score === undefined) return 'text-gray-400';
  if (score >= 0.95) return 'text-green-400';
  if (score >= 0.9) return 'text-yellow-400';
  return 'text-red-400';
}

function securityColor(n?: number) {
  if (n === undefined) return 'text-gray-400';
  if (n === 0) return 'text-green-400';
  return 'text-red-400';
}

export default function QualityDashboardClient() {
  const [snapshot, setSnapshot] = useState<QualityMetricsSnapshot | null>(null);
  const [history, setHistory] = useState<QualityHistory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'snapshot' | 'live' | 'aws'>('snapshot');
  const [statusFilter, setStatusFilter] = useState<'all' | HealthStatus>('all');
  type TypeFilter = 'all' | 'portfolio' | 'project' | 'service';
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<'status' | 'lastRun' | 'name'>('status');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [fetchedAt, setFetchedAt] = useState<number | null>(null);
  const [nowTick, setNowTick] = useState<number>(() => Date.now());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshEverySec, setRefreshEverySec] = useState(60);
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function loadDashboardData(nextMode: 'snapshot' | 'live' | 'aws') {
    setIsRefreshing(true);
    const snapshotLoader = nextMode === 'live'
      ? getQualityMetricsLive
      : nextMode === 'aws'
        ? getQualityMetricsAws
        : getQualityMetricsSnapshot;
    const historyLoader = nextMode === 'live' ? getQualityHistoryLive : getQualityHistorySnapshot;
    try {
      const s = await Promise.all([snapshotLoader(), historyLoader()]);
      setSnapshot(s[0]);
      setHistory(s[1]);
      setFetchedAt(Date.now());
      setError(null);
    } finally {
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    loadDashboardData(mode)
      .then(() => {
        if (!mounted) return;
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : 'Failed to load dashboard data');
      });
    return () => {
      mounted = false;
    };
  }, [mode]);

  // Live-mode auto-refresh (internal-tool feel). This is intentionally off for Snapshot.
  useEffect(() => {
    if (mode !== 'live') return;
    if (!autoRefresh) return;
    if (!refreshEverySec || refreshEverySec < 10) return;

    const t = setInterval(() => {
      loadDashboardData('live').catch(() => {
        // ignore transient failures; UI already supports error state
      });
    }, refreshEverySec * 1000);

    return () => clearInterval(t);
  }, [autoRefresh, mode, refreshEverySec]);

  // Small UI-only clock so we can show “fetched Xs ago” without refetching.
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const projects = useMemo(() => snapshot?.projects ?? [], [snapshot]);

  const historyProjectsByRepo = useMemo(() => {
    const map = new Map<string, QualityProjectMetric[]>();
    for (const entry of history ?? []) {
      for (const p of entry.projects ?? []) {
        const arr = map.get(p.repo) ?? [];
        arr.push(p);
        map.set(p.repo, arr);
      }
    }
    return map;
  }, [history]);

  const overallStats = useMemo(() => {
    const total = projects.length;
    const healthy = projects.filter((p) => p.status === 'healthy').length;
    const degraded = projects.filter((p) => p.status === 'degraded').length;
    const down = projects.filter((p) => p.status === 'down').length;
    return { total, healthy, degraded, down };
  }, [projects]);

  const testStats = useMemo(() => {
    const reposWithTotals = projects.filter((p) => typeof p.tests?.total === 'number');
    const totalTests = reposWithTotals.reduce((acc, p) => acc + (p.tests?.total ?? 0), 0);

    // Weighted pass rate across repos, using tests.total as weights.
    const weightedPassRate = reposWithTotals.length
      ? (() => {
          let pass = 0;
          let total = 0;
          for (const p of reposWithTotals) {
            const t = p.tests?.total ?? 0;
            const pr = p.tests?.passRate;
            if (!t || pr === undefined || pr === null) continue;
            pass += t * pr;
            total += t;
          }
          return total ? pass / total : undefined;
        })()
      : undefined;

    return { totalTests, weightedPassRate, reposWithTotals: reposWithTotals.length };
  }, [projects]);

  const filteredSortedProjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    const statusRank: Record<HealthStatus, number> = { down: 0, degraded: 1, healthy: 2 };

    const filtered = projects.filter((p) => {
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.repo.toLowerCase().includes(q)
      );
    });

    const dir = sortDir === 'asc' ? 1 : -1;

    const sorted = [...filtered].sort((a, b) => {
      if (sort === 'name') return dir * a.name.localeCompare(b.name);
      if (sort === 'lastRun') return dir * String(a.lastRun || '').localeCompare(String(b.lastRun || ''));
      // status
      return dir * (statusRank[a.status] - statusRank[b.status]);
    });

    return sorted;
  }, [projects, query, sort, sortDir, statusFilter, typeFilter]);

  function toggleSort(next: 'status' | 'lastRun' | 'name') {
    if (sort !== next) {
      setSort(next);
      setSortDir('asc');
      return;
    }
    setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
  }

  function computeTrend(repo: string) {
    const h = historyProjectsByRepo.get(repo) ?? [];
    const last7 = h.slice(-7);
    const prev7 = h.slice(-14, -7);
    // Derive a stable UTC date key per history entry from its order (history.json is stored by day).
    // We don't currently store per-entry date on the per-repo object, so we infer from array position.
    // We'll provide dates based on the history entry timestamps, aligned by index in the history list.
    const entryDates = lastNDates(history, 7);

    const healthyLast7 = last7.filter((x) => x.status === 'healthy').length;
    const healthyPrev7 = prev7.filter((x) => x.status === 'healthy').length;
    const delta = (last7.length ? healthyLast7 / last7.length : 0) - (prev7.length ? healthyPrev7 / prev7.length : 0);
    const series = last7.map((x) => x.status);

    return {
      series,
      dates: entryDates.slice(-series.length),
      label: last7.length ? `${healthyLast7}/${last7.length} healthy (7d)` : '—',
      delta,
    };
  }

  // If a Live response falls back to the snapshot file, it will often look "old".
  // Show a more helpful timestamp label for live mode.
  const generatedLabel = useMemo(() => {
    if (!snapshot?.generatedAt) return '—';
    return mode === 'live'
      ? `${formatIso(snapshot.generatedAt)} (${formatTimeAgo(snapshot.generatedAt)})`
      : formatIso(snapshot.generatedAt);
  }, [mode, snapshot]);

  const fetchedAgoLabel = useMemo(() => {
    if (!fetchedAt) return '—';
    const diffSec = Math.floor((nowTick - fetchedAt) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}h ago`;
  }, [fetchedAt, nowTick]);

  const refreshInLabel = useMemo(() => {
    if (mode !== 'live' || !autoRefresh || !fetchedAt) return '—';
    const elapsed = Math.floor((nowTick - fetchedAt) / 1000);
    const remain = Math.max(refreshEverySec - (elapsed % refreshEverySec), 0);
    if (remain < 60) return `${remain}s`;
    const m = Math.floor(remain / 60);
    const s = remain % 60;
    return `${m}m ${s}s`;
  }, [autoRefresh, fetchedAt, mode, nowTick, refreshEverySec]);

  const overall = snapshot?.summary?.overallStatus ?? 'healthy';
  const overallMeta = statusMeta(overall);

  const modeMeta = useMemo(() => {
    if (mode === 'live') {
      return {
        label: 'Live (GitHub API)',
        className: 'bg-primary/15 text-foreground border-primary/30',
      };
    }
    if (mode === 'aws') {
      return {
        label: 'Cloud (AWS S3)',
        className: 'bg-emerald-500/10 text-emerald-200 border-emerald-500/30',
      };
    }
    return {
      label: 'Snapshot (CI file)',
      className: 'bg-dark-card text-gray-300 border-dark-lighter',
    };
  }, [mode]);

  const anyDebug = useMemo(() => {
    if (mode !== 'live') return false;
    return (projects ?? []).some((p) => Boolean(p.debug?.latestRunId || p.debug?.matchedRunId));
  }, [mode, projects]);

  const proof = useMemo(() => {
    // Prefer a run URL from the portfolio repo, otherwise fall back to first available.
    const portfolio = projects.find((p) => p.name === 'qa-portfolio');
    const runUrl = portfolio?.ci?.reportUrl || projects.find((p) => p.ci?.reportUrl)?.ci?.reportUrl;
    return {
      runUrl,
      awsProxyUrl: 'https://api.sageideas.dev/metrics/latest',
      cloudwatchDashboardUrl: 'https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=qa-portfolio-prod-api',
      terraformUrl: 'https://github.com/JasonTeixeira/qa-portfolio/tree/master/infra/aws-quality-telemetry',
    };
  }, [projects]);

  return (
    <div className="min-h-screen bg-dark">
      <section className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <Activity className="text-primary" size={20} />
                <span className="text-primary font-mono text-sm">Quality Telemetry</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
                Quality Dashboard
              </h1>
              <p className="text-gray-300 mt-4 max-w-3xl">
                A production-style view of automation health: build status, test reliability, performance budgets, and security posture.
                Snapshot is CI-generated. Live pulls GitHub Actions + artifact-backed metrics. Cloud mode is designed for AWS S3 ingestion (with safe fallback).
              </p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('snapshot');
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
                    mode === 'snapshot'
                      ? 'bg-primary/15 text-foreground border-primary/30'
                      : 'bg-dark-card text-gray-300 border-dark-lighter hover:border-primary/40'
                  }`}
                >
                  Snapshot
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('live');
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
                    mode === 'live'
                      ? 'bg-primary/15 text-foreground border-primary/30'
                      : 'bg-dark-card text-gray-300 border-dark-lighter hover:border-primary/40'
                  }`}
                >
                  Live
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('aws');
                  }}
                  className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
                    mode === 'aws'
                      ? 'bg-emerald-500/10 text-emerald-200 border-emerald-500/30'
                      : 'bg-dark-card text-gray-300 border-dark-lighter hover:border-emerald-500/40'
                  }`}
                >
                  Cloud
                </button>
              </div>

              <div className={`px-3 py-1 text-xs font-semibold rounded-full border ${modeMeta.className} flex items-center gap-2`}>
                <span>{modeMeta.label}</span>
                <span className="text-gray-400 font-mono">· fetched {fetchedAgoLabel}</span>
                {mode === 'live' && autoRefresh && (
                  <span className="text-gray-400 font-mono">· refresh in {refreshInLabel}</span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative group">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border border-dark-lighter bg-dark-card text-gray-200 hover:border-primary/60 transition-colors"
                    aria-label="What does Live mode fetch?"
                  >
                    <Info size={14} className="text-primary" />
                    Live mode info
                  </button>
                  <div className="pointer-events-none absolute right-0 mt-2 w-80 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="rounded-lg border border-dark-lighter bg-dark-card p-3 text-xs text-gray-300 shadow-xl">
                      <div className="font-semibold text-foreground mb-1">What Live mode pulls</div>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>GitHub Actions run metadata (health + timestamps)</li>
                        <li>Scans recent runs for the <span className="font-mono">qa-metrics</span> artifact</li>
                        <li>Downloads the artifact ZIP and parses <span className="font-mono">qa-metrics.json</span> (when available)</li>
                      </ul>
                      <div className="mt-2 text-gray-400">
                        If GitHub rate-limits or the artifact is missing, the dashboard degrades gracefully (snapshot + notes/debug).
                      </div>
                    </div>
                  </div>
                </div>

                {mode === 'live' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => loadDashboardData('live').catch(() => {})}
                      disabled={isRefreshing}
                      className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border border-dark-lighter bg-dark-card text-gray-200 hover:border-primary/60 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <RotateCw size={14} className={`text-primary ${isRefreshing ? 'animate-spin' : ''}`} />
                      {isRefreshing ? 'Refreshing…' : 'Refresh now'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setAutoRefresh((v) => !v)}
                      className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border border-dark-lighter bg-dark-card text-gray-200 hover:border-primary/60 transition-colors"
                    >
                      {autoRefresh ? <Pause size={14} className="text-primary" /> : <Play size={14} className="text-primary" />}
                      {autoRefresh ? 'Pause auto-refresh' : 'Enable auto-refresh'}
                    </button>

                    <select
                      value={refreshEverySec}
                      onChange={(e) => setRefreshEverySec(Number(e.target.value))}
                      className="bg-dark-card border border-dark-lighter rounded-full px-3 py-1 text-xs text-gray-200"
                      aria-label="Auto-refresh interval"
                    >
                      <option value={30}>30s</option>
                      <option value={60}>60s</option>
                      <option value={120}>2m</option>
                      <option value={300}>5m</option>
                    </select>
                  </div>
                )}
              </div>

              <div className={`px-3 py-1 text-xs font-semibold rounded-full border ${overallMeta.className} flex items-center gap-2`}>
                <overallMeta.icon size={14} />
                <span>Overall: {overallMeta.label}</span>
              </div>
              <div className="text-sm text-gray-400 flex items-center gap-2">
                <Clock size={14} />
                <span>{mode === 'live' ? 'Live fetched:' : 'Snapshot:'} {generatedLabel}</span>
              </div>
            </div>
          </div>

          {snapshot?.summary?.notes && (
            <div className="mt-8 p-4 bg-dark-card border border-dark-lighter rounded-lg text-sm text-gray-300">
              {snapshot.summary.notes}
            </div>
          )}

          {/* Proof links */}
          <div className="mt-8 flex flex-wrap gap-3">
            {proof.runUrl && (
              <a
                href={proof.runUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark-lighter bg-dark-card text-sm text-gray-200 hover:border-primary/60 transition-colors"
              >
                <ExternalLink size={16} className="text-primary" />
                Proof: CI run used
              </a>
            )}
            <Link
              href="/platform/quality-telemetry"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark-lighter bg-dark-card text-sm text-gray-200 hover:border-primary/60 transition-colors"
            >
              <FileText size={16} className="text-primary" />
              System design
            </Link>
            <a
              href={proof.awsProxyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark-lighter bg-dark-card text-sm text-gray-200 hover:border-emerald-400/60 transition-colors"
            >
              <ExternalLink size={16} className="text-emerald-300" />
              Proof: AWS proxy endpoint
            </a>
            <a
              href={proof.cloudwatchDashboardUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark-lighter bg-dark-card text-sm text-gray-200 hover:border-emerald-400/60 transition-colors"
            >
              <ExternalLink size={16} className="text-emerald-300" />
              Proof: CloudWatch dashboard
            </a>
            <a
              href={proof.terraformUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark-lighter bg-dark-card text-sm text-gray-200 hover:border-primary/60 transition-colors"
            >
              <ExternalLink size={16} className="text-primary" />
              Terraform (aws-quality-telemetry)
            </a>
            <Link
              href="/artifacts"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-dark-lighter bg-dark-card text-sm text-gray-200 hover:border-primary/60 transition-colors"
            >
              <Shield size={16} className="text-primary" />
              Evidence library
            </Link>
          </div>

          {/* Cloud mode proof */}
          {mode === 'aws' && (
            <div className="mt-8 bg-dark-card border border-emerald-500/20 rounded-lg p-5">
              <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                <Shield size={16} className="text-emerald-300" />
                Cloud mode is backed by AWS (no AWS creds in Vercel)
              </div>
              <p className="mt-2 text-sm text-gray-300 max-w-3xl">
                Cloud mode reads metrics via an AWS-hosted proxy API (API Gateway → Lambda → S3). This keeps the public
                portfolio runtime credential-free while still proving a real cloud deployment.
              </p>
              <div className="mt-3 text-xs text-gray-400 font-mono">
                Proxy: {proof.awsProxyUrl}
              </div>
            </div>
          )}

          {error && (
            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300">
              {error}
            </div>
          )}

          {/* Live debug / observability */}
          {anyDebug && (
            <details className="mt-8 bg-dark-card border border-dark-lighter rounded-lg">
              <summary className="cursor-pointer select-none px-6 py-4 text-sm text-gray-200 font-semibold flex items-center justify-between">
                <span>Live debug (observability)</span>
                <span className="text-xs text-gray-500 font-mono">run selection · artifact match · scan depth</span>
              </summary>
              <div className="px-6 pb-6">
                <div className="text-xs text-gray-400 mb-4">
                  This is intentionally exposed in the demo to show how the system chooses a run/artifact and how it degrades gracefully.
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs font-mono">
                    <thead className="text-gray-400">
                      <tr className="text-left border-b border-dark-lighter">
                        <th className="py-2 pr-4">Repo</th>
                        <th className="py-2 pr-4">Latest run</th>
                        <th className="py-2 pr-4">Matched run</th>
                        <th className="py-2 pr-4">Scanned</th>
                        <th className="py-2 pr-4">Artifact</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-200">
                      {filteredSortedProjects
                        .filter((p) => p.debug)
                        .map((p) => (
                          <tr key={`dbg-${p.repo}`} className="border-b border-dark-lighter/60">
                            <td className="py-2 pr-4 whitespace-nowrap">{p.name}</td>
                            <td className="py-2 pr-4 whitespace-nowrap">
                              {p.debug?.latestRunUrl ? (
                                <a className="text-primary hover:text-primary-dark" href={p.debug.latestRunUrl} target="_blank" rel="noreferrer">
                                  {p.debug.latestRunId ?? '—'}
                                </a>
                              ) : (
                                <span>{p.debug?.latestRunId ?? '—'}</span>
                              )}
                            </td>
                            <td className="py-2 pr-4 whitespace-nowrap">
                              {p.debug?.matchedRunUrl ? (
                                <a className="text-primary hover:text-primary-dark" href={p.debug.matchedRunUrl} target="_blank" rel="noreferrer">
                                  {p.debug.matchedRunId ?? '—'}
                                </a>
                              ) : (
                                <span>{p.debug?.matchedRunId ?? '—'}</span>
                              )}
                            </td>
                            <td className="py-2 pr-4 whitespace-nowrap">{p.debug?.scannedRuns ?? '—'}</td>
                            <td className="py-2 pr-4 whitespace-nowrap">{p.debug?.matchedArtifactName ?? '—'}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </details>
          )}

          {/* Targets */}
          <div className="mt-10 grid md:grid-cols-3 gap-6">
            <div className="bg-dark-card border border-dark-lighter rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-2">Reliability Targets</h2>
              <div className="text-gray-300 text-sm space-y-2">
                <div className="flex justify-between">
                  <span>Flake rate</span>
                  <span className="text-primary font-mono">≤ {formatPercent(snapshot?.summary?.targets?.flakeRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Critical vulns</span>
                  <span className={`font-mono ${securityColor(snapshot?.summary?.targets?.criticalVulns)}`}>{snapshot?.summary?.targets?.criticalVulns ?? '—'}</span>
                </div>
              </div>
            </div>

            <div className="bg-dark-card border border-dark-lighter rounded-lg p-6 md:col-span-2">
              <h2 className="text-lg font-semibold text-foreground mb-2">Performance Budgets (Lighthouse)</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                {(['performance', 'accessibility', 'bestPractices', 'seo'] as const).map((k) => (
                  <div key={k} className="bg-dark-lighter rounded-lg p-4 text-center">
                    <div className="text-xs text-gray-400 capitalize">{k.replace('bestPractices', 'best practices')}</div>
                    <div className="mt-1 text-primary font-mono">≥ {formatPercent(snapshot?.summary?.targets?.lighthouse?.[k])}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* KPI row */}
          <div className="mt-10 grid md:grid-cols-4 gap-6">
            <KpiCard
              title="Repos monitored"
              value={String(overallStats.total)}
              sublabel={`Healthy ${overallStats.healthy} · Degraded ${overallStats.degraded} · Down ${overallStats.down}`}
              icon={<GitBranch size={18} />}
            />
            <KpiCard
              title="Tests (known)"
              value={formatInt(testStats.totalTests)}
              sublabel={`${testStats.reposWithTotals}/${overallStats.total} repos reporting totals`}
              icon={<BarChart3 size={18} />}
            />
            <KpiCard
              title="Pass rate (weighted)"
              value={formatPercent(testStats.weightedPassRate)}
              sublabel="Weighted by test count"
              icon={<Clock size={18} />}
            />
            <KpiCard
              title="Quality gates"
              value="Enabled"
              sublabel="Lint · Build · UI tests · Lighthouse"
              icon={<ListChecks size={18} />}
            />
          </div>

          {/* Projects table */}
          <div className="mt-10 bg-dark-card border border-dark-lighter rounded-lg overflow-hidden">
            <div className="p-6 border-b border-dark-lighter flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold text-foreground">Build Health by Project</h2>
              <Link
                href="/projects"
                className="text-primary hover:text-primary-dark transition-colors text-sm font-semibold"
              >
                View case studies →
              </Link>
            </div>

            {/* Filters */}
            <div className="p-6 border-b border-dark-lighter flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-xs text-gray-400">Status</label>
                <select
                  className="bg-dark-lighter border border-dark-lighter rounded-md px-3 py-2 text-sm text-gray-200"
                  aria-label="Filter by status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | HealthStatus)}
                >
                  <option value="all">All</option>
                  <option value="healthy">Healthy</option>
                  <option value="degraded">Degraded</option>
                  <option value="down">Down</option>
                </select>

                <label className="text-xs text-gray-400">Type</label>
                <select
                  className="bg-dark-lighter border border-dark-lighter rounded-md px-3 py-2 text-sm text-gray-200"
                  aria-label="Filter by type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
                >
                  <option value="all">All</option>
                  <option value="portfolio">Portfolio</option>
                  <option value="project">Project</option>
                  <option value="service">Service</option>
                </select>

                <label className="text-xs text-gray-400">Sort</label>
                <select
                  className="bg-dark-lighter border border-dark-lighter rounded-md px-3 py-2 text-sm text-gray-200"
                  aria-label="Sort projects"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value as 'status' | 'lastRun' | 'name');
                    setSortDir('asc');
                  }}
                >
                  <option value="status">Status</option>
                  <option value="lastRun">Last run</option>
                  <option value="name">Name</option>
                </select>
              </div>

              <div className="flex-1" />

              <input
                aria-label="Search repositories"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full lg:w-72 bg-dark-lighter border border-dark-lighter rounded-md px-3 py-2 text-sm text-gray-200 placeholder:text-gray-500"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-dark-lighter">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-gray-300 font-semibold">
                      <button
                        type="button"
                        onClick={() => toggleSort('name')}
                        className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
                        aria-label={`Sort by project name (${sort === 'name' ? sortDir : 'asc'})`}
                      >
                        Project <ArrowUpDown size={14} className={sort === 'name' ? 'text-primary' : 'text-gray-500'} />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-gray-300 font-semibold">
                      <button
                        type="button"
                        onClick={() => toggleSort('status')}
                        className="inline-flex items-center gap-2 hover:text-foreground transition-colors"
                        aria-label={`Sort by status (${sort === 'status' ? sortDir : 'asc'})`}
                      >
                        Status <ArrowUpDown size={14} className={sort === 'status' ? 'text-primary' : 'text-gray-500'} />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-gray-300 font-semibold">Trend</th>
                    <th className="px-6 py-4 text-gray-300 font-semibold">Tests</th>
                    <th className="px-6 py-4 text-gray-300 font-semibold">Pass rate</th>
                    <th className="px-6 py-4 text-gray-300 font-semibold">Flake rate</th>
                    <th className="px-6 py-4 text-gray-300 font-semibold">Lighthouse</th>
                    <th className="px-6 py-4 text-gray-300 font-semibold">Security</th>
                    <th className="px-6 py-4 text-gray-300 font-semibold">Links</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSortedProjects.map((p: QualityProjectMetric) => {
                    const m = statusMeta(p.status);
                    const trend = computeTrend(p.repo);
                    return (
                      <tr key={p.repo} className="border-t border-dark-lighter hover:bg-dark-lighter/40">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">{p.name}</div>
                          <div className="text-xs text-gray-400 font-mono">{p.repo}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full border ${m.className}`}>
                            <m.icon size={14} /> {m.label}
                          </span>
                          <div className="text-xs text-gray-400 mt-2">Last run: {formatIso(p.lastRun)}</div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <SparklineWithTooltip series={trend.series} dates={trend.dates} />
                            <div className="text-xs text-gray-400">
                              <div>{trend.label}</div>
                              <div className="mt-1 flex items-center gap-1">
                                {trend.delta >= 0 ? (
                                  <ArrowUpRight size={14} className="text-green-400" />
                                ) : (
                                  <ArrowDownRight size={14} className="text-red-400" />
                                )}
                                <span className={trend.delta >= 0 ? 'text-green-400' : 'text-red-400'}>
                                  {Math.round(Math.abs(trend.delta) * 100)}% vs prior 7d
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-200 font-mono">{p.tests?.total ?? '—'}</td>
                        <td className="px-6 py-4 font-mono text-gray-200">{formatPercent(p.tests?.passRate)}</td>
                        <td className="px-6 py-4 font-mono text-gray-200">{formatPercent(p.tests?.flakeRate)}</td>
                        <td className="px-6 py-4">
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
                            <span className={scoreColor(p.performance?.lighthouse?.performance)}>P {formatPercent(p.performance?.lighthouse?.performance)}</span>
                            <span className={scoreColor(p.performance?.lighthouse?.accessibility)}>A {formatPercent(p.performance?.lighthouse?.accessibility)}</span>
                            <span className={scoreColor(p.performance?.lighthouse?.bestPractices)}>BP {formatPercent(p.performance?.lighthouse?.bestPractices)}</span>
                            <span className={scoreColor(p.performance?.lighthouse?.seo)}>SEO {formatPercent(p.performance?.lighthouse?.seo)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs">
                            <Shield size={14} className="text-primary" />
                            <span className={`font-mono ${securityColor(p.security?.critical)}`}>C:{p.security?.critical ?? '—'}</span>
                            <span className="font-mono text-gray-300">H:{p.security?.high ?? '—'}</span>
                            <span className="font-mono text-gray-300">M:{p.security?.medium ?? '—'}</span>
                            <span className="font-mono text-gray-300">L:{p.security?.low ?? '—'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
                            {p.ci?.runsUrl && (
                              <a
                                href={p.ci.runsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
                              >
                                <ExternalLink size={14} /> CI runs
                              </a>
                            )}
                            {p.ci?.reportUrl && (
                              <a
                                href={p.ci.reportUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-primary hover:text-primary-dark transition-colors"
                              >
                                <ExternalLink size={14} /> Run used
                              </a>
                            )}

                            {mode === 'live' && p.debug?.matchedRunId && (
                              <div className="text-[11px] text-gray-500 font-mono">
                                matched run: {p.debug.matchedRunId}
                                {typeof p.debug.scannedRuns === 'number' ? ` (scan ${p.debug.scannedRuns})` : ''}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {projects.length === 0 && (
                    <tr>
                      <td className="px-6 py-10 text-center text-gray-400" colSpan={9}>
                        No metrics configured yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
