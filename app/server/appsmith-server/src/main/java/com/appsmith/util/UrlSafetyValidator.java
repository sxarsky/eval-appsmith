package com.appsmith.util;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Set;
import java.util.regex.Pattern;

/**
 * Validates URLs against a safety rule-set shared with the client-side
 * {@code urlSafety.ts} implementation. A URL passes if and only if:
 *
 * <ol>
 *   <li>Scheme is {@code http} or {@code https}. {@code javascript:},
 *       {@code data:}, {@code file:}, {@code ftp:} are rejected.</li>
 *   <li>Host is not loopback ({@code 127.0.0.1}, {@code ::1}), link-local
 *       ({@code 169.254.0.0/16}, {@code fe80::/10}), or in an RFC1918
 *       private range.</li>
 *   <li>URL is parseable.</li>
 *   <li>Authority does not contain user-info credentials
 *       ({@code https://user:pass@host/...}).</li>
 * </ol>
 *
 * Rule order mirrors the TypeScript validator exactly.
 */
public final class UrlSafetyValidator {

    private static final Set<String> ALLOWED_SCHEMES = Set.of("http", "https");

    // RFC1918 prefix matchers + loopback / link-local v4 + IPv6 loopback / link-local.
    private static final Pattern RFC1918_10 = Pattern.compile("^10\\.");
    private static final Pattern RFC1918_172 = Pattern.compile("^172\\.(1[6-9]|2[0-9]|3[0-1])\\.");
    private static final Pattern RFC1918_192 = Pattern.compile("^192\\.168\\.");
    private static final Pattern LOOPBACK_V4 = Pattern.compile("^127\\.");
    private static final Pattern LINK_LOCAL_V4 = Pattern.compile("^169\\.254\\.");

    private UrlSafetyValidator() {}

    public static boolean isSafeUrl(String url) {
        if (url == null || url.isBlank()) {
            return false;
        }

        URI uri;
        try {
            uri = new URI(url.trim());
        } catch (URISyntaxException e) {
            return false;
        }

        String scheme = uri.getScheme();
        if (scheme == null) {
            return false;
        }

        if (!ALLOWED_SCHEMES.contains(scheme.toLowerCase())) {
            return false;
        }

        // Credentials embedded in the authority component (user[:password]@host).
        if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
            return false;
        }

        String host = uri.getHost();
        if (host == null || host.isBlank()) {
            return false;
        }

        return !isBlockedHost(host);
    }

    private static boolean isBlockedHost(String host) {
        String h = host.toLowerCase();

        if (h.equals("localhost") || h.equals("::1")) return true;
        if (h.startsWith("fe80:") || h.startsWith("[fe80:")) return true;

        if (LOOPBACK_V4.matcher(h).find()) return true;
        if (LINK_LOCAL_V4.matcher(h).find()) return true;
        if (RFC1918_10.matcher(h).find()) return true;
        if (RFC1918_172.matcher(h).find()) return true;
        if (RFC1918_192.matcher(h).find()) return true;

        return false;
    }
}
