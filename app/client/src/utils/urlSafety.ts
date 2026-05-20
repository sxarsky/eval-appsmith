/**
 * URL-safety validator shared with the server-side
 * {@link UrlSafetyValidator} (Java). A URL passes if and only if:
 *
 * 1. Scheme is `http` or `https`. `javascript:`, `data:`, `file:`,
 *    `ftp:` are rejected.
 * 2. Host is not loopback (`127.0.0.1`, `::1`), link-local
 *    (`169.254.0.0/16`, `fe80::/10`), or in an RFC1918 private range.
 * 3. URL is parseable.
 * 4. Authority does not contain user-info credentials
 *    (`https://user:pass@host/...`).
 *
 * Rule order mirrors the Java validator exactly.
 */

const ALLOWED_SCHEMES = new Set(["http:", "https:"]);

const LOOPBACK_V4 = /^127\./;
const LINK_LOCAL_V4 = /^169\.254\./;
const RFC1918_10 = /^10\./;
const RFC1918_172 = /^172\.(1[6-9]|2[0-9]|3[0-1])\./;
const RFC1918_192 = /^192\.168\./;

function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase();

  if (h === "localhost" || h === "::1") return true;
  if (h.startsWith("fe80:") || h.startsWith("[fe80:")) return true;

  if (LOOPBACK_V4.test(h)) return true;
  if (LINK_LOCAL_V4.test(h)) return true;
  if (RFC1918_10.test(h)) return true;
  if (RFC1918_172.test(h)) return true;
  if (RFC1918_192.test(h)) return true;

  return false;
}

export function isSafeUrl(url: string): boolean {
  if (typeof url !== "string" || url.trim().length === 0) {
    return false;
  }

  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    return false;
  }

  if (!ALLOWED_SCHEMES.has(parsed.protocol)) {
    return false;
  }

  // Credentials embedded in the authority (user[:password]@host).
  if (parsed.username !== "" || parsed.password !== "") {
    return false;
  }

  if (!parsed.hostname || parsed.hostname.length === 0) {
    return false;
  }

  return !isBlockedHost(parsed.hostname);
}
