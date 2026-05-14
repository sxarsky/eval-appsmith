package com.appsmith.util;

import java.time.Duration;
import java.time.Instant;

/**
 * Format a past instant relative to a reference now into a human-readable string.
 *
 * Buckets:
 *   delta &lt; 60s         -&gt; "just now"
 *   60s &le; delta &lt; 60min   -&gt; "&lt;N&gt; minutes ago" (integer floor)
 *   60min &le; delta &lt; 24h   -&gt; "&lt;N&gt; hours ago"
 *   1d &le; delta &lt; 30d      -&gt; "&lt;N&gt; days ago"
 *   30d &le; delta &lt; 365d    -&gt; "&lt;N&gt; months ago" (30-day months)
 *   delta &ge; 365d         -&gt; "&lt;N&gt; years ago"
 *   delta &lt; 0             -&gt; "in the future"
 */
public final class TimeFormatter {

    private TimeFormatter() {}

    private static final long SECONDS_PER_MINUTE = 60L;
    private static final long SECONDS_PER_HOUR = 3600L;
    private static final long SECONDS_PER_DAY = 86400L;
    private static final long SECONDS_PER_MONTH = SECONDS_PER_DAY * 30L;
    private static final long SECONDS_PER_YEAR = SECONDS_PER_DAY * 365L;

    public static String formatRelativeTime(Instant past, Instant now) {
        long deltaSeconds = Duration.between(past, now).getSeconds();

        if (deltaSeconds < 0) {
            return "in the future";
        }

        if (deltaSeconds < SECONDS_PER_MINUTE) {
            return "just now";
        }

        if (deltaSeconds < SECONDS_PER_HOUR) {
            long minutes = deltaSeconds / SECONDS_PER_MINUTE;
            return minutes + " minutes ago";
        }

        if (deltaSeconds < SECONDS_PER_DAY) {
            long hours = deltaSeconds / SECONDS_PER_HOUR;
            return hours + " hours ago";
        }

        if (deltaSeconds < SECONDS_PER_MONTH) {
            long days = deltaSeconds / SECONDS_PER_DAY;
            return days + " days ago";
        }

        if (deltaSeconds < SECONDS_PER_YEAR) {
            long months = deltaSeconds / SECONDS_PER_MONTH;
            return months + " months ago";
        }

        long years = deltaSeconds / SECONDS_PER_YEAR;
        return years + " years ago";
    }
}
