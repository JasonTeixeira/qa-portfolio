/**
 * SSRF guard for the SEO-audit route.
 *
 * We only validate the hostname of the URL the user supplies. If a server
 * responds with a redirect (3xx) we re-validate the Location URL before
 * following it — see the route's fetchWithSsrfCheck helper.
 */

export function isPrivateIp(ip: string): boolean {
  const m = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!m) return false;
  const a = Number(m[1]);
  const b = Number(m[2]);
  if (a === 10 || a === 127 || a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

/**
 * Parse and validate a user-supplied URL.
 * Throws a user-friendly Error if the URL is malformed, uses a disallowed
 * scheme, or points at a private/loopback host.
 * Returns the parsed URL on success.
 */
export function assertPublicUrl(input: string): URL {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new Error('Enter a valid URL (https://…).');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Only http/https URLs are supported.');
  }
  const host = url.hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    throw new Error('That host is not allowed.');
  }
  if (/^\d+\.\d+\.\d+\.\d+$/.test(host) && isPrivateIp(host)) {
    throw new Error('That host is not allowed.');
  }
  return url;
}
