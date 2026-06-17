export type ConnectorLead = {
  name: string;
  websiteUrl: string | null;
  industry: string | null;
  location: string | null;
  contactEmail: string | null;
  phone: string | null;
  sourceType: string;
  raw: Record<string, unknown>;
};

export type EnrichedConnectorLead = ConnectorLead & {
  qualificationSignals: string[];
  importRow: string;
};

export type GooglePlaceLeadInput = {
  displayName?: { text?: string };
  websiteUri?: string;
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  types?: string[];
};

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}

function key(value: string) {
  return value.trim().toLowerCase().replaceAll(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

function normalizeUrl(value: string | null | undefined) {
  const raw = value?.trim();
  if (!raw) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    return url.href;
  } catch {
    return null;
  }
}

function normalizeEmail(value: string | null | undefined) {
  const email = value?.trim().toLowerCase();
  if (!email) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : null;
}

export function parseConnectorCsvLeads(input: string): ConnectorLead[] {
  const rows = input.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (rows.length < 2) return [];
  const headers = splitCsvLine(rows[0]).map(key);

  return rows.slice(1).map((row) => {
    const cells = splitCsvLine(row);
    const get = (...names: string[]) => {
      for (const name of names) {
        const index = headers.indexOf(name);
        if (index >= 0) return cells[index] ?? '';
      }
      return '';
    };
    return {
      name: get('company', 'name', 'business') || 'Unknown lead',
      websiteUrl: normalizeUrl(get('website', 'website_url', 'url', 'domain')),
      industry: get('industry', 'market', 'niche') || null,
      location: get('location', 'city', 'region') || null,
      contactEmail: normalizeEmail(get('email', 'contact_email')),
      phone: get('phone', 'telephone') || null,
      sourceType: get('source', 'source_type') || 'csv',
      raw: Object.fromEntries(headers.map((header, index) => [header, cells[index] ?? ''])),
    };
  });
}

export function normalizeGooglePlaceLead(place: GooglePlaceLeadInput): ConnectorLead {
  return {
    name: place.displayName?.text?.trim() || 'Unknown Google Place',
    websiteUrl: normalizeUrl(place.websiteUri),
    industry: place.types?.[0] ?? null,
    location: place.formattedAddress ?? null,
    contactEmail: null,
    phone: place.nationalPhoneNumber ?? null,
    sourceType: 'google_places',
    raw: { ...place },
  };
}

export function enrichConnectorLead(lead: ConnectorLead): EnrichedConnectorLead {
  const qualificationSignals: string[] = [];
  if (lead.websiteUrl) qualificationSignals.push('website available for audit');
  if (lead.contactEmail) qualificationSignals.push('direct email available');
  if (lead.phone) qualificationSignals.push('phone contact available');
  if (lead.industry) qualificationSignals.push(`${lead.industry} segment`);
  if (!lead.contactEmail) qualificationSignals.push('needs contact enrichment');

  const importRow = [
    lead.name,
    lead.websiteUrl ?? '',
    lead.industry ?? '',
    lead.location ?? '',
    '',
    '',
    lead.contactEmail ?? '',
  ].join(', ');

  return {
    ...lead,
    qualificationSignals,
    importRow,
  };
}
