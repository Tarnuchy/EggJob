export type RelativeTimeUnit = 'now' | 'minutes' | 'hours' | 'days' | 'weeks';

export interface RelativeTime {
  unit: RelativeTimeUnit;
  /** Whole-number magnitude for the unit (0 for `now`). */
  count: number;
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

/**
 * Buckets the gap between `targetMs` and `nowMs` into a coarse relative-time
 * descriptor. Pure and locale-agnostic — the caller maps `unit` to i18n copy.
 * Future timestamps and `targetMs > nowMs` collapse to `now`.
 */
export function describeRelativeTime(targetMs: number, nowMs: number): RelativeTime {
  const diff = nowMs - targetMs;

  if (!Number.isFinite(diff) || diff < MINUTE) {
    return { unit: 'now', count: 0 };
  }
  if (diff < HOUR) {
    return { unit: 'minutes', count: Math.floor(diff / MINUTE) };
  }
  if (diff < DAY) {
    return { unit: 'hours', count: Math.floor(diff / HOUR) };
  }
  if (diff < WEEK) {
    return { unit: 'days', count: Math.floor(diff / DAY) };
  }
  return { unit: 'weeks', count: Math.floor(diff / WEEK) };
}
