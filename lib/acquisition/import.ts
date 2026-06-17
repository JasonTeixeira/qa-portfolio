import type { AcquisitionSignalInput, BusinessModel } from './types';

export type ParsedAcquisitionLead = {
  name: string;
  websiteUrl: string | null;
  industry: string | null;
  location: string | null;
  source: NonNullable<AcquisitionSignalInput['source']>;
  businessModel: BusinessModel;
  estimatedBudget: NonNullable<AcquisitionSignalInput['estimatedBudget']>;
  companySize: string | null;
  contactName: string | null;
  contactTitle: string | null;
  contactEmail: string | null;
  notes: string | null;
  tags: string[];
  signals: AcquisitionSignalInput;
};

function splitCsvLine(line: string) {
  const cells: string[] = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += char;
    }
  }

  cells.push(cell.trim());
  return cells;
}

function normalizeUrl(value: string | undefined) {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed)) return `https://${trimmed}`;
  return null;
}

function normalizeEmail(value: string | undefined) {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? trimmed : null;
}

function truthySignal(value: string | undefined) {
  const normalized = value?.trim().toLowerCase();
  return ['1', 'true', 'yes', 'y', 'x', 'has', 'weak', 'broken', 'outdated'].includes(normalized ?? '');
}

function canonicalHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const HEADER_ALIASES: Record<string, string> = {
  company: 'name',
  company_name: 'name',
  business: 'name',
  business_name: 'name',
  url: 'website',
  domain: 'website',
  website_url: 'website',
  market: 'industry',
  niche: 'industry',
  city: 'location',
  region: 'location',
  contact: 'contact_name',
  owner: 'contact_name',
  decision_maker: 'contact_name',
  title: 'contact_title',
  role: 'contact_title',
  email: 'contact_email',
  contact_email: 'contact_email',
  budget: 'estimated_budget',
  estimated_budget: 'estimated_budget',
  model: 'business_model',
  business_type: 'business_model',
  source_url: 'source',
  lead_source: 'source',
  size: 'company_size',
  employees: 'company_size',
};

function headerKey(value: string) {
  const canonical = canonicalHeader(value);
  return HEADER_ALIASES[canonical] ?? canonical;
}

function hasHeader(cells: string[]) {
  const keys = cells.map(headerKey);
  return keys.includes('name') || keys.includes('website') || keys.includes('contact_email');
}

function cellByHeader(cells: string[], headers: string[] | null, key: string, fallbackIndex: number) {
  if (headers) {
    const index = headers.indexOf(key);
    if (index >= 0) return cells[index];
  }
  return cells[fallbackIndex];
}

function normalizeBusinessModel(value: string | undefined, industry: string | null): BusinessModel {
  const raw = `${value ?? ''} ${industry ?? ''}`.toLowerCase();
  if (/\b(dental|plumb|hvac|roof|landscap|home service|contractor|clinic|salon|spa|fitness)\b/.test(raw)) return 'local_service';
  if (/\b(law|legal|account|consult|agency|advisor|insurance|finance|professional)\b/.test(raw)) return 'professional_service';
  if (/\b(saas|software|platform|api|developer|devtool)\b/.test(raw)) return 'saas';
  if (/\b(ecom|shop|store|retail|commerce|product)\b/.test(raw)) return 'ecommerce';
  if (/\b(health|wellness|medical|therapy|fitness)\b/.test(raw)) return 'health_wellness';
  if (/\b(real estate|realtor|property|broker)\b/.test(raw)) return 'real_estate';
  if (/\b(recruit|recruiting|staff|staffing|talent|hiring)\b/.test(raw)) return 'recruiting';
  if (/\b(course|school|education|academy|training)\b/.test(raw)) return 'education';
  if (/\b(creator|coach|newsletter|media)\b/.test(raw)) return 'creator';
  return 'unknown';
}

function normalizeBudget(value: string | undefined): NonNullable<AcquisitionSignalInput['estimatedBudget']> {
  const raw = value?.toLowerCase().replaceAll(/[$,\s]/g, '') ?? '';
  if (!raw) return 'unknown';
  if (/10k|15k|20k|25000/.test(raw)) return '10k_25k';
  if (/25k|50000|50k|100k|enterprise|high/.test(raw)) return '25k_plus';
  if (/5k|7500|10000|medium/.test(raw)) return '5k_10k';
  if (/2k|3000|4000|5000|low/.test(raw)) return '2k_5k';
  if (/under|sub|<|1000|1500/.test(raw)) return 'under_2k';
  return 'unknown';
}

