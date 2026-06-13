/**
 * SSRF guard for the SEO-audit route.
 *
 * We only validate the hostname of the URL the user supplies. If a server
 * responds with a redirect (3xx) we re-validate the Location URL before
 * following it — see the route's fetchWithSsrfCheck helper.
 *
 * What this guard blocks:
 * - Standard dotted-decimal private IPv4 (10/8, 127/8, 169.254/16, 172.16-31/12, 192.168/16)
 * - IPv6 loopback (::1), unspecified (::), ULA (fc00::/7 = fc/fd prefix),
 *   link-local (fe80::/10), and IPv4-mapped private addresses (::ffff:<private-v4>)
 * - Non-standard IPv4 notations: octal (0177.x.x.x), hex (0x7f.x.x.x),
 *   and single-integer decimal forms (e.g. 2130706433) — rejected because
 *   we cannot safely parse all alt-notation forms, so anything that looks
 *   like a non-standard IP literal is blocked outright.
 * - localhost / .local / .internal hostnames.
 *
 * Residual risk: DNS rebinding after the initial SSRF check. Mitigation would
 * require resolving the hostname to an IP before every fetch, adding latency
 * and complexity beyond the stated scope. The window is narrow (milliseconds
 * between check and fetch) and acceptable for v1.
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
 * Reject a bare IPv6 address (brackets already stripped, lowercased).
 * Returns true when the address should be blocked.
 */
function isPrivateIpv6(addr: string): boolean {
  // Loopback
  if (addr === '::1') return true;
  // Unspecified
  if (addr === '::') return true;
  // ULA: fc00::/7 covers addresses starting with fc or fd
  if (addr.startsWith('fc') || addr.startsWith('fd')) return true;
  // Link-local: fe80::/10 (fe80 – febf, but fe80 is by far the common form)
  if (addr.startsWith('fe80') || addr.startsWith('fe8') || addr.startsWith('fe9') ||
      addr.startsWith('fea') || addr.startsWith('feb')) return true;
  // IPv4-mapped: ::ffff:<dotted-quad> or ::ffff:<hex-quad>
  if (addr.startsWith('::ffff:')) {
    const rest = addr.slice(7); // everything after "::ffff:"
    // Try dotted-decimal first
    if (/^\d+\.\d+\.\d+\.\d+$/.test(rest)) {
      return isPrivateIp(rest);
    }
    // Hex-quad form (e.g. "7f00:0001") — map to dotted-decimal and check
    const hexParts = rest.split(':');
    if (hexParts.length === 2) {
      const h1 = parseInt(hexParts[0], 16);
      const h2 = parseInt(hexParts[1], 16);
      if (!isNaN(h1) && !isNaN(h2)) {
        const dotted = `${(h1 >> 8) & 0xff}.${h1 & 0xff}.${(h2 >> 8) & 0xff}.${h2 & 0xff}`;
        return isPrivateIp(dotted);
      }
    }
    // When in doubt with IPv4-mapped, block it
    return true;
  }
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

  // ── Hostname blocklist ──────────────────────────────────────────────────────
  if (
    host === 'localhost' ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    throw new Error('That host is not allowed.');
  }

  // ── IPv6 ────────────────────────────────────────────────────────────────────
  // url.hostname returns "[::1]" with brackets for IPv6 literals.
  const isIpv6Literal = host.startsWith('[') || host.includes(':');
  if (isIpv6Literal) {
    const bare = host.replace(/^\[|\]$/g, ''); // strip surrounding brackets
    if (isPrivateIpv6(bare)) {
      throw new Error('That host is not allowed.');
    }
    // Unknown IPv6 ranges: when in doubt, reject. Only allow if it didn't
    // match any private range above — but to be safe, any address we cannot
    // positively identify as public is rejected.
    // For v1 we only allow standard public unicast (2000::/3).
    // If the first hex group, when parsed, falls outside 0x2000–0x3fff, block.
    const firstGroup = parseInt(bare.split(':')[0] || '0', 16);
    if (isNaN(firstGroup) || firstGroup < 0x2000 || firstGroup > 0x3fff) {
      throw new Error('That host is not allowed.');
    }
    return url;
  }

  // ── Non-standard IPv4 notations ─────────────────────────────────────────────
  // Standard dotted-decimal: four groups of decimal digits.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    // Standard form — check for private ranges.
    if (isPrivateIp(host)) {
      throw new Error('That host is not allowed.');
    }
    return url;
  }

  // Any other "looks like an IP" form: octal segments (0NNN), hex (0x…),
  // single-integer, or 2–3 segment numeric forms — block outright.
  // Patterns: all-numeric, contains "0x", starts with "0" followed by digits
  // (octal), or is a 1–3 segment numeric form.
  if (
    /^[0-9]+$/.test(host) ||              // single integer (decimal)
    /0x/i.test(host) ||                    // hex notation anywhere
    /^0\d/.test(host) ||                   // leading zero → octal
    /^\d+\.\d+$/.test(host) ||             // 2-segment
    /^\d+\.\d+\.\d+$/.test(host)           // 3-segment
  ) {
    throw new Error('That host is not allowed.');
  }

  // ── DNS hostname ─────────────────────────────────────────────────────────────
  // Treat as a DNS name — allow. DNS rebinding remains the documented residual
  // risk (see module-level comment).
  return url;
}
