export type RevenueAgentTaskType =
  | 'lead_research'
  | 'website_audit'
  | 'contact_enrichment'
  | 'personalization'
  | 'outreach_review'
  | 'inbox_triage'
  | 'experiment_analysis';

export type RevenueAgentTask = {
  id: string;
  type: RevenueAgentTaskType;
  title: string;
  priority: number;
  requiresApproval: boolean;
  status: 'queued' | 'running' | 'completed' | 'failed';
  result?: {
    summary: string;
    artifacts: string[];
  };
};

export type RevenueAgentRun = {
  runKey: string;
  tenantId: string;
  objective: string;
  status: 'queued' | 'running' | 'needs_attention' | 'completed';
  tasks: RevenueAgentTask[];
  traces: Array<{
    taskId: string;
    toolName: string;
    inputSummary: string;
    outputSummary: string;
    status: 'success' | 'warning' | 'error';
    createdAt: string;
  }>;
  decisions: Array<{
    taskId: string;
    title: string;
    requiresApproval: boolean;
    status: 'pending' | 'approved' | 'not_required';
  }>;
  failures: Array<{
    taskId: string;
    code: string;
    message: string;
    retryable: boolean;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
};

function taskId(type: RevenueAgentTaskType, index: number) {
  return `${type}-${index + 1}`;
}

function nowIso() {
  return new Date().toISOString();
}

function statusFor(tasks: RevenueAgentTask[]): RevenueAgentRun['status'] {
  if (tasks.some((task) => task.status === 'failed')) return 'needs_attention';
  if (tasks.every((task) => task.status === 'completed')) return 'completed';
  return tasks.some((task) => task.status === 'running') ? 'running' : 'queued';
}

export function buildAgentRun(input: {
  runKey: string;
  tenantId: string;
  objective: string;
  tasks: Array<{
    type: RevenueAgentTaskType;
    title: string;
    priority: number;
    requiresApproval: boolean;
  }>;
  createdAt?: string;
}): RevenueAgentRun {
  const createdAt = input.createdAt ?? nowIso();
  const tasks = input.tasks
    .map((task, index) => ({
      ...task,
      id: taskId(task.type, index),
      priority: Math.max(0, Math.min(100, Math.round(task.priority))),
      status: 'queued' as const,
    }))
    .sort((a, b) => b.priority - a.priority);

  return {
    runKey: input.runKey,
    tenantId: input.tenantId,
    objective: input.objective,
    status: 'queued',
    tasks,
    traces: [],
    decisions: tasks
      .filter((task) => task.requiresApproval)
      .map((task) => ({
        taskId: task.id,
        title: task.title,
        requiresApproval: true,
        status: 'pending',
      })),
    failures: [],
    createdAt,
    updatedAt: createdAt,
  };
}

export function recordAgentToolTrace(
  run: RevenueAgentRun,
  trace: Omit<RevenueAgentRun['traces'][number], 'createdAt'> & { createdAt?: string },
): RevenueAgentRun {
  const createdAt = trace.createdAt ?? nowIso();
  return {
    ...run,
    status: run.status === 'queued' ? 'running' : run.status,
    traces: [...run.traces, { ...trace, createdAt }],
    updatedAt: createdAt,
  };
}

export function completeAgentTask(
  run: RevenueAgentRun,
  taskId: string,
  result: RevenueAgentTask['result'],
): RevenueAgentRun {
  const updatedAt = nowIso();
  const tasks = run.tasks.map((task) =>
    task.id === taskId ? { ...task, status: 'completed' as const, result } : task,
  );
  return {
    ...run,
    tasks,
    status: statusFor(tasks),
    updatedAt,
  };
}

export function failAgentTask(
  run: RevenueAgentRun,
  taskId: string,
  failure: { code: string; message: string; retryable: boolean },
): RevenueAgentRun {
  const createdAt = nowIso();
  const tasks = run.tasks.map((task) =>
    task.id === taskId ? { ...task, status: 'failed' as const } : task,
  );
  return {
    ...run,
    tasks,
    status: 'needs_attention',
    failures: [...run.failures, { taskId, ...failure, createdAt }],
    updatedAt: createdAt,
  };
}
