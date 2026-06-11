/**
 * Format a past Date relative to a reference now into a human-readable string.
 *
 * Buckets:
 *   delta < 60s         -> "just now"
 *   60s <= delta < 60min   -> "<N> minutes ago" (integer floor)
 *   60min <= delta < 24h   -> "<N> hours ago"
 *   1d <= delta < 30d      -> "<N> days ago"
 *   30d <= delta < 365d    -> "<N> months ago" (30-day months)
 *   delta >= 365d         -> "<N> years ago"
 *   delta < 0             -> "in the future"
 */

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = 3_600;
const SECONDS_PER_DAY = 86_400;
const SECONDS_PER_MONTH = SECONDS_PER_DAY * 30;
const SECONDS_PER_YEAR = SECONDS_PER_DAY * 365;

export function formatRelativeTime(past: Date, now: Date): string {
  const deltaSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (deltaSeconds < 0) {
    return "in the future";
  }

  if (deltaSeconds < SECONDS_PER_MINUTE) {
    return "just now";
  }

  if (deltaSeconds < SECONDS_PER_HOUR) {
    const minutes = Math.floor(deltaSeconds / SECONDS_PER_MINUTE);
    return `${minutes} minutes ago`;
  }

  if (deltaSeconds < SECONDS_PER_DAY) {
    const hours = Math.floor(deltaSeconds / SECONDS_PER_HOUR);
    return `${hours} hours ago`;
  }

  if (deltaSeconds < SECONDS_PER_MONTH) {
    const days = Math.floor(deltaSeconds / SECONDS_PER_DAY);
    return `${days} days ago`;
  }

  if (deltaSeconds < SECONDS_PER_YEAR) {
    const months = Math.floor(deltaSeconds / SECONDS_PER_MONTH);
    return `${months} months ago`;
  }

  const years = Math.floor(deltaSeconds / SECONDS_PER_YEAR);
  return `${years} years ago`;
}
