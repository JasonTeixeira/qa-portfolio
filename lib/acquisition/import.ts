import type { AcquisitionSignalInput } from './types';

export type ParsedAcquisitionLead = {
  name: string;
  websiteUrl: string | null;
  industry: string | null;
  location: string | null;
  contactName: string | null;
  contactTitle: string | null;
  contactEmail: string | null;
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

export function parseAcquisitionLeadList(input: string): ParsedAcquisitionLead[] {
  const rows = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#'));

  const parsed: ParsedAcquisitionLead[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    const cells = splitCsvLine(row);
    const lowerFirst = cells[0]?.toLowerCase();
    if (lowerFirst === 'name' || lowerFirst === 'company' || lowerFirst === 'company name') {
      continue;
    }

    const name = cells[0]?.trim();
    if (!name) continue;

    const websiteUrl = normalizeUrl(cells[1]);
    const contactEmail = normalizeEmail(cells[6] ?? cells[5]);
    const key = `${name.toLowerCase()}|${websiteUrl ?? contactEmail ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    parsed.push({
      name,
      websiteUrl,
      industry: cells[2]?.trim() || null,
      location: cells[3]?.trim() || null,
      contactName: cells[4]?.trim() || null,
      contactTitle: cells[5]?.trim() || null,
      contactEmail,
      signals: {
        businessModel: 'unknown',
        websiteUrl,
        hasWeakSeo: true,
        hasWeakConversionPath: true,
        contactConfidence: contactEmail ? 85 : 35,
        estimatedBudget: 'unknown',
        location: cells[3]?.trim() || null,
      },
    });
  }

  return parsed.slice(0, 100);
}
