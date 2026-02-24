type DateFormat = "short" | "long";

/**
 * Formats a YYYY-MM-DD date deterministically (no timezone drift).
 *
 * Why:
 * - `new Date('YYYY-MM-DD')` is interpreted as UTC by JS,
 *   then rendered in the user’s local timezone which can shift the day.
 * - That can cause SSR/CSR hydration mismatches in Next.js.
 */
export function formatISODateUTC(dateISO: string, format: DateFormat): string {
  const date = dateISO.includes("T") ? new Date(dateISO) : new Date(`${dateISO}T00:00:00Z`);

  const common: Intl.DateTimeFormatOptions = {
    year: "numeric",
    timeZone: "UTC",
  };

  const opts: Intl.DateTimeFormatOptions =
    format === "long"
      ? { ...common, month: "long", day: "numeric" }
      : { ...common, month: "short", day: "numeric" };

  return new Intl.DateTimeFormat("en-US", opts).format(date);
}
