import { describeRelativeTime } from '../../../../src/frontend/utils/relativeTime';

const NOW = new Date('2026-05-21T12:00:00.000Z').getTime();
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

describe('describeRelativeTime', () => {
  it('reports "now" for gaps under a minute', () => {
    expect(describeRelativeTime(NOW - 30_000, NOW)).toEqual({ unit: 'now', count: 0 });
  });

  it('reports whole minutes', () => {
    expect(describeRelativeTime(NOW - 5 * MINUTE, NOW)).toEqual({ unit: 'minutes', count: 5 });
  });

  it('reports whole hours', () => {
    expect(describeRelativeTime(NOW - 3 * HOUR, NOW)).toEqual({ unit: 'hours', count: 3 });
  });

  it('reports whole days', () => {
    expect(describeRelativeTime(NOW - 2 * DAY, NOW)).toEqual({ unit: 'days', count: 2 });
  });

  it('reports whole weeks for week-plus gaps', () => {
    expect(describeRelativeTime(NOW - 3 * WEEK, NOW)).toEqual({ unit: 'weeks', count: 3 });
  });

  it('collapses future timestamps to "now"', () => {
    expect(describeRelativeTime(NOW + HOUR, NOW)).toEqual({ unit: 'now', count: 0 });
  });
});
