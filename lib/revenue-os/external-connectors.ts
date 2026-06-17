import { enrichConnectorLead, normalizeGooglePlaceLead, type EnrichedConnectorLead, type ConnectorLead } from './lead-connectors';

export type LeadConnector = {
  key: string;
  label: string;
  sourceType: 'google_places' | 'csv' | 'directory' | 'other';
  query: string;
  dailyLimit: number;
  costPerRunUsd: number;
  execute: (context: LeadConnectorRunContext) => Promise<ConnectorLead[]>;
};

export type LeadConnectorRunContext = {
  fetchImpl?: typeof fetch;
  existingDomains?: string[];
  enrichLead?: (lead: EnrichedConnectorLead) => Promise<{
    contactEmail?: string | null;
    confidence?: number;
    signals?: string[];
  }>;
};

export type LeadConnectorRunResult = {
  connectorKey: string;
  sourceType: LeadConnector['sourceType'];
  status: 'completed' | 'failed';
  leadsFound: number;
  deduped: number;
  importableLeads: EnrichedConnectorLead[];
  sample: EnrichedConnectorLead[];
  costEstimateUsd: number;
  error: string | null;
};

export type GooglePlacesConnectorInput = {
  apiKey?: string | null;
  query: string;
  locationBias?: {
    latitude: number;
    longitude: number;
    radiusMeters: number;
  };
  limit?: number;
};

function normalizeDomain(value: string | null | undefined) {
  if (!value) return null;
  try {
    return new URL(value).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    try {
      return new URL(`https://${value}`).hostname.replace(/^www\./, '').toLowerCase();
    } catch {
      return null;
    }
  }
}

function withContactEmail(lead: EnrichedConnectorLead, contactEmail: string | null | undefined): EnrichedConnectorLead {
  if (!contactEmail) return lead;
  return {
    ...lead,
    contactEmail,
    qualificationSignals: [...new Set([...lead.qualificationSignals, 'direct email available'])],
    importRow: [
      lead.name,
      lead.websiteUrl ?? '',
      lead.industry ?? '',
      lead.location ?? '',
      '',
      '',
      contactEmail,
    ].join(', '),
  };
}

export function buildGooglePlacesConnector(input: GooglePlacesConnectorInput): LeadConnector {
  const limit = Math.max(1, Math.min(20, Math.round(input.limit ?? 10)));
  return {
    key: `google_places:${input.query.trim().toLowerCase()}`,
    label: 'Google Places search',
    sourceType: 'google_places',
    query: input.query,
    dailyLimit: limit,
    costPerRunUsd: 0.08 * limit,
    async execute(context) {
      const fetchImpl = context.fetchImpl ?? fetch;
      const body: Record<string, unknown> = {
        textQuery: input.query,
        maxResultCount: limit,
      };
      if (input.locationBias) {
        body.locationBias = {
          circle: {
            center: {
              latitude: input.locationBias.latitude,
              longitude: input.locationBias.longitude,
            },
            radius: input.locationBias.radiusMeters,
          },
        };
      }

      const res = await fetchImpl('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': input.apiKey ?? '',
          'X-Goog-FieldMask': 'places.displayName,places.websiteUri,places.formattedAddress,places.nationalPhoneNumber,places.types',
        },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Google Places connector failed: ${res.status}`);
      const payload = (await res.json()) as { places?: unknown[] };
      return (payload.places ?? []).map((place) => normalizeGooglePlaceLead(place as Parameters<typeof normalizeGooglePlaceLead>[0]));
    },
  };
}

export async function runLeadConnector(connector: LeadConnector, context: LeadConnectorRunContext = {}): Promise<LeadConnectorRunResult> {
  try {
    const rawLeads = await connector.execute(context);
    const existing = new Set((context.existingDomains ?? []).map((domain) => domain.toLowerCase()));
    const seen = new Set<string>();
    const importableLeads: EnrichedConnectorLead[] = [];
    let deduped = 0;

    for (const rawLead of rawLeads) {
      const enriched = enrichConnectorLead(rawLead);
      const domain = normalizeDomain(enriched.websiteUrl);
      const dedupeKey = domain ?? `${enriched.name}:${enriched.location ?? ''}`.toLowerCase();
      if (existing.has(dedupeKey) || seen.has(dedupeKey)) {
        deduped += 1;
        continue;
      }
      seen.add(dedupeKey);

      const external = context.enrichLead ? await context.enrichLead(enriched) : null;
      const contactEnriched = withContactEmail(enriched, external?.contactEmail);
      importableLeads.push({
        ...contactEnriched,
        raw: {
          ...contactEnriched.raw,
          enrichment: external ?? null,
        },
        qualificationSignals: [
          ...new Set([
            ...contactEnriched.qualificationSignals,
            ...(external?.signals ?? []),
            external?.confidence != null ? `enrichment confidence ${external.confidence}` : null,
          ].filter((item): item is string => Boolean(item))),
        ],
      });
    }

    return {
      connectorKey: connector.key,
      sourceType: connector.sourceType,
      status: 'completed',
      leadsFound: rawLeads.length,
      deduped,
      importableLeads,
      sample: importableLeads.slice(0, 5),
      costEstimateUsd: connector.costPerRunUsd,
      error: null,
    };
  } catch (error) {
    return {
      connectorKey: connector.key,
      sourceType: connector.sourceType,
      status: 'failed',
      leadsFound: 0,
      deduped: 0,
      importableLeads: [],
      sample: [],
      costEstimateUsd: connector.costPerRunUsd,
      error: error instanceof Error ? error.message : 'Unknown connector error',
    };
  }
}
