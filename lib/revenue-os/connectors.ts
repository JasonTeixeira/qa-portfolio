export type LeadSourceDefinition = {
  name: string;
  type: 'directory' | 'job_board' | 'linkedin' | 'github' | 'referral' | 'inbound' | 'other';
  query: string;
  dailyLimit: number;
};

export type LeadSourceRunPlan = {
  dailyLeadTarget: number;
  sources: Array<LeadSourceDefinition & { qualificationSignals: string[] }>;
  dedupeKeys: string[];
};

const SIGNALS_BY_TYPE: Record<LeadSourceDefinition['type'], string[]> = {
  directory: ['weak website or conversion path', 'owner-operated business', 'visible local-market demand'],
  job_board: ['active hiring signal', 'budget capacity', 'possible AI or automation need'],
  linkedin: ['decision-maker reachable', 'recent launch or growth signal', 'professional-service fit'],
  github: ['technical product signal', 'developer tooling fit', 'public build activity'],
  referral: ['warm context', 'high trust path', 'fast meeting potential'],
  inbound: ['declared intent', 'contact permission', 'highest reply likelihood'],
  other: ['manual qualification required'],
};

function sourceKey(source: LeadSourceDefinition) {
  return `${source.type}:${source.name.trim().toLowerCase()}`;
}

export function buildLeadSourceConnectorPlan(input: {
  sources: LeadSourceDefinition[];
  existingDomains?: string[];
}): LeadSourceRunPlan {
  const seen = new Set<string>();
  const sources: LeadSourceRunPlan['sources'] = [];

  for (const source of input.sources) {
    const key = sourceKey(source);
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push({
      ...source,
      dailyLimit: Math.max(0, Math.min(250, Math.round(source.dailyLimit))),
      qualificationSignals: SIGNALS_BY_TYPE[source.type],
    });
  }

  return {
    sources,
    dailyLeadTarget: sources.reduce((sum, source) => sum + source.dailyLimit, 0),
    dedupeKeys: [...new Set((input.existingDomains ?? []).map((domain) => domain.toLowerCase()))],
  };
}

export const DEFAULT_LEAD_SOURCES: LeadSourceDefinition[] = [
  { name: 'Google Maps local services', type: 'directory', query: 'owner operated local service weak website', dailyLimit: 35 },
  { name: 'Clutch small agencies', type: 'directory', query: 'small agencies AI automation website rebuild', dailyLimit: 20 },
  { name: 'Remote OK implementation roles', type: 'job_board', query: 'remote junior implementation AI application', dailyLimit: 20 },
  { name: 'LinkedIn founder operators', type: 'linkedin', query: 'founder service business website conversion', dailyLimit: 25 },
];
