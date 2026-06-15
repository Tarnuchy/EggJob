export type GreetingKey = 'morning' | 'afternoon' | 'evening' | 'night';

/** Maps a 0–23 hour to a time-of-day greeting bucket. */
export function getGreetingKey(hour: number): GreetingKey {
  if (hour >= 5 && hour <= 11) return 'morning';
  if (hour >= 12 && hour <= 17) return 'afternoon';
  if (hour >= 18 && hour <= 22) return 'evening';
  return 'night';
}