function normalizeSource(value: string | undefined): NonNullable<AcquisitionSignalInput['source']> {
  const raw = value?.toLowerCase() ?? '';
  if (raw.includes('referral')) return 'referral';
  if (raw.includes('inbound')) return 'inbound';
  if (raw.includes('linkedin')) return 'linkedin';
  if (raw.includes('github')) return 'github';
  if (raw.includes('job')) return 'job_board';
  if (raw.includes('directory') || raw.includes('google') || raw.includes('maps')) return 'directory';
  if (raw.includes('audit')) return 'seo_audit';
  if (raw.includes('manual')) return 'manual';
  return 'bulk_import';
}

function splitTags(value: string | undefined) {
  return (value ?? '')
    .split(/[;|,]/)
    .map((tag) => tag.trim().toLowerCase().replaceAll(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''))
    .filter(Boolean)
    .slice(0, 12);
}

export function parseAcquisitionLeadList(input: string): ParsedAcquisitionLead[] {
  const rows = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));

  const parsed: ParsedAcquisitionLead[] = [];
  const seen = new Set<string>();
  let headers: string[] | null = null;

  for (const row of rows) {
    const cells = splitCsvLine(row);
    if (!headers && hasHeader(cells)) {
      headers = cells.map(headerKey);
      continue;
    }

    const name = cellByHeader(cells, headers, 'name', 0)?.trim();
    if (!name) continue;

    const industry = cellByHeader(cells, headers, 'industry', 2)?.trim() || null;
    const location = cellByHeader(cells, headers, 'location', 3)?.trim() || null;
    const businessModel = normalizeBusinessModel(cellByHeader(cells, headers, 'business_model', 7), industry);
    const estimatedBudget = normalizeBudget(cellByHeader(cells, headers, 'estimated_budget', 8));
    const source = normalizeSource(cellByHeader(cells, headers, 'source', 9));
    const websiteUrl = normalizeUrl(cellByHeader(cells, headers, 'website', 1));
    const contactEmail = normalizeEmail(cellByHeader(cells, headers, 'contact_email', 6) ?? cellByHeader(cells, headers, 'contact_title', 5));
    const contactName = cellByHeader(cells, headers, 'contact_name', 4)?.trim() || null;
    const contactTitle = cellByHeader(cells, headers, 'contact_title', 5)?.trim() || null;
    const companySize = cellByHeader(cells, headers, 'company_size', 10)?.trim() || null;
    const notes = cellByHeader(cells, headers, 'notes', 11)?.trim() || null;
    const tags = splitTags(cellByHeader(cells, headers, 'tags', 12));
    const basicHeaderImport = headers ? !headers.includes('notes') && !headers.includes('has_weak_seo') : true;
    const textSignals = `${industry ?? ''} ${contactTitle ?? ''} ${notes ?? ''} ${tags.join(' ')}`.toLowerCase();
    const key = `${name.toLowerCase()}|${websiteUrl ?? contactEmail ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    parsed.push({
      name,
      websiteUrl,
      industry,
      location,
      source,
      businessModel,
      estimatedBudget,
      companySize,
      contactName,
      contactTitle,
      contactEmail,
      notes,
      tags,
      signals: {
        businessModel,
        websiteUrl,
        source,
        industry,
        hasBrokenWebsite: truthySignal(cellByHeader(cells, headers, 'has_broken_website', 13)) || /\b(broken|down|error|slow|bad site)\b/.test(textSignals),
        hasOutdatedBrand: truthySignal(cellByHeader(cells, headers, 'has_outdated_brand', 14)) || /\b(outdated|dated|old brand|rebrand)\b/.test(textSignals),
        hasWeakSeo: truthySignal(cellByHeader(cells, headers, 'has_weak_seo', 15)) || basicHeaderImport || /\b(seo|ranking|visibility|maps)\b/.test(textSignals),
        hasWeakConversionPath: truthySignal(cellByHeader(cells, headers, 'has_weak_conversion_path', 16)) || basicHeaderImport || /\b(conversion|cta|lead|funnel)\b/.test(textSignals),
        hasBookingOrCheckoutGap: truthySignal(cellByHeader(cells, headers, 'has_booking_or_checkout_gap', 17)) || /\b(booking|checkout|schedule|appointment)\b/.test(textSignals),
        hasRecentHiringSignal: /\b(hiring|job|careers|recruit)\b/.test(textSignals),
        hasRecentFundingOrLaunch: /\b(funded|funding|launch|new location|opening|growth)\b/.test(textSignals),
        isOwnerOperated: /\b(owner|founder|principal|partner|ceo)\b/.test((contactTitle ?? '').toLowerCase()),
        contactConfidence: contactEmail ? 85 : 35,
        estimatedBudget,
        location,
        companySize,
        sourceConfidence: source === 'referral' || source === 'inbound' ? 90 : source === 'directory' ? 70 : 55,
        notes,
      },
    });
  }

  return parsed.slice(0, 100);
}
